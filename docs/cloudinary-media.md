# Cloudinary event media

This integration uses the repository's existing Vite/React JSX frontend and
Node/Express server. Cloudinary credentials, upload policy, and public IDs are
controlled by the server; the browser receives only a short-lived signature
for one event upload.

## 1. Cloudinary dashboard and environment checklist

1. Create a Cloudinary product environment and note its **cloud name**, **API
   key**, and **API secret**.
2. Create three **signed** upload presets:
   - `college_image_signed`: only the image formats the college accepts;
     enable JPEG, PNG, WebP, TIFF, and any approved camera RAW formats.
   - `college_video_signed`: only approved video formats such as MP4 and MOV.
   - `college_raw_signed`: only approved RAW/archive formats.
   - Do not enable unsigned uploads. Set the account/preset file-size ceilings
     to the actual plan-supported limits (the application defaults to 2 GiB per
     file). The Cloudinary preset/account limit is authoritative.
   - Leave the preset folder and incoming/eager transformations unset: the
     signed server parameters set the event folder and transformations. Avoid
     a preset folder that conflicts with the signed folder.
   - Set access/delivery to **public** only if these college event images are
     intended for the public website gallery.
3. Configure the Cloudinary notification URL to the publicly reachable HTTPS
   endpoint below. If the account dashboard has notification event selection,
   enable upload/eager completion notifications. Eager notifications are also
   provided per upload.
4. Copy `server/.env.example` to `server/.env.local` and set:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET` (server only; never use a `VITE_` name)
   - `CLOUDINARY_IMAGE_UPLOAD_PRESET`
   - `CLOUDINARY_VIDEO_UPLOAD_PRESET`
   - `CLOUDINARY_RAW_UPLOAD_PRESET`
   - `CLOUDINARY_WEBHOOK_URL`, for example
     `https://api.example.edu/api/media/cloudinary/webhook`
   - `CLOUDINARY_MAX_FILE_BYTES` to a number not exceeding the Cloudinary
     account and preset limits.
5. Set `FRONTEND_URL` or comma-separated `FRONTEND_ORIGINS` on the Express
   server to the deployed Vite site origin(s), without paths. Local Vite
   origins remain allowed.
6. If using the optional incoming resolution cap, enable Cloudinary backups
   first, set `CLOUDINARY_BACKUP_ENABLED=true`, and then set
   `CLOUDINARY_INCOMING_TRANSFORMATION` (for example
   `c_limit,w_6000,h_6000`). Incoming transformations alter the stored asset;
   the original can only be restored if the Cloudinary account has backups
   enabled. By default this setting is blank and the uploaded source is kept
   untouched; eager/delivery transformations create optimized derivatives.
7. Apply `server/migrations/002_cloudinary_assets.sql` to the same database as
   the `events` table before enabling the API.
8. Configure `VITE_API_BASE_URL` for the deployed API. Optionally configure
   `VITE_CLOUDINARY_CLOUD_NAME` for an immediate client-side delivery
   configuration; the public cloud name is also returned by the API.
9. Apply `server/migrations/003_site_content.sql` and
   `server/migrations/004_cloudinary_content_assets.sql` in order. The latter
   adds the Cloudinary image library and `image_public_id` references for
   department and event records.
10. Optionally set `CLOUDINARY_CONTENT_MAX_FILE_BYTES` (default 15 MiB) to a
    limit no larger than the Cloudinary preset/account limit. The admin image
    uploader compresses large JPEG/PNG/WebP files in the browser, then sends a
    signed image upload directly to Cloudinary.

Do not put the API secret in Vite environment variables, browser code, HTML,
or a committed file. If it is exposed, rotate it in the Cloudinary dashboard.

## 2. Backend API

`server/mediaRoutes.js` is mounted at `/api/media` after Express session setup.

