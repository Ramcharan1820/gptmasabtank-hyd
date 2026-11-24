CREATE TABLE IF NOT EXISTS admin_password_reset_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_password_reset_token_hash_unique (token_hash),
  KEY admin_password_reset_admin_idx (admin_id, used_at, expires_at)
);

CREATE TABLE IF NOT EXISTS admin_password_reset_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_ip_hash CHAR(64) NOT NULL,
  request_email_hash CHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY admin_password_reset_ip_request_idx (request_ip_hash, created_at),
  KEY admin_password_reset_email_request_idx (request_email_hash, created_at)
);
