function createAbortError() {
  return new DOMException("Upload paused or canceled.", "AbortError");
}

function appendSignedFields(form, signature) {
  form.append("api_key", signature.apiKey);
  form.append("signature", signature.signature);

  for (const [key, value] of Object.entries(signature.params)) {
    if (value === undefined || value === null || key === "api_key") {
      continue;
    }

    form.append(key, typeof value === "boolean" ? String(value) : value);
  }
}

function uploadRequest({
  file,
  url,
  start,
  end,
  total,
  signature,
  includeSignature,
  uploadId,
  signal,
  onProgress,
}) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }

    const xhr = new XMLHttpRequest();
    const form = new FormData();
    const chunk = file.slice(start, end);

    if (includeSignature) {
      appendSignedFields(form, signature);
    }

    form.append("file", chunk, file.name);
    xhr.open("POST", url);
    xhr.timeout = 120000;

    if (total > chunk.size) {
      xhr.setRequestHeader(
        "Content-Range",
        `bytes ${start}-${end - 1}/${total}`
      );
      xhr.setRequestHeader("X-Unique-Upload-Id", uploadId);
    }

    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      xhr.abort();
      cleanup();
      reject(createAbortError());
    };

    signal.addEventListener("abort", onAbort, { once: true });

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(start + Math.min(event.loaded, chunk.size), total);
      }
    };

    xhr.onerror = () => {
      cleanup();
      const error = new Error("Network connection interrupted during upload.");
      error.retryable = true;
      reject(error);
    };

    xhr.ontimeout = () => {
      cleanup();
      const error = new Error("Upload request timed out.");
      error.retryable = true;
      reject(error);
    };

    xhr.onabort = () => {
      cleanup();
      reject(createAbortError());
    };

    xhr.onload = () => {
      cleanup();
      let payload;

      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Cloudinary returned an unreadable upload response."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const error = new Error(
          payload?.error?.message || `Cloudinary upload failed (${xhr.status}).`
        );
        error.retryable = xhr.status === 408 || xhr.status === 429 || xhr.status >= 500;
        reject(error);
        return;
      }

      resolve(payload);
    };

    xhr.send(form);
  });
}

async function retryRequest(request, signal, onRetry) {
  const maxAttempts = 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      if (signal.aborted || error.name === "AbortError") {
        throw createAbortError();
      }

      if (!error.retryable || attempt === maxAttempts) {
        throw error;
      }

      onRetry(attempt);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, Math.min(8000, 500 * 2 ** (attempt - 1)));
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timeout);
            reject(createAbortError());
          },
          { once: true }
        );
      });
    }
  }

  throw new Error("Cloudinary upload retries were exhausted.");
}

export async function uploadToCloudinary({
  file,
  signature,
  thresholdBytes,
  chunkSizeBytes,
  uploadId = crypto.randomUUID(),
  resumeOffset = 0,
  signal,
  onProgress,
  onOffset,
  onRetry,
}) {
  if (file.size < thresholdBytes) {
    const response = await retryRequest(
      () =>
        uploadRequest({
          file,
          url: signature.uploadUrl,
          start: 0,
          end: file.size,
          total: file.size,
          signature,
          includeSignature: true,
          uploadId,
          signal,
          onProgress,
        }),
      signal,
      onRetry
    );
    onOffset(file.size);
    return response;
  }

  let offset = Math.min(Math.max(resumeOffset, 0), file.size);
  let response = null;

  while (offset < file.size) {
    if (signal.aborted) {
      throw createAbortError();
    }

    const start = offset;
    const end = Math.min(start + chunkSizeBytes, file.size);
    response = await retryRequest(
      () =>
        uploadRequest({
          file,
          url: signature.uploadUrl,
          start,
          end,
          total: file.size,
          signature,
          includeSignature: start === 0,
          uploadId,
          signal,
          onProgress,
        }),
      signal,
      onRetry
    );

    offset = end;
    onOffset(offset);
  }

  return response;
}
