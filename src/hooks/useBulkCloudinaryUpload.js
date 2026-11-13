import { useCallback, useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { hashFile } from "../media/hashFile";
import { uploadToCloudinary } from "../media/cloudinaryUpload";
import API_BASE_URL from "../apiConfig";

const API_BASE = API_BASE_URL;
const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024;
const DEFAULT_THRESHOLD_BYTES = 20 * 1024 * 1024;
const DEFAULT_CHUNK_BYTES = 8 * 1024 * 1024;
const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function readJsonResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.success) {
    const error = new Error(
      body?.message || `Request failed with status ${response.status}.`
    );
    error.status = response.status;
    error.duplicate = body?.duplicate === true;
    throw error;
  }

  return body;
}

function getMediaKind(file) {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "raw";
}

export default function useBulkCloudinaryUpload({ concurrency = 4 } = {}) {
  const [jobs, setJobs] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const jobsRef = useRef(new Map());
  const queueRef = useRef([]);
  const activeCountRef = useRef(0);
  const duplicateHashesRef = useRef(new Map());
  const compressionCountRef = useRef(0);
  const pumpRef = useRef(() => {});

  const publishJobs = useCallback(() => {
    setJobs([...jobsRef.current.values()]);
  }, []);

  const updateJob = useCallback(
    (job, patch) => {
      Object.assign(job, patch);
      jobsRef.current.set(job.id, job);
      publishJobs();
    },
    [publishJobs]
  );

  const runJob = useCallback(
    async (job) => {
      try {
        job.controller ||= new AbortController();

        if (!job.digest) {
          updateJob(job, { status: "hashing", error: "" });
          job.digest = await hashFile(job.file, job.controller.signal);

          const seenHashes =
            duplicateHashesRef.current.get(job.eventId) || new Map();
          const existingJobId = seenHashes.get(job.digest);
          if (existingJobId && existingJobId !== job.id) {
            updateJob(job, {
              status: "duplicate",
              error: "Another file in this batch has identical contents.",
            });
            return;
          }
          seenHashes.set(job.digest, job.id);
          duplicateHashesRef.current.set(job.eventId, seenHashes);

          const duplicateParams = new URLSearchParams({
            sha256: job.digest,
          });
          const duplicateResponse = await fetch(
            `${API_BASE}/api/media/events/${encodeURIComponent(
              job.eventId
            )}/duplicate-check?${duplicateParams}`,
            {
              credentials: "include",
              signal: job.controller.signal,
            }
          );
          const duplicateResult = await readJsonResponse(duplicateResponse);

          if (job.cancelRequested) {
            updateJob(job, { status: "canceled", error: "" });
            return;
          }

          if (duplicateResult.duplicate) {
            updateJob(job, {
              status: "duplicate",
              error: "This file is already in the selected event gallery.",
            });
            return;
          }
        }

        if (!job.signature) {
          updateJob(job, { status: "authorizing", error: "" });
          const signatureResponse = await fetch(`${API_BASE}/api/media/signature`, {
            method: "POST",
            credentials: "include",
            signal: job.controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: job.eventId,
              department: job.department,
              photographerName: job.photographerName,
              cameraModel: job.cameraModel,
              eventDay: job.eventDay,
              fileSize: job.file.size,
              sha256: job.digest,
              mediaKind: getMediaKind(job.file),
            }),
          });
          job.signature = await readJsonResponse(signatureResponse);
        }

        if (job.cancelRequested) {
          updateJob(job, { status: "canceled", error: "" });
          return;
        }

        let uploadFile = job.file;
        if (
          job.compress &&
          COMPRESSIBLE_TYPES.has(job.file.type) &&
          !job.compressedFile
        ) {
          if (!job.compressing) {
            job.compressing = true;
            compressionCountRef.current += 1;
            setIsCompressing(true);
          }
          updateJob(job, { status: "compressing" });
          job.compressedFile = await imageCompression(job.file, {
            maxSizeMB: 12,
            maxWidthOrHeight: 6000,
            useWebWorker: true,
            preserveExif: true,
          });
          job.compressing = false;
          compressionCountRef.current = Math.max(
            compressionCountRef.current - 1,
            0
          );
          setIsCompressing(compressionCountRef.current > 0);
        }

        if (job.cancelRequested) {
          updateJob(job, { status: "canceled", error: "" });
          return;
        }

        uploadFile = job.compressedFile || job.file;
        job.transferSize = uploadFile.size;
        job.pauseRequested = false;
        job.cancelRequested = false;
        job.startedAt = job.startedAt || Date.now();
        updateJob(job, {
          status: "uploading",
          transferSize: job.transferSize,
          error: "",
        });

        const cloudinaryResult = await uploadToCloudinary({
          file: uploadFile,
          signature: job.signature,
          thresholdBytes:
            job.signature.chunkThresholdBytes || DEFAULT_THRESHOLD_BYTES,
          chunkSizeBytes: job.signature.chunkSizeBytes || DEFAULT_CHUNK_BYTES,
          uploadId: job.uploadId,
          resumeOffset: job.offset,
          signal: job.controller.signal,
          onProgress: (loaded, total) => {
            const now = Date.now();
            if (now - (job.lastProgressAt || 0) < 150 && loaded < total) {
              return;
            }
            job.lastProgressAt = now;
            const uploadedBytes = Math.min(loaded, job.transferSize);
            const elapsedSeconds = Math.max(
              (now - job.startedAt) / 1000,
              0.1
            );
            const bytesPerSecond = uploadedBytes / elapsedSeconds;

            updateJob(job, {
              uploadedBytes,
              percent: total > 0 ? Math.min((loaded / total) * 100, 99) : 0,
              bytesPerSecond,
              etaSeconds:
                bytesPerSecond > 0
                  ? Math.max((job.transferSize - uploadedBytes) / bytesPerSecond, 0)
                  : null,
            });
          },
          onOffset: (offset) => {
            job.offset = offset;
            updateJob(job, {
              uploadedBytes: Math.min(offset, job.transferSize || job.file.size),
              percent: Math.min((offset / uploadFile.size) * 100, 99),
            });
          },
          onRetry: (attempt) => {
            updateJob(job, {
              retryAttempt: attempt,
              error: `Connection interrupted; retrying (${attempt}/3)…`,
            });
          },
        });

        updateJob(job, {
          status: "complete",
          percent: 100,
          uploadedBytes: job.transferSize,
          etaSeconds: 0,
          asset: {
            publicId: cloudinaryResult.public_id,
            secureUrl: cloudinaryResult.secure_url,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            format: cloudinaryResult.format,
            bytes: cloudinaryResult.bytes,
            resourceType: cloudinaryResult.resource_type,
          },
          error: "Upload complete; Cloudinary is generating gallery previews.",
        });
      } catch (error) {
        if (job.compressing) {
          job.compressing = false;
          compressionCountRef.current = Math.max(
            compressionCountRef.current - 1,
            0
          );
          setIsCompressing(compressionCountRef.current > 0);
        }

        if (job.cancelRequested) {
          updateJob(job, { status: "canceled", error: "" });
        } else if (job.pauseRequested || error.name === "AbortError") {
          updateJob(job, {
            status: "paused",
            uploadedBytes: job.offset || 0,
            percent:
              job.offset && job.transferSize
                ? (job.offset / job.transferSize) * 100
                : 0,
            error: "",
          });
        } else if (error.duplicate) {
          updateJob(job, { status: "duplicate", error: error.message });
        } else {
          updateJob(job, {
            status: "error",
            error: error.message || "Upload failed.",
          });
        }
      } finally {
        job.controller = null;
      }
    },
    [updateJob]
  );

  const pump = useCallback(() => {
    while (
      activeCountRef.current < Math.min(Math.max(concurrency, 1), 8) &&
      queueRef.current.length > 0
    ) {
      const id = queueRef.current.shift();
      const job = jobsRef.current.get(id);

      if (!job || job.status !== "queued") {
        continue;
      }

      activeCountRef.current += 1;
      setActiveCount(activeCountRef.current);
      void runJob(job).finally(() => {
        activeCountRef.current -= 1;
        setActiveCount(activeCountRef.current);
        pumpRef.current();
      });
    }
  }, [concurrency, runJob]);

  useEffect(() => {
    pumpRef.current = pump;
  }, [pump]);

  const addFiles = useCallback(
    (fileList, options) => {
      const newJobs = Array.from(fileList).map((file) => {
        const id = crypto.randomUUID();

        return {
          id,
          file,
          name: file.name,
          size: file.size,
          eventId: options.eventId,
          department: options.department,
          photographerName: options.photographerName,
          cameraModel: options.cameraModel,
          eventDay: options.eventDay,
          compress: options.compress,
          status:
            file.size === 0 || file.size > MAX_FILE_BYTES
              ? "error"
              : "queued",
          error:
            file.size === 0
              ? "This file is empty."
              : file.size > MAX_FILE_BYTES
                ? "Files larger than 2 GB are not supported by this uploader."
                : "",
          percent: 0,
          uploadedBytes: 0,
          offset: 0,
          uploadId: crypto.randomUUID(),
          bytesPerSecond: 0,
          etaSeconds: null,
          retryAttempt: 0,
        };
      });

      for (const job of newJobs) {
        jobsRef.current.set(job.id, job);
        if (job.status === "queued") {
          queueRef.current.push(job.id);
        }
      }

      publishJobs();
      pumpRef.current();
      return newJobs.length;
    },
    [publishJobs]
  );

  const pause = useCallback(
    (id) => {
      const job = jobsRef.current.get(id);
      if (!job || job.status !== "uploading") {
        return;
      }

      job.pauseRequested = true;
      job.controller?.abort();
      updateJob(job, { status: "paused" });
    },
    [updateJob]
  );

  const resume = useCallback(
    (id) => {
      const job = jobsRef.current.get(id);
      if (!job || job.status !== "paused") {
        return;
      }

      job.status = "queued";
      job.pauseRequested = false;
      queueRef.current.push(id);
      publishJobs();
      pumpRef.current();
    },
    [publishJobs]
  );

  const cancel = useCallback(
    (id) => {
      const job = jobsRef.current.get(id);
      if (!job || ["complete", "duplicate", "canceled"].includes(job.status)) {
        return;
      }

      job.cancelRequested = true;
      job.controller?.abort();
      if (!job.controller) {
        updateJob(job, { status: "canceled", error: "" });
      }
    },
    [updateJob]
  );

  const retry = useCallback(
    (id) => {
      const job = jobsRef.current.get(id);
      if (!job || !["error", "canceled"].includes(job.status)) {
        return;
      }

      job.cancelRequested = false;
      job.pauseRequested = false;
      job.status = "queued";
      queueRef.current.push(id);
      publishJobs();
      pumpRef.current();
    },
    [publishJobs]
  );

  const retryFailed = useCallback(() => {
    for (const job of jobsRef.current.values()) {
      if (job.status === "error") {
        job.status = "queued";
        job.cancelRequested = false;
        job.pauseRequested = false;
        queueRef.current.push(job.id);
      }
    }

    publishJobs();
    pumpRef.current();
  }, [publishJobs]);

  const clearFinished = useCallback(() => {
    for (const [id, job] of jobsRef.current) {
      if (["complete", "duplicate", "canceled"].includes(job.status)) {
        const eventHashes = duplicateHashesRef.current.get(job.eventId);
        if (eventHashes?.get(job.digest) === id) {
          eventHashes.delete(job.digest);
        }
        jobsRef.current.delete(id);
      }
    }

    publishJobs();
  }, [publishJobs]);

  const clearAll = useCallback(() => {
    for (const job of jobsRef.current.values()) {
      job.cancelRequested = true;
      job.controller?.abort();
    }

    jobsRef.current.clear();
    queueRef.current = [];
    duplicateHashesRef.current.clear();
    compressionCountRef.current = 0;
    setIsCompressing(false);
    publishJobs();
  }, [publishJobs]);

  return {
    jobs,
    activeCount,
    isCompressing,
    addFiles,
    pause,
    resume,
    cancel,
    retry,
    retryFailed,
    clearFinished,
    clearAll,
  };
}
