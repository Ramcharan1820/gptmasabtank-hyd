CREATE TABLE IF NOT EXISTS cloudinary_assets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_id INT UNSIGNED NOT NULL,
  uploader_admin_id INT UNSIGNED NOT NULL,
  public_id VARCHAR(512) NOT NULL,
  resource_type VARCHAR(16) NOT NULL,
  delivery_type VARCHAR(32) NOT NULL DEFAULT 'upload',
  format VARCHAR(32) NULL,
  secure_url VARCHAR(2048) NOT NULL,
  bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  sha256 CHAR(64) NULL,
  metadata JSON NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'ready',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY cloudinary_assets_public_id_unique (public_id),
  UNIQUE KEY cloudinary_assets_event_digest_unique (event_id, sha256),
  KEY cloudinary_assets_event_status_id_idx (event_id, status, id),
  CONSTRAINT cloudinary_assets_event_fk
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE CASCADE
);
