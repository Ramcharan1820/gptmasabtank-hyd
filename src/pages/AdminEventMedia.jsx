import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Image,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CloudinaryEventGallery from "../components/CloudinaryEventGallery";
import useBulkCloudinaryUpload from "../hooks/useBulkCloudinaryUpload";
import API_BASE_URL, { getAdminAuthHeaders, clearAdminToken } from "../apiConfig";
import "./AdminEventMedia.css";

const API_BASE = API_BASE_URL;
const DEPARTMENTS = [
  ["college-wide", "College-wide"],
  ["automobile", "Automobile Engineering"],
  ["civil", "Civil Engineering"],
  ["cse", "Computer Science & Engineering"],
  ["ece", "Electronics & Communication Engineering"],
  ["eee", "Electrical & Electronics Engineering"],
  ["mechanical", "Mechanical Engineering"],
  ["pharmacy", "Pharmacy"],
];
const TERMINAL_STATUSES = new Set(["complete", "duplicate", "canceled"]);

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "Calculating…";
  }

  if (seconds < 60) {
    return `${Math.ceil(seconds)} sec`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

function statusLabel(status) {
  return (
    {
      queued: "Queued",
      hashing: "Checking duplicate",
      authorizing: "Preparing secure upload",
      compressing: "Compressing",
      uploading: "Uploading",
      paused: "Paused",
      complete: "Uploaded",
      duplicate: "Duplicate skipped",
      canceled: "Canceled",
      error: "Failed",
    }[status] || status
  );
}

export default function AdminEventMedia() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [department, setDepartment] = useState("college-wide");
  const [photographerName, setPhotographerName] = useState("");
  const [cameraModel, setCameraModel] = useState("Not recorded");
  const [eventDay, setEventDay] = useState("");
  const [compress, setCompress] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
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
  } = useBulkCloudinaryUpload({ concurrency: 4 });

  useEffect(() => {
    let active = true;

    const authHeaders = getAdminAuthHeaders();

    Promise.all([
      fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
        headers: { ...authHeaders },
      }),
      fetch(`${API_BASE}/api/media/events`, {
        credentials: "include",
        headers: { ...authHeaders },
      }),
    ])
      .then(async ([sessionResponse, eventResponse]) => {
        const [session, eventPayload] = await Promise.all([
          sessionResponse.json(),
          eventResponse.json(),
        ]);

        if (!sessionResponse.ok || !session.authenticated) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }

        if (!eventResponse.ok || !eventPayload?.success) {
          throw new Error(
            eventPayload?.message || "Unable to load events for media upload."
          );
        }

        if (active) {
          const availableEvents = eventPayload.data || [];
          setEvents(availableEvents);
          setEventId(String(availableEvents[0]?.id || ""));
          setPhotographerName(session.admin?.name || "");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Unable to initialize media tools.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const selectedEvent = events.find((event) => String(event.id) === eventId);
  const selectedEventDate = selectedEvent?.event_date
    ? String(selectedEvent.event_date).slice(0, 10)
    : "";
  const effectiveEventDay = eventDay || selectedEventDate;
  const totalBytes = jobs.reduce((total, job) => total + job.size, 0);
  const transferredBytes = jobs.reduce(
    (total, job) =>
      total +
      (TERMINAL_STATUSES.has(job.status) && job.status === "complete"
        ? job.size
        : Math.min(job.uploadedBytes || 0, job.size)),
    0
  );
  const batchProgress = totalBytes
    ? Math.min((transferredBytes / totalBytes) * 100, 100)
    : 0;
  const failedCount = jobs.filter((job) => job.status === "error").length;
  const queuedCount = jobs.filter((job) =>
    ["queued", "hashing", "authorizing", "compressing", "uploading"].includes(
      job.status
    )
  ).length;
  const queueSummary = useMemo(
    () =>
      `${jobs.length} file${jobs.length === 1 ? "" : "s"} · ${formatBytes(
        totalBytes
      )}`,
    [jobs.length, totalBytes]
  );

  const addSelectedFiles = (fileList) => {
    if (!selectedEvent) {
      setError("Create or select an active event before adding files.");
      return;
    }

    if (!photographerName.trim()) {
      setError("Enter the photographer name before adding files.");
      return;
    }

    if (!effectiveEventDay) {
      setError("Set the date for the event photographs.");
      return;
    }

    setError("");
    addFiles(fileList, {
      eventId: selectedEvent.id,
      department,
      photographerName: photographerName.trim(),
      cameraModel: cameraModel.trim() || "Not recorded",
      eventDay: effectiveEventDay,
      compress,
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    addSelectedFiles(event.dataTransfer.files);
  };

  if (loading) {
    return (
      <main className="event-media-page event-media-loading">
        <LoaderCircle className="event-media-spin" size={26} />
        Checking administrator access…
      </main>
    );
  }

  return (
    <main className="event-media-page">
      <header className="event-media-header">
        <div className="event-media-header-inner">
          <Link className="event-media-back" to="/admin/dashboard">
            <ArrowLeft size={17} />
            Admin dashboard
          </Link>
          <span className="event-media-eyebrow">COLLEGE MEDIA LIBRARY</span>
          <h1>Event media manager</h1>
          <p>Upload event photography directly to Cloudinary with signed access.</p>
        </div>
      </header>

      <section className="event-media-content">
        <nav aria-label="Media manager sections" className="event-media-tabs">
          <button
            aria-pressed={activeTab === "upload"}
            className={activeTab === "upload" ? "active" : ""}
            onClick={() => setActiveTab("upload")}
            type="button"
          >
            <Upload size={17} />
            Bulk uploader
          </button>
          <button
            aria-pressed={activeTab === "gallery"}
            className={activeTab === "gallery" ? "active" : ""}
            onClick={() => setActiveTab("gallery")}
            type="button"
          >
            <Image size={17} />
            Event gallery
          </button>
        </nav>

        {error && (
          <div className="event-media-alert" role="alert">
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError("")} type="button">
              <X size={17} />
            </button>
          </div>
        )}

        {activeTab === "gallery" ? (
          <CloudinaryEventGallery
            key={eventId}
            initialEventId={eventId}
          />
        ) : (
          <>
            <section className="event-media-card">
              <div className="event-media-card-heading">
                <div>
                  <span className="event-media-eyebrow">UPLOAD DETAILS</span>
                  <h2>Choose event and photo metadata</h2>
                </div>
                <span className="event-media-security">
                  Signed uploads · secret stays on server
                </span>
              </div>

              {events.length === 0 ? (
                <div className="event-media-empty">
                  No active events are available. Add an event in the admin dashboard first.
                </div>
              ) : (
                <div className="event-media-fields">
                  <label>
                    <span>Event</span>
                    <select
                      onChange={(event) => {
                        setEventId(event.target.value);
                        setEventDay("");
                      }}
                      value={eventId}
                    >
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Department tag</span>
                    <select
                      onChange={(event) => setDepartment(event.target.value)}
                      value={department}
                    >
                      {DEPARTMENTS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Photographer name</span>
                    <input
                      maxLength={120}
                      onChange={(event) => setPhotographerName(event.target.value)}
                      placeholder="Photographer or media team"
                      value={photographerName}
                    />
                  </label>
                  <label>
                    <span>Camera model</span>
                    <input
                      maxLength={120}
                      onChange={(event) => setCameraModel(event.target.value)}
                      placeholder="e.g. Camera body or Not recorded"
                      value={cameraModel}
                    />
                  </label>
                  <label>
                    <span>Event day</span>
                    <input
                      onChange={(event) => setEventDay(event.target.value)}
                      type="date"
                      value={effectiveEventDay}
                    />
                  </label>
                </div>
              )}

              <label className="event-media-compress">
                <input
                  checked={compress}
                  onChange={(event) => setCompress(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  <strong>Compress supported photos before upload</strong>
                  <small>
                    JPEG, PNG and WebP only; runs in a Web Worker and preserves EXIF metadata.
                    RAW files and video remain untouched.
                  </small>
                </span>
              </label>

              <div
                className={`event-media-dropzone${dragging ? " is-dragging" : ""}`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setDragging(false);
                  }
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <span className="event-media-drop-icon">
                  {isCompressing ? (
                    <LoaderCircle className="event-media-spin" size={28} />
                  ) : (
                    <CloudUpload size={30} />
                  )}
                </span>
                <h3>Drop photos or videos here</h3>
                <p>
                  Upload hundreds of files at once. Transfers run in a four-file pool;
                  files over 20 MB are sent in resumable chunks.
                </p>
                <button
                  disabled={!selectedEvent}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Choose files
                </button>
                <input
                  accept="image/*,video/*,.cr2,.nef,.arw,.dng,.raw,.zip"
                  className="event-media-file-input"
                  multiple
                  onChange={(event) => {
                    addSelectedFiles(event.target.files);
                    event.target.value = "";
                  }}
                  ref={fileInputRef}
                  type="file"
                />
                <span className="event-media-drop-note">
                  Maximum 2 GB per file · files are hashed before upload to prevent duplicates
                </span>
              </div>
            </section>

            {jobs.length > 0 && (
              <section className="event-media-card event-media-queue">
                <div className="event-media-queue-heading">
                  <div>
                    <span className="event-media-eyebrow">UPLOAD QUEUE</span>
                    <h2>{queueSummary}</h2>
                  </div>
                  <div className="event-media-queue-actions">
                    {failedCount > 0 && (
                      <button onClick={retryFailed} type="button">
                        <RotateCcw size={15} />
                        Retry failed ({failedCount})
                      </button>
                    )}
                    <button onClick={clearFinished} type="button">
                      <Trash2 size={15} />
                      Clear finished
                    </button>
                  </div>
                </div>

                <div
                  aria-label="Overall upload progress"
                  className="event-media-overall-progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(batchProgress)}
                >
                  <span style={{ width: `${batchProgress}%` }} />
                </div>
                <div className="event-media-overall-caption">
                  <span>
                    {Math.round(batchProgress)}% transferred · {activeCount} active ·{" "}
                    {queuedCount} in progress
                  </span>
                  <span>{formatBytes(transferredBytes)} / {formatBytes(totalBytes)}</span>
                </div>

                <div className="event-media-jobs">
                  {jobs.map((job) => (
                    <article className="event-media-job" key={job.id}>
                      <div className="event-media-job-icon">
                        {job.status === "complete" ? (
                          <CheckCircle2 size={20} />
                        ) : job.status === "uploading" ? (
                          <LoaderCircle className="event-media-spin" size={20} />
                        ) : (
                          <Image size={20} />
                        )}
                      </div>
                      <div className="event-media-job-main">
                        <div className="event-media-job-title">
                          <strong title={job.name}>{job.name}</strong>
                          <span>{formatBytes(job.size)}</span>
                        </div>
                        <div className="event-media-job-progress">
                          <span style={{ width: `${job.percent || 0}%` }} />
                        </div>
                        <div className="event-media-job-meta">
                          <span className={`status-${job.status}`}>
                            {statusLabel(job.status)}
                          </span>
                          {job.status === "uploading" && (
                            <span>
                              {formatBytes(job.bytesPerSecond || 0)}/s · ETA{" "}
                              {formatDuration(job.etaSeconds)}
                            </span>
                          )}
                          {job.retryAttempt > 0 && (
                            <span>Retry {job.retryAttempt}/3</span>
                          )}
                          {job.error && (
                            <span className={job.status === "error" ? "job-error" : ""}>
                              {job.error}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="event-media-job-actions">
                        {job.status === "uploading" && (
                          <button
                            aria-label={`Pause ${job.name}`}
                            onClick={() => pause(job.id)}
                            type="button"
                          >
                            <Pause size={16} />
                          </button>
                        )}
                        {job.status === "paused" && (
                          <button
                            aria-label={`Resume ${job.name}`}
                            onClick={() => resume(job.id)}
                            type="button"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        {["error", "canceled"].includes(job.status) && (
                          <button
                            aria-label={`Retry ${job.name}`}
                            onClick={() => retry(job.id)}
                            type="button"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        {!TERMINAL_STATUSES.has(job.status) && (
                          <button
                            aria-label={`Cancel ${job.name}`}
                            onClick={() => cancel(job.id)}
                            type="button"
                          >
                            <X size={17} />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
