CREATE TABLE IF NOT EXISTS cloudinary_content_assets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uploader_admin_id INT UNSIGNED NOT NULL,
  content_type VARCHAR(32) NOT NULL,
  public_id VARCHAR(512) NOT NULL,
  secure_url VARCHAR(2048) NOT NULL,
  format VARCHAR(32) NULL,
  bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'uploading',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY cloudinary_content_assets_public_id_unique (public_id),
  KEY cloudinary_content_assets_type_status_id_idx
    (content_type, status, id)
);

ALTER TABLE events
  ADD COLUMN image_public_id VARCHAR(512) NULL;

ALTER TABLE departments
  ADD COLUMN image_public_id VARCHAR(512) NULL;
