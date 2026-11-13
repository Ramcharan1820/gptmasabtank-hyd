import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { ImagePlus, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import "./AdminImageField.css";
import API_BASE_URL, { getAdminAuthHeaders } from "../apiConfig";

const API_BASE = API_BASE_URL;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function readJson(response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Request failed (${response.status}).`);
  }
  return result;
}

function uploadFile(file, signature, signal, onProgress) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Upload canceled.", "AbortError"));
      return;
    }

    const request = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("api_key", signature.apiKey);
    formData.append("signature", signature.signature);
    for (const [key, value] of Object.entries(signature.params)) {
      if (value !== undefined && value !== null && key !== "api_key") {
        formData.append(key, typeof value === "boolean" ? String(value) : value);
      }
    }

    const cleanup = () => signal.removeEventListener("abort", abort);
    const abort = () => request.abort();
    signal.addEventListener("abort", abort, { once: true });

    request.open("POST", signature.uploadUrl);
    request.timeout = 120000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => {
      cleanup();
      reject(new Error("Network connection interrupted during image upload."));
    };
    request.ontimeout = () => {
      cleanup();
      reject(new Error("Image upload timed out. Please try again."));
    };
    request.onabort = () => {
      cleanup();
      reject(new DOMException("Upload canceled.", "AbortError"));
    };
    request.onload = () => {
      cleanup();
      let result;
      try {
        result = JSON.parse(request.responseText);
      } catch {
        reject(new Error("Cloudinary returned an unreadable upload response."));
        return;
      }
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(result?.error?.message || `Cloudinary upload failed (${request.status}).`));
        return;
      }
      resolve(result);
    };
    request.send(formData);
  });
}

function formatBytes(bytes) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) <= 0) return "Unknown size";
  const size = Number(bytes);
  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(size / 1024)} KB`;
}

export default function AdminImageField({
  contentType,
  value,
  publicId,
  onChange,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const controllerRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const loadLibrary = async () => {
    setLibraryLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ type: contentType });
      const response = await fetch(
        `${API_BASE}/api/media/content/assets?${params}`,
        {
          credentials: "include",
          headers: { ...getAdminAuthHeaders() },
        }
      );
      const result = await readJson(response);
      setAssets(Array.isArray(result.data) ? result.data : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load the Cloudinary library.");
    } finally {
      setLibraryLoading(false);
    }
  };

  const toggleLibrary = async () => {
    if (libraryOpen) {
      setLibraryOpen(false);
      return;
    }
    setLibraryOpen(true);
    await loadLibrary();
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError("");

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Choose a JPEG, PNG, WebP, GIF, or AVIF image.");
      return;
    }
    if (file.size < 1 || file.size > MAX_FILE_BYTES) {
      setError("Image must be larger than 0 bytes and no larger than 15 MB.");
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setUploading(true);
    setProgress(0);

    try {
      let uploadImage = file;
      if (COMPRESSIBLE_TYPES.has(file.type) && file.size > 2 * 1024 * 1024) {
        uploadImage = await imageCompression(file, {
          maxSizeMB: 1.8,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
        });
      }

      const signatureResponse = await fetch(
        `${API_BASE}/api/media/content/signature`,
        {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify({
            contentType,
            fileSize: uploadImage.size,
            mimeType: uploadImage.type,
          }),
        }
      );
      const signature = await readJson(signatureResponse);
      const uploaded = await uploadFile(
        uploadImage,
        signature,
        controller.signal,
        setProgress
      );

      const completeResponse = await fetch(
        `${API_BASE}/api/media/content/complete`,
        {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...getAdminAuthHeaders(),
          },
          body: JSON.stringify({ publicId: uploaded.public_id }),
        }
      );
      const completed = await readJson(completeResponse);
      onChange({
        url: completed.data.secure_url,
        publicId: completed.data.public_id,
      });
      setProgress(100);
      if (libraryOpen) await loadLibrary();
    } catch (uploadError) {
      if (uploadError.name !== "AbortError") {
        setError(uploadError.message || "Image upload failed.");
      }
    } finally {
      controllerRef.current = null;
      setUploading(false);
    }
  };

  const deleteAsset = async (asset) => {
    if (!window.confirm("Permanently delete this image from Cloudinary?")) return;
    setDeletingId(asset.id);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/media/content/assets/${asset.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { ...getAdminAuthHeaders() },
        }
      );
      await readJson(response);
      if (publicId === asset.public_id) onChange({ url: "", publicId: "" });
      await loadLibrary();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this image.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-image-control">
      {value ? (
        <div className="admin-image-preview">
          <img src={value} alt="Selected upload preview" />
          <div className="admin-image-preview-actions">
            <span>{publicId ? "Cloudinary image" : "Current image"}</span>
            <button
              aria-label="Remove selected image"
              disabled={disabled || uploading}
              onClick={() => onChange({ url: "", publicId: "" })}
              type="button"
            >
              <X size={15} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-image-empty">
          <ImagePlus size={22} />
          <span>No image selected</span>
        </div>
      )}

      <div className="admin-image-toolbar">
        <button
          className="admin-image-button primary"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          {uploading ? <LoaderCircle className="admin-image-spin" size={16} /> : <Upload size={16} />}
          {uploading ? `Uploading ${progress}%` : value ? "Upload replacement" : "Upload image"}
        </button>
        <button
          className="admin-image-button"
          disabled={disabled || uploading}
          onClick={toggleLibrary}
          type="button"
        >
          Cloudinary library
        </button>
        {uploading && (
          <button
            className="admin-image-button"
            onClick={() => controllerRef.current?.abort()}
            type="button"
          >
            Cancel upload
          </button>
        )}
      </div>

      {uploading && (
        <div className="admin-image-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      <input
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="admin-image-file-input"
        disabled={disabled || uploading}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        ref={fileInputRef}
        type="file"
      />

      {error && <p className="admin-image-error" role="alert">{error}</p>}

      {libraryOpen && (
        <div className="admin-image-library">
          <div className="admin-image-library-heading">
            <strong>Cloudinary image library</strong>
            <button
              aria-label="Close image library"
              onClick={() => setLibraryOpen(false)}
              type="button"
            >
              <X size={16} />
            </button>
          </div>
          {libraryLoading ? (
            <p className="admin-image-library-empty">Loading images…</p>
          ) : assets.length === 0 ? (
            <p className="admin-image-library-empty">No uploaded images in this section yet.</p>
          ) : (
            <div className="admin-image-library-grid">
              {assets.map((asset) => (
                <article className="admin-image-library-item" key={asset.id}>
                  <button
                    className="admin-image-library-select"
                    onClick={() => {
                      onChange({ url: asset.secure_url, publicId: asset.public_id });
                      setLibraryOpen(false);
                    }}
                    title={`Select ${asset.public_id}`}
                    type="button"
                  >
                    <img src={asset.secure_url} alt="" loading="lazy" />
                    <span>{formatBytes(asset.bytes)}</span>
                  </button>
                  <button
                    aria-label={`Delete ${asset.public_id} from Cloudinary`}
                    className="admin-image-library-delete"
                    disabled={deletingId === asset.id}
                    onClick={() => deleteAsset(asset)}
                    title="Delete from Cloudinary"
                    type="button"
                  >
                    {deletingId === asset.id ? <LoaderCircle className="admin-image-spin" size={14} /> : <Trash2 size={14} />}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
