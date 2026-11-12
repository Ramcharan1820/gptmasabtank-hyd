const express = require("express");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

const DEPARTMENTS = new Set([
  "automobile",
  "civil",
  "college-wide",
  "cse",
  "ece",
  "eee",
  "mechanical",
  "pharmacy",
]);
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const EVENT_ID_PATTERN = /^\d{1,10}$/;
const CONTEXT_VALUE_PATTERN = /^[^|=\u0000-\u001f\u007f]{1,120}$/;
const EAGER_TRANSFORMATIONS = [
  "c_limit,w_400,h_400/f_auto,q_auto",
  "c_limit,w_800,h_800/f_auto,q_auto",
  "c_limit,w_1600,h_1600/f_auto,q_auto",
].join("|");
const MAX_ARCHIVE_ITEMS = 500;
const CONTENT_ASSET_TYPES = new Set([
  "faculty",
  "placements",
  "gallery",
  "events",
  "departments",
]);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  signature_version: 2,
});

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET &&
    process.env.CLOUDINARY_VIDEO_UPLOAD_PRESET &&
    process.env.CLOUDINARY_RAW_UPLOAD_PRESET &&
    process.env.CLOUDINARY_WEBHOOK_URL
  );
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function academicYearFromDate(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("The event date is invalid.");
  }

  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

function validateContextValue(value, label) {
  if (
    typeof value !== "string" ||
    !CONTEXT_VALUE_PATTERN.test(value.trim())
  ) {
    throw new Error(`${label} must be 1–120 characters without separators.`);
  }

  return value.trim();
}

function serializeContext(context) {
  return Object.entries(context)
    .map(([key, value]) => `${key}=${value}`)
    .join("|");
}

function normalizeWebhookRecord(payload) {
  const context = payload?.context?.custom || {};
  const eventId = Number(context.event_id);
  const adminId = Number(context.uploader_admin_id);

  if (
    !Number.isSafeInteger(eventId) ||
    eventId < 1 ||
    !Number.isSafeInteger(adminId) ||
    adminId < 1 ||
    typeof payload.public_id !== "string" ||
    !["image", "video", "raw"].includes(payload.resource_type) ||
    typeof payload.secure_url !== "string"
  ) {
    return null;
  }

  return {
    eventId,
    adminId,
    publicId: payload.public_id,
    resourceType: payload.resource_type,
    deliveryType: payload.type || "upload",
    format: typeof payload.format === "string" ? payload.format : null,
    secureUrl: payload.secure_url,
    bytes: Number.isSafeInteger(Number(payload.bytes))
      ? Number(payload.bytes)
      : 0,
    width: Number.isSafeInteger(Number(payload.width))
      ? Number(payload.width)
      : null,
    height: Number.isSafeInteger(Number(payload.height))
      ? Number(payload.height)
      : null,
    sha256: HASH_PATTERN.test(context.sha256) ? context.sha256 : null,
    metadata: {
      photographerName: context.photographer_name || null,
      cameraModel: context.camera_model || null,
      eventDay: context.event_day || null,
      department: context.department || null,
      uploaderRole: context.uploader_role || null,
      eager: Array.isArray(payload.eager)
        ? payload.eager.map((item) => ({
            format: item.format || null,
            width: item.width || null,
            height: item.height || null,
            bytes: item.bytes || null,
            secureUrl: item.secure_url || null,
            status: item.status || null,
          }))
        : [],
    },
  };
}

