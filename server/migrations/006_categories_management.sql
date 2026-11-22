-- Migration 006: Categories Management System
-- Provides structured, multi-module category classification for all website sections

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  target_page VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  color VARCHAR(30) NOT NULL DEFAULT '#800000',
  icon VARCHAR(50) NOT NULL DEFAULT 'Tag',
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY categories_target_name_unique (target_page, name),
  KEY categories_target_active_order_idx (target_page, is_active, sort_order)
);

ALTER TABLE notices
  ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL DEFAULT 'General' AFTER notice_date;
