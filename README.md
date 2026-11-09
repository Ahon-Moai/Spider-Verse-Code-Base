# AROMATICA E-Commerce Platform — Backend

A headless PHP + MariaDB e-commerce and inventory backend designed for deployment on standard BDIX shared hosting (cPanel) or local development environments.

---

## 1. Requirements

- **PHP**: PHP 8.2 or PHP 8.3 with the following extensions enabled:
  - `pdo`, `pdo_mysql` (and `pdo_sqlite` for optional SQLite dev)
  - `mbstring`
  - `json`
  - `fileinfo`
  - `gd`
- **Database**: MariaDB 10.4+ or MySQL 5.7+ / 8.0+
- **Web Server**: Apache with `mod_rewrite` enabled or Nginx

---

## 2. Configuration Setup

Configuration is handled through a unified `config.php` file that loads local overrides from a git-ignored `config.local.php`.

1. Copy the example configuration template:
   ```bash
   cp config.example.php config.local.php
   ```

2. Open `config.local.php` and configure your database and environment settings:
   - `env`: `'production'` (or `'development'`)
   - `secret`: A strong, random 64-character secret string
   - `allowed_origin`: Your frontend domain (e.g. `'https://yourstore.com'` or `'*'`)
   - `db['host']`: MariaDB host (typically `'localhost'` or `'127.0.0.1'`)
   - `db['port']`: `'3306'`
   - `db['name']`: Your MariaDB database name
   - `db['user']`: Your MariaDB database username
   - `db['pass']`: Your MariaDB database password
   - `upload['dir']`: Absolute path to persistent storage directory for uploads

---

## 3. Database Initialization

1. Create a database and user in MariaDB (via cPanel MySQL Databases or command-line):
   ```sql
   CREATE DATABASE my_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   GRANT ALL PRIVILEGES ON my_store_db.* TO 'my_store_user'@'localhost' IDENTIFIED BY 'my_secure_password';
   FLUSH PRIVILEGES;
   ```

2. Import the schema (table structures and indexes only):
   ```bash
   mysql -u my_store_user -p my_store_db < schema.sql
   ```
   *(Or via phpMyAdmin -> Import -> Select `schema.sql`)*

3. (Optional) Populate initial catalog, store settings, and sample data:
   ```bash
   php database/seed.php
   ```

4. Create an administrator account:
   ```bash
   php database/create_admin.php <username> <email> <password>
   ```
   Example:
   ```bash
   php database/create_admin.php admin admin@example.com MyStrongAdminPass123!
   ```

---

## 4. Directory Permissions

Ensure that the media storage directory is writable by the PHP process:
```bash
chmod 755 uploads
```

---

## 5. API Documentation

Detailed documentation for all public storefront and protected admin REST endpoints can be found in [`docs/API.md`](docs/API.md).
