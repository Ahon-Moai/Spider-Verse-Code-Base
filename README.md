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

---

## 6. Frontend Development & Deployment (Spider Verse)

The storefront is a modern React + TypeScript single-page application located in `/frontend`, themed with an **F1 meets Marvel** aesthetic.

### A. Local Setup & Development

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_BASE_URL` to point to your PHP API (default is `/api` or `http://localhost:8000/api` during local dev).

3. Start development server:
   ```bash
   npm run dev
   ```
   Or from the root directory:
   ```bash
   npm run dev
   ```
   The Vite dev server proxies `/api` and `/uploads` directly to `http://127.0.0.1:8000`.

### B. Building for Production

To compile the production bundle with type checking and code splitting:
```bash
npm run build
```
Or from the root:
```bash
npm run build
```
The compiled output will be generated in `frontend/dist/`.

### C. Deploying to cPanel / BDIX Shared Hosting (`public_html`)

1. Build the frontend locally with `npm run build` (or on your CI runner).
2. Upload the compiled files from `frontend/dist/` into your cPanel `public_html/`:
   ```
   public_html/
   ├── index.html
   ├── .htaccess             <-- Included in frontend/dist/ (or frontend/public/.htaccess)
   ├── assets/               <-- Minified JS & CSS chunks
   ├── api/                  <-- Symlink or copy of backend api/
   └── uploads/              <-- Persistent media upload folder (chmod 755)
   ```
3. **Apache `.htaccess` SPA Routing**:
   The provided `.htaccess` ensures all client-side routes (e.g. `/products`, `/about`, `/track`) are served via `index.html` while preserving direct access to `/api/*` and `/uploads/*`.