module.exports = function createMediaRouter({ db, requireAdmin }) {
  const router = express.Router();

  router.get("/events", async (req, res) => {
    try {
      const [events] = await db.execute(
        `SELECT id, title, CAST(event_date AS CHAR) AS event_date, category
         FROM events
         WHERE is_active = 1
         ORDER BY event_date DESC, id DESC`
      );

      return res.json({
        success: true,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
        data: events,
      });
    } catch (error) {
      console.error("Media event list error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to load event media.",
      });
    }
  });

  router.post("/content/signature", requireAdmin, async (req, res) => {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET ||
      !process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET
    ) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary image uploads are not configured on the server.",
      });
    }

    const { contentType, fileSize, mimeType } = req.body || {};
    const maxFileSize =
      Number(process.env.CLOUDINARY_CONTENT_MAX_FILE_BYTES) ||
      15 * 1024 * 1024;

    if (!CONTENT_ASSET_TYPES.has(contentType)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid content section for this image.",
      });
    }

    if (
      !Number.isSafeInteger(fileSize) ||
      fileSize < 1 ||
      fileSize > maxFileSize ||
      typeof mimeType !== "string" ||
      !/^image\/(jpeg|png|webp|gif|avif)$/i.test(mimeType)
    ) {
      return res.status(413).json({
        success: false,
        message: "Choose a supported image no larger than the configured upload limit.",
      });
    }

    try {
      const publicId = crypto.randomUUID();
      const contentFolder = `college_site_content/${contentType}`;
      const params = {
        timestamp: Math.floor(Date.now() / 1000),
        upload_preset: process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET,
        folder: contentFolder,
        public_id: publicId,
        use_asset_folder_as_public_id_prefix: true,
        unique_filename: false,
        overwrite: false,
        context: `content_type=${contentType}|uploader_admin_id=${req.session.admin.id}`,
      };
      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET
      );

      await db.execute(
        `INSERT INTO cloudinary_content_assets
          (uploader_admin_id, content_type, public_id, secure_url, status)
         VALUES (?, ?, ?, '', 'uploading')`,
        [req.session.admin.id, contentType, `${contentFolder}/${publicId}`]
      );

      return res.json({
        success: true,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          process.env.CLOUDINARY_CLOUD_NAME
        )}/image/upload`,
        signature,
        params,
      });
    } catch (error) {
      console.error("Content image signing error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to prepare a secure image upload.",
      });
    }
  });

  router.post("/content/complete", requireAdmin, async (req, res) => {
    const { publicId } = req.body || {};

    if (
      typeof publicId !== "string" ||
      !/^college_site_content\/(faculty|placements|gallery|events|departments)\/[0-9a-f-]{36}$/.test(
        publicId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid uploaded image reference.",
      });
    }

    try {
      const [pendingRows] = await db.execute(
        `SELECT id, content_type
         FROM cloudinary_content_assets
         WHERE public_id = ? AND uploader_admin_id = ? AND status = 'uploading'
         LIMIT 1`,
        [publicId, req.session.admin.id]
      );

      if (pendingRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Upload session not found or already completed.",
        });
      }

      const resource = await cloudinary.api.resource(publicId, {
        resource_type: "image",
        type: "upload",
        context: true,
      });
      const customContext = resource.context?.custom || {};

      if (
        customContext.content_type !== pendingRows[0].content_type ||
        String(customContext.uploader_admin_id) !== String(req.session.admin.id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Uploaded image ownership could not be verified.",
        });
      }

      const [updateResult] = await db.execute(
        `UPDATE cloudinary_content_assets
         SET secure_url = ?, format = ?, bytes = ?, width = ?, height = ?,
             status = 'ready'
         WHERE id = ? AND status = 'uploading'`,
        [
          resource.secure_url,
          resource.format || null,
          Number(resource.bytes) || 0,
          Number(resource.width) || null,
          Number(resource.height) || null,
          pendingRows[0].id,
        ]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(409).json({
          success: false,
          message: "Uploaded image was already finalized.",
        });
      }

      return res.json({
        success: true,
        data: {
          id: pendingRows[0].id,
          public_id: publicId,
          secure_url: resource.secure_url,
          format: resource.format || null,
          bytes: Number(resource.bytes) || 0,
          width: Number(resource.width) || null,
          height: Number(resource.height) || null,
          content_type: pendingRows[0].content_type,
        },
      });
    } catch (error) {
      console.error("Content image finalization error:", error.message);
      return res.status(502).json({
        success: false,
        message: "Cloudinary image upload could not be verified. Retry the upload.",
      });
    }
  });

  router.get("/content/assets", requireAdmin, async (req, res) => {
    const { type } = req.query;

    if (!CONTENT_ASSET_TYPES.has(type)) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid content section for the media library.",
      });
    }

    try {
      const [assets] = await db.execute(
        `SELECT id, public_id, secure_url, format, bytes, width, height, created_at
         FROM cloudinary_content_assets
         WHERE content_type = ? AND status = 'ready'
         ORDER BY created_at DESC, id DESC
         LIMIT 100`,
        [type]
      );

      return res.json({ success: true, data: assets });
    } catch (error) {
      console.error("Content image library error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to load the image library.",
      });
    }
  });

  router.delete("/content/assets/:id", requireAdmin, async (req, res) => {
    const assetId = Number(req.params.id);
    if (!Number.isSafeInteger(assetId) || assetId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid image library ID.",
      });
    }

    try {
      const [assets] = await db.execute(
        `SELECT id, content_type, public_id
         FROM cloudinary_content_assets
         WHERE id = ? AND status = 'ready'
         LIMIT 1`,
        [assetId]
      );

      if (assets.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Image not found in the library.",
        });
      }

      const asset = assets[0];
      const [siteReferences] = await db.execute(
        `SELECT id
         FROM site_content
         WHERE content_type = ?
           AND JSON_SEARCH(payload, 'one', ?) IS NOT NULL
         LIMIT 1`,
        [asset.content_type, asset.public_id]
      );
      const [departmentReferences] = asset.content_type === "departments"
        ? await db.execute(
            "SELECT id FROM departments WHERE image_public_id = ? LIMIT 1",
            [asset.public_id]
          )
        : [[]];
      const [eventReferences] = asset.content_type === "events"
        ? await db.execute(
            "SELECT id FROM events WHERE image_public_id = ? LIMIT 1",
            [asset.public_id]
          )
        : [[]];

      if (
        siteReferences.length > 0 ||
        departmentReferences.length > 0 ||
        eventReferences.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message: "This image is currently in use. Replace or remove it from published content before deleting it.",
        });
      }

      const result = await cloudinary.uploader.destroy(asset.public_id, {
        resource_type: "image",
        invalidate: true,
      });

      if (!["ok", "not found"].includes(result.result)) {
        return res.status(502).json({
          success: false,
          message: "Cloudinary could not delete this image.",
        });
      }

      await db.execute(
        "DELETE FROM cloudinary_content_assets WHERE id = ?",
        [assetId]
      );

      return res.json({ success: true, message: "Image deleted from Cloudinary." });
    } catch (error) {
      console.error("Content image deletion error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to delete this image from Cloudinary.",
      });
    }
  });

  router.post("/signature", requireAdmin, async (req, res) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary media storage is not configured on the server.",
      });
    }

    try {
      const {
        eventId: eventIdValue,
        department: departmentValue,
        photographerName: photographerValue,
        cameraModel: cameraValue,
        eventDay: eventDayValue,
        fileSize,
        sha256,
        mediaKind,
      } = req.body || {};
      const eventId = String(eventIdValue || "");

      if (!EVENT_ID_PATTERN.test(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Choose a valid event.",
        });
      }

      if (!HASH_PATTERN.test(sha256 || "")) {
        return res.status(400).json({
          success: false,
          message: "A valid SHA-256 file digest is required.",
        });
      }

      const maxFileSize =
        Number(process.env.CLOUDINARY_MAX_FILE_BYTES) ||
        2 * 1024 * 1024 * 1024;
      if (
        !Number.isSafeInteger(fileSize) ||
        fileSize < 1 ||
        fileSize > maxFileSize
      ) {
        return res.status(413).json({
          success: false,
          message: "This file exceeds the configured upload-size limit.",
        });
      }

      if (!["image", "video", "raw"].includes(mediaKind)) {
        return res.status(400).json({
          success: false,
          message: "Unsupported media type.",
        });
      }

      const department =
        typeof departmentValue === "string"
          ? departmentValue.trim().toLowerCase()
          : "";

      if (!DEPARTMENTS.has(department)) {
        return res.status(400).json({
          success: false,
          message: "Choose a valid department.",
        });
      }

      const photographerName = validateContextValue(
        photographerValue,
        "Photographer name"
      );
      const cameraModel = validateContextValue(cameraValue, "Camera model");
      const eventDay = validateContextValue(eventDayValue, "Event day");

      if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDay)) {
        return res.status(400).json({
          success: false,
          message: "Event day must use YYYY-MM-DD format.",
        });
      }

      const eventDayDate = new Date(`${eventDay}T00:00:00.000Z`);
      if (
        Number.isNaN(eventDayDate.getTime()) ||
        eventDayDate.toISOString().slice(0, 10) !== eventDay
      ) {
        return res.status(400).json({
          success: false,
          message: "Event day must be a real calendar date.",
        });
      }

      const [events] = await db.execute(
        `SELECT id, title, CAST(event_date AS CHAR) AS event_date
         FROM events
         WHERE id = ? AND is_active = 1
         LIMIT 1`,
        [eventId]
      );

      if (events.length === 0) {
        return res.status(404).json({
          success: false,
          message: "The selected event does not exist or is inactive.",
        });
      }

      const [duplicates] = await db.execute(
        `SELECT id FROM cloudinary_assets
         WHERE event_id = ? AND sha256 = ? AND status = 'ready'
         LIMIT 1`,
        [eventId, sha256]
      );

      if (duplicates.length > 0) {
        return res.status(409).json({
          success: false,
          duplicate: true,
          message: "This file is already in the selected event gallery.",
        });
      }

      const event = events[0];
      const year = academicYearFromDate(event.event_date);
      const eventSlug = slugify(event.title);

      if (!eventSlug) {
        return res.status(400).json({
          success: false,
          message: "The selected event title cannot be used as a media folder.",
        });
      }

      const folder = `college_events/${year}/${eventSlug}`;
      const assetId = require("crypto").randomUUID();
      const tags = [
        "college_event",
        `event_id_${eventId}`,
        "uploader_role_admin",
        `department_${department}`,
      ].join(",");
      const context = serializeContext({
        event_id: eventId,
        uploader_admin_id: String(req.session.admin.id),
        uploader_role: "admin",
        department,
        photographer_name: photographerName,
        camera_model: cameraModel,
        event_day: eventDay,
        sha256,
      });
      const incomingTransformation =
        process.env.CLOUDINARY_INCOMING_TRANSFORMATION?.trim();
      const backupEnabled =
        process.env.CLOUDINARY_BACKUP_ENABLED === "true";
      const uploadPreset = {
        image: process.env.CLOUDINARY_IMAGE_UPLOAD_PRESET,
        video: process.env.CLOUDINARY_VIDEO_UPLOAD_PRESET,
        raw: process.env.CLOUDINARY_RAW_UPLOAD_PRESET,
      }[mediaKind];

      if (incomingTransformation && mediaKind !== "raw" && !backupEnabled) {
        return res.status(503).json({
          success: false,
          message:
            "Incoming transformations require Cloudinary backups to be enabled.",
        });
      }

      const params = {
        timestamp: Math.floor(Date.now() / 1000),
        upload_preset: uploadPreset,
        folder,
        public_id: assetId,
        use_asset_folder_as_public_id_prefix: true,
        unique_filename: true,
        overwrite: false,
        backup: backupEnabled,
        tags,
        context,
        eager: mediaKind === "raw" ? undefined : EAGER_TRANSFORMATIONS,
        eager_async: mediaKind !== "raw",
        notification_url: process.env.CLOUDINARY_WEBHOOK_URL,
        eager_notification_url:
          mediaKind === "raw" ? undefined : process.env.CLOUDINARY_WEBHOOK_URL,
        transformation:
          mediaKind !== "raw" && incomingTransformation
            ? incomingTransformation
            : undefined,
      };
      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET
      );

      return res.json({
        success: true,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          process.env.CLOUDINARY_CLOUD_NAME
        )}/auto/upload`,
        signature,
        params,
        chunkThresholdBytes: 20 * 1024 * 1024,
        chunkSizeBytes: 8 * 1024 * 1024,
      });
    } catch (error) {
      console.error("Cloudinary signing error:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message || "Unable to authorize this media upload.",
      });
    }
  });

  router.get("/events/:eventId/duplicate-check", requireAdmin, async (req, res) => {
    const eventId = String(req.params.eventId);
    const sha256 = String(req.query.sha256 || "");

    if (!EVENT_ID_PATTERN.test(eventId) || !HASH_PATTERN.test(sha256)) {
      return res.status(400).json({
        success: false,
        message: "Invalid duplicate-check request.",
      });
    }

    try {
      const [rows] = await db.execute(
        `SELECT id FROM cloudinary_assets
         WHERE event_id = ? AND sha256 = ? AND status = 'ready'
         LIMIT 1`,
        [eventId, sha256]
      );

      return res.json({
        success: true,
        duplicate: rows.length > 0,
      });
    } catch (error) {
      console.error("Media duplicate check error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to check whether this file was already uploaded.",
      });
    }
  });

  router.post("/cloudinary/webhook", async (req, res) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary webhook processing is not configured.",
      });
    }

    const rawBody = req.rawBody?.toString("utf8");
    const timestamp = Number(req.get("X-Cld-Timestamp"));
    const signature = req.get("X-Cld-Signature");
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (
      !rawBody ||
      !Number.isSafeInteger(timestamp) ||
      Math.abs(currentTimestamp - timestamp) > 300 ||
      typeof signature !== "string" ||
      !cloudinary.utils.verifyNotificationSignature(
        rawBody,
        timestamp,
        signature,
        300
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Cloudinary webhook signature.",
      });
    }

    try {
      const record = normalizeWebhookRecord(req.body);

      if (!record) {
        return res.status(202).json({
          success: true,
          ignored: true,
        });
      }

      const [events] = await db.execute(
        "SELECT id FROM events WHERE id = ? LIMIT 1",
        [record.eventId]
      );

      if (events.length === 0) {
        return res.status(202).json({
          success: true,
          ignored: true,
        });
      }

      const [existingAssets] = await db.execute(
        `SELECT id, event_id, sha256 FROM cloudinary_assets
         WHERE public_id = ? OR (event_id = ? AND sha256 = ?)
         LIMIT 1`,
        [record.publicId, record.eventId, record.sha256]
      );

      if (existingAssets.length > 0) {
        const existing = existingAssets[0];

        if (
          String(existing.event_id) !== String(record.eventId) ||
          existing.sha256 !== record.sha256
        ) {
          return res.status(200).json({ success: true, duplicate: true });
        }

        await db.execute(
          `UPDATE cloudinary_assets
           SET secure_url = ?, bytes = ?, width = ?, height = ?,
               metadata = ?, status = 'ready'
           WHERE id = ?`,
          [
            record.secureUrl,
            record.bytes,
            record.width,
            record.height,
            JSON.stringify(record.metadata),
            existing.id,
          ]
        );
      } else {
        await db.execute(
          `INSERT INTO cloudinary_assets
            (event_id, uploader_admin_id, public_id, resource_type, delivery_type,
             format, secure_url, bytes, width, height, sha256, metadata, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready')`,
          [
            record.eventId,
            record.adminId,
            record.publicId,
            record.resourceType,
            record.deliveryType,
            record.format,
            record.secureUrl,
            record.bytes,
            record.width,
            record.height,
            record.sha256,
            JSON.stringify(record.metadata),
          ]
        );
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Cloudinary webhook database error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to save the uploaded media notification.",
      });
    }
  });

  router.get("/events/:eventId/assets", async (req, res) => {
    const eventId = String(req.params.eventId);
    const cursor = req.query.cursor ? Number(req.query.cursor) : 0;
    const requestedLimit = Number(req.query.limit) || 60;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    if (
      !EVENT_ID_PATTERN.test(eventId) ||
      !Number.isSafeInteger(cursor) ||
      cursor < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid event or gallery cursor.",
      });
    }

    try {
      const [events] = await db.execute(
        `SELECT id, title, CAST(event_date AS CHAR) AS event_date, category
         FROM events WHERE id = ? AND is_active = 1 LIMIT 1`,
        [eventId]
      );

      if (events.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Event gallery not found.",
        });
      }

      const [assets] = await db.execute(
        `SELECT id, public_id, resource_type, format, secure_url,
                bytes, width, height, metadata, created_at
         FROM cloudinary_assets
         WHERE event_id = ? AND status = 'ready' AND resource_type = 'image'
           AND id > ?
         ORDER BY id ASC
         LIMIT ?`,
        [eventId, cursor, limit + 1]
      );
      const hasMore = assets.length > limit;
      const page = hasMore ? assets.slice(0, limit) : assets;
      const items = page.map((asset) => ({
        ...asset,
        metadata:
          typeof asset.metadata === "string"
            ? JSON.parse(asset.metadata)
            : asset.metadata,
      }));

      return res.json({
        success: true,
        event: events[0],
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
        data: items,
        nextCursor: hasMore ? String(page[page.length - 1].id) : null,
      });
    } catch (error) {
      console.error("Cloudinary gallery error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to load this event gallery.",
      });
    }
  });

  router.get("/events/:eventId/archive", async (req, res) => {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary archive downloads are not configured.",
      });
    }

    const eventId = String(req.params.eventId);
    const requestedIds = req.query.publicIds
      ? String(req.query.publicIds)
          .split(",")
          .filter(Boolean)
      : null;

    if (
      !EVENT_ID_PATTERN.test(eventId) ||
      (requestedIds &&
        (requestedIds.length === 0 ||
          requestedIds.length > MAX_ARCHIVE_ITEMS ||
          requestedIds.some(
            (publicId) =>
              publicId.length > 512 || /[\u0000-\u001f]/.test(publicId)
          )))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid archive request.",
      });
    }

    try {
      const [events] = await db.execute(
        `SELECT id, title, CAST(event_date AS CHAR) AS event_date
         FROM events WHERE id = ? AND is_active = 1 LIMIT 1`,
        [eventId]
      );

      if (events.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });
      }

      const options = {
        resource_type: "image",
        type: "upload",
        target_format: "zip",
        flatten_folders: true,
        expires_at: Math.floor(Date.now() / 1000) + 10 * 60,
      };

      if (requestedIds) {
        const [assets] = await db.execute(
          `SELECT public_id FROM cloudinary_assets
           WHERE event_id = ? AND status = 'ready' AND resource_type = 'image'
             AND public_id IN (${requestedIds.map(() => "?").join(",")})`,
          [eventId, ...new Set(requestedIds)]
        );

        if (assets.length !== new Set(requestedIds).size) {
          return res.status(400).json({
            success: false,
            message: "One or more selected photos are not in this event.",
          });
        }

        options.public_ids = assets.map((asset) => asset.public_id);
      } else {
        const year = academicYearFromDate(events[0].event_date);
        const folder = `college_events/${year}/${slugify(events[0].title)}`;
        options.prefixes = [folder];
      }

      const url = cloudinary.utils.download_zip_url(options);
      return res.json({ success: true, url });
    } catch (error) {
      console.error("Cloudinary archive error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to prepare the event archive.",
      });
    }
  });

  return router;
};
