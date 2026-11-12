let nextWorkerRequestId = 0;

export function hashFile(file, signal) {
  return new Promise((resolve, reject) => {
    const requestId = ++nextWorkerRequestId;
    const worker = new Worker(
      new URL("./fileHash.worker.js", import.meta.url),
      { type: "module" }
    );
    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException("File hashing canceled.", "AbortError"));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }

    signal?.addEventListener("abort", onAbort, { once: true });

    worker.onmessage = (event) => {
      if (event.data?.id !== requestId) {
        return;
      }

      cleanup();

      if (event.data.error) {
        reject(new Error(event.data.error));
        return;
      }

      resolve(event.data.digest);
    };

    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message || "Unable to hash this file."));
    };

    worker.postMessage({ id: requestId, file });
  });
}
