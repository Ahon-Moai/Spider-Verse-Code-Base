-- Migration 002: ML-Based Perfume Stock Management System
-- Compatible with MariaDB / MySQL 5.7+ / 8.0+ and SQLite 3

CREATE TABLE IF NOT EXISTS `perfume_inventory` (
  `id` VARCHAR(64) PRIMARY KEY,
  `product_id` VARCHAR(64) NULL,
  `brand` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `bottle_size_ml` DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  `remaining_ml` DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  `low_stock_threshold_ml` DECIMAL(10,2) NOT NULL DEFAULT 15.00,
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `inventory_id` VARCHAR(64) NOT NULL,
  `order_id` INT NULL,
  `transaction_type` VARCHAR(50) NOT NULL,
  `change_ml` DECIMAL(10,2) NOT NULL,
  `previous_ml` DECIMAL(10,2) NOT NULL,
  `new_ml` DECIMAL(10,2) NOT NULL,
  `notes` TEXT NULL,
  `created_by` VARCHAR(100) DEFAULT 'system',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`inventory_id`) REFERENCES `perfume_inventory`(`id`) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_perfume_inv_product ON perfume_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_inventory ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_order ON inventory_transactions(order_id);