| Method and path | Access | Purpose |
| --- | --- | --- |
| `GET /api/media/events` | Public | Lists active events for upload/gallery selection. |
| `POST /api/media/signature` | Admin session | Validates event, metadata, size, hash, and duplicate state; returns a Cloudinary signature and fixed upload parameters. |
| `GET /api/media/events/:eventId/duplicate-check?sha256=...` | Admin session | Checks an event's stored SHA-256 values before upload. |
| `POST /api/media/cloudinary/webhook` | Cloudinary signature | Verifies the raw body and timestamp, then idempotently records completed media. |
| `GET /api/media/events/:eventId/assets` | Public | Cursor-paginates ready event photographs. |
| `GET /api/media/events/:eventId/archive` | Public | Generates a short-lived ZIP URL for the event or validated selected photo IDs. |
| `POST /api/media/content/signature` | Admin session | Signs one limited-size image upload for a fixed website content folder. |
| `POST /api/media/content/complete` | Admin session | Verifies the Cloudinary resource and uploader context before adding it to the media library. |
| `GET /api/media/content/assets?type=...` | Admin session | Lists ready images in the selected website content library. |
| `DELETE /api/media/content/assets/:id` | Admin session | Removes an unused image from Cloudinary; deletion is blocked while content references it. |

The signature endpoint derives
`college_events/{academic_year}/{event_slug}` from the selected event's date
and title; folder paths are never accepted from the browser. The browser
provides a UUID digest, event selection, and the photographer/camera/day
metadata. The server derives the uploader ID and role from the admin session,
validates the department, builds tags/context, chooses the signed preset by
media type, and signs the complete parameter set.

Cloudinary stores files directly, not through Express. The server receives
only completion notifications, verifies them with the Cloudinary SDK against
the raw request body and a five-minute timestamp window, and saves an
idempotent asset record. The original source is unchanged by default. Eager
400/800/1600-pixel derivatives are asynchronous; `f_auto,q_auto` is also
applied at delivery time. ZIP links expire after ten minutes and selected ZIPs
are limited to 500 photos.

## 3. Frontend uploader, utilities, and gallery

- `src/hooks/useBulkCloudinaryUpload.js` manages a four-item upload pool and
  per-file hashing, signature, compression, progress, ETA, retry, pause,
  resume, cancellation, and duplicate states.
- `src/media/fileHash.worker.js` streams SHA-256 in a Web Worker; it does not
  read an entire large RAW/video file into one main-thread buffer.
- `src/media/cloudinaryUpload.js` uses `FormData`/XHR for progress and retries.
  At 20 MiB it switches to 8 MiB Cloudinary chunks with
  `Content-Range` and `X-Unique-Upload-Id`. Pause/resume is available while the
  current page remains open; it is not a persisted cross-browser-session
  upload checkpoint.
- Optional image compression uses a worker and asks to preserve EXIF. It does
  not compress videos or RAW files.
- The signed uploader is at `/admin/media`; it checks the admin session before
  showing the queue.
- Faculty, placement students, gallery entries, events, and departments use
  the dashboard's signed image uploader. It supports previews, upload
  progress/cancellation, browser compression for large JPEG/PNG/WebP images,
  selecting existing assets from the section library, and safe deletion of
  unused assets.
- The public photo gallery is at `/event-media` and `/event-media/:eventId`.
  `CloudinaryEventGallery` uses `@cloudinary/react` with lazy-load, responsive,
  and blur-placeholder plugins plus `masonic`'s virtualized masonry renderer.
  Favorites are browser-local and can be downloaded as a selected ZIP.

## 4. Operational notes

- Apply the database migration and configure the three signed presets before
  accepting uploads. A signature is rejected if the provider settings are
  missing.
- The preset/provider upload ceilings should be at least as strict as the
  operational file policy. The client-side size check is a UX check, not a
  substitute for the Cloudinary preset's server-enforced maximum.
- Webhook delivery requires a stable, public HTTPS server. Local development
  needs an HTTPS tunnel if you want uploaded files to appear in the gallery;
  Cloudinary cannot call `localhost`.
- Monitor Cloudinary storage, transformations, and archive usage. Public
  galleries and signed upload access are intentional; do not upload private
  student records or sensitive images to a public delivery account.
