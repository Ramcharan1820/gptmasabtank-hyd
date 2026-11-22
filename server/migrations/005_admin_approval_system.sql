-- Migration 005: Admin Registration and Main Administrator Approval System

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL AFTER name,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved' AFTER is_active,
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) NOT NULL DEFAULT 'local' AFTER status,
  ADD COLUMN IF NOT EXISTS auth_provider_id VARCHAR(255) NULL AFTER auth_provider,
  ADD COLUMN IF NOT EXISTS department VARCHAR(100) NULL AFTER auth_provider_id,
  ADD COLUMN IF NOT EXISTS designation VARCHAR(150) NULL AFTER department,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER designation,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(1024) NULL AFTER phone,
  ADD COLUMN IF NOT EXISTS request_reason TEXT NULL AFTER avatar_url,
  ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(255) NULL AFTER request_reason,
  ADD COLUMN IF NOT EXISTS approved_by INT UNSIGNED NULL AFTER rejection_reason,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER approved_by,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL AFTER approved_at;

-- Allow password_hash to be NULL for OAuth-based registrations
ALTER TABLE admins MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Set existing admin as superadmin with username 'admin'
UPDATE admins
SET role = 'superadmin', username = 'admin', status = 'approved', is_active = 1
WHERE email = 'admin@gmail.com';

