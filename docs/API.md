# AROMATICA Backend REST API Documentation

This document specifies all available REST API endpoints in the PHP/MariaDB backend, including request methods, URL paths, parameters, authentication requirements, and response payload structures.

---

## 1. General Architecture & Standards

- **Base URL**: `/api` (e.g. `http://example.com/api/` or `http://localhost:8000/api/`)
- **Data Format**: Requests with body payloads must send `Content-Type: application/json` (except `/api/uploads.php` which requires `multipart/form-data`).
- **Response Format**: All endpoints return JSON responses with standard envelopes:
  - **Success envelope**:
    ```json
    {
      "success": true,
      "data": { ... } | [ ... ],
      "message": "Optional descriptive status message"
    }
    ```
  - **Error envelope**:
    ```json
    {
      "success": false,
      "error": "Error description message",
      "errors": null | [ ... ]
    }
    ```
- **Session & Authentication**:
  - Admin endpoints require an active PHP session initiated via `/api/auth.php?action=login`.
  - Session cookie: standard PHP session ID (`PHPSESSID`) with `HttpOnly` and `SameSite=Lax`.

---

## 2. Public Storefront Endpoints

### 2.1 Backend Health Check
- **Endpoint**: `GET /api/health.php`
- **Auth Required**: None (Public)
- **Parameters**: None
- **Response Shape (200 / 500)**:
  ```json
  {
    "success": true,
    "data": {
      "app_name": "AROMATICA E-Commerce API",
      "status": "ok",
      "environment": "production",
      "timestamp": "2026-11-10T12:00:00+00:00",
      "database": {
        "connected": true,
        "driver": "mysql",
        "error": null
      },
      "media_storage": {
        "upload_dir_exists": true,
        "writable": true
      }
    },
    "message": "Health check result"
  }
  ```

---

### 2.2 Public Products Catalog
- **Endpoint**: `GET /api/products.php`
- **Auth Required**: None (Public)
- **Query Parameters**:
  - `id` (optional, string): Fetch single product by its unique ID.
  - `slug` (optional, string): Fetch single product by its URL slug.
  - `category` (optional, string): Filter product list by category name.
  - `gender` (optional, string): Filter product list by gender (`Him`, `Her`, `Unisex`).
  - `featured` (optional, string/int): Filter featured products (`1` or `true`).
  - `new_arrival` (optional, string/int): Filter new arrivals (`1` or `true`).
  - `search` (optional, string): Search in product name, brand, or description.
- **Single Product Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "prod-1",
      "brand": "ARRINA",
      "name": "Pure Portions",
      "slug": "pure-portions",
      "category": "Solar Floral Amber",
      "gender": "Unisex",
      "concentration": "Eau de Parfum",
      "starting_price": 450.00,
      "cost_price": 200.00,
      "short_description": "Architectural decant",
      "description": "Full product description",
      "image": "/uploads/image.jpg",
      "notes": ["Vanilla", "Amber"],
      "top_notes": ["Neroli"],
      "heart_notes": ["Rose"],
      "base_notes": ["Vanilla"],
      "attributes": {},
      "scent_profile": {},
      "status": "published",
      "inventory_qty": 100,
      "is_featured": 1,
      "is_new_arrival": 1,
      "variants": [
        {
          "id": "prod-1-var-1",
          "product_id": "prod-1",
          "size": "5ml",
          "price": 450.00,
          "cost_price": 200.00,
          "sku": "prod-1-5ml",
          "stock_qty": 50,
          "image": "/uploads/var.jpg",
          "is_available": 1
        }
      ],
      "images": ["/uploads/img1.jpg", "/uploads/img2.jpg"],
      "additional_images": ["/uploads/img1.jpg", "/uploads/img2.jpg"],
      "gallery_images": [
        {
          "id": 1,
          "product_id": "prod-1",
          "image_path": "/uploads/img1.jpg",
          "alt_text": null,
          "display_order": 1,
          "is_primary": 0
        }
      ]
    }
  }
  ```
- **Product List Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "prod-1",
        "brand": "ARRINA",
        "name": "Pure Portions",
        "slug": "pure-portions",
        "variants": [ ... ],
        "images": [ ... ]
      }
    ]
  }
  ```

---

### 2.3 Public Collections Catalog
- **Endpoint**: `GET /api/collections.php`
- **Auth Required**: None (Public)
- **Query Parameters**:
  - `id` (optional, string): Fetch a specific collection by ID.
  - `slug` (optional, string): Fetch a specific collection by slug (supports built-in presets like `all`, `forhim`, `forher`, `unisex`, `best-sellers`, `new-arrivals` or custom brands/categories).
- **Collection Detail Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "col-forhim",
      "title": "For Him",
      "slug": "forhim",
      "description": "Bold smoked woods, spicy saffron...",
      "image": "/uploads/campaign_for_him.jpg",
      "rule_type": "gender",
      "rule_value": "Him"
    }
  }
  ```
- **Collections List Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "col-forhim",
        "title": "For Him",
        "slug": "forhim",
        "description": "...",
        "image": "...",
        "rule_type": "gender",
        "rule_value": "Him",
        "display_order": 2,
        "is_enabled": 1
      }
    ]
  }
  ```

---

### 2.4 Public Homepage Sections & Dynamic Content
- **Endpoint**: `GET /api/homepage.php`
- **Auth Required**: None (Public)
- **Parameters**: None
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "sections": {
        "hero_marquee": { "title": "...", "subtitle": "...", "content": { ... } },
        "campaign_banners": { "title": "...", "subtitle": "...", "content": { ... } },
        "seasons_gallery": { "title": "...", "subtitle": "...", "content": { ... } },
        "video_showcase": { "title": "...", "subtitle": "...", "content": { ... } }
      },
      "reviews": [
        { "id": "rev-1", "quote": "...", "content": "...", "author": "...", "rating": 5, "verified": 1 }
      ],
      "faqs": [
        { "id": "faq-1", "question": "...", "answer": "..." }
      ],
      "articles": [
        { "id": "art-1", "title": "...", "date": "...", "publisher": "...", "description": "...", "image": "..." }
      ],
      "socialCards": [
        { "id": "soc-1", "handle": "...", "image": "...", "likes": 120, "comments": 15, "tag": "..." }
      ],
      "brands": [
        { "name": "ARRINA", "isNew": true }
      ]
    }
  }
  ```

---

### 2.5 Public Store Settings
- **Endpoint**: `GET /api/settings.php`
- **Auth Required**: None (Public)
- **Parameters**: None
- **Response Shape (200)**:
  Returns key-value pairs filtered to safe public store properties:
  ```json
  {
    "success": true,
    "data": {
      "store_name": "AROMATICA ONE",
      "tagline": "Curated Decants & Fine Perfumery",
      "contact_phone": "+8801700000000",
      "contact_email": "hello@aromatica.com",
      "address": "Dhaka, Bangladesh",
      "currency": "BDT",
      "currency_symbol": "৳",
      "shipping_fee_dhaka": "70",
      "shipping_fee_outside_dhaka": "130",
      "free_shipping_threshold": "3000",
      "enable_cod": "1",
      "enable_bkash": "1",
      "enable_nagad": "0",
      "enable_card": "0",
      "announcement_bar": "Free delivery across Dhaka on orders over ৳3,000"
    }
  }
  ```

---

### 2.6 Public Checkout & Order Inquiry
- **Endpoint**: `/api/orders.php`
- **Auth Required**: None (Public)

#### A. Order Status Inquiry (`GET /api/orders.php`)
- **Query Parameters**:
  - `order_number` (required, string): Unique tracking order number (e.g. `ORD-2026-ABC123`).
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "order": {
        "id": 1,
        "order_number": "ORD-2026-ABC123",
        "customer_name": "John Doe",
        "customer_phone": "01711112233",
        "shipping_address": "House 1, Road 2, Dhaka",
        "city_zone": "inside_dhaka",
        "subtotal": 1200.00,
        "discount": 0.00,
        "delivery_fee": 70.00,
        "total_amount": 1270.00,
        "payment_method": "cod",
        "payment_status": "unpaid",
        "order_status": "pending",
        "created_at": "2026-11-10 12:00:00"
      },
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": "prod-1",
          "product_name": "Pure Portions",
          "brand_name": "ARRINA",
          "selected_size": "5ml",
          "quantity": 1,
          "unit_price": 1200.00,
          "line_total": 1200.00
        }
      ]
    }
  }
  ```

#### B. Submit Customer Order (`POST /api/orders.php`)
- **Request Body (JSON)**:
  ```json
  {
    "customer_name": "John Doe",
    "customer_phone": "01711112233",
    "customer_email": "john@example.com",
    "shipping_address": "House 10, Road 5, Banani, Dhaka",
    "city_zone": "inside_dhaka",
    "payment_method": "cod",
    "coupon_code": "WELCOME10",
    "items": [
      {
        "product_id": "prod-1",
        "selected_size": "5ml",
        "quantity": 2
      }
    ]
  }
  ```
- **Response Shape (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "order_number": "ORD-2026-XYZ789",
      "customer_name": "John Doe",
      "subtotal": 900.00,
      "discount": 90.00,
      "delivery_fee": 70.00,
      "total_amount": 880.00,
      "payment_method": "cod",
      "status": "pending"
    },
    "message": "Order placed successfully"
  }
  ```

---

## 3. Administrator Authentication Endpoints

- **Endpoint**: `/api/auth.php`

### 3.1 Admin Login (`POST /api/auth.php?action=login` or `POST /api/auth.php`)
- **Auth Required**: None
- **Request Body (JSON)**:
  ```json
  {
    "username": "admin",
    "password": "your_secure_password"
  }
  ```
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin"
      },
      "csrf_token": "a1b2c3d4..."
    },
    "message": "Login successful"
  }
  ```

### 3.2 Get Current Admin Session (`GET /api/auth.php?action=me` or `GET /api/auth.php`)
- **Auth Required**: Admin session
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin"
      },
      "csrf_token": "a1b2c3d4..."
    }
  }
  ```

### 3.3 Admin Logout (`POST /api/auth.php?action=logout`)
- **Auth Required**: None (clears existing session)
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Logged out successfully"
  }
  ```

---

## 4. Protected Admin Endpoints

*Note: All endpoints in this section require an authenticated admin session (`$_SESSION['admin_user']`). Unauthenticated requests return `401 Unauthorized` (`{"success": false, "error": "Unauthorized. Admin login required."}`).*

---

### 4.1 Media Management & File Uploads

#### A. Upload Media File (`POST /api/uploads.php`)
- **Content-Type**: `multipart/form-data`
- **Body**: File field `file`, `image`, or `video`
- **Supported Formats**: JPEG, PNG, WebP, MP4, WebM, MOV, MKV
- **Response Shape (201)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 12,
      "filename": "e9f78a01bc4...png",
      "original_name": "bottle.png",
      "url": "/uploads/e9f78a01bc4...png",
      "file_type": "image/png",
      "file_size": 245100
    },
    "message": "Image uploaded successfully"
  }
  ```

#### B. List Media Files (`GET /api/admin/media.php`)
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "filename": "...",
        "original_name": "...",
        "file_path": "/uploads/...",
        "file_type": "image/jpeg",
        "file_size": 102400,
        "created_at": "2026-11-10 10:00:00"
      }
    ]
  }
  ```

#### C. Delete Media File (`DELETE /api/admin/media.php?id={id}`)
- **Query Parameter**: `id` (required, int)
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Media file deleted successfully"
  }
  ```

---

### 4.2 Product Management (`/api/admin/products.php`)

#### A. List Products / Get Product
- **Method**: `GET`
- **Query Parameters**:
  - `id` (optional, string): Product ID. If omitted, returns list of all products.
- **Response Shape (200)**: Array of products or single product object with variants and gallery images.

#### B. Create Product
- **Method**: `POST`
- **Request Body (JSON)**:
  ```json
  {
    "id": "optional-custom-id",
    "brand": "ARRINA",
    "name": "Amber Noir",
    "slug": "amber-noir",
    "category": "Woody Oriental",
    "gender": "Unisex",
    "concentration": "Eau de Parfum",
    "starting_price": 500.00,
    "cost_price": 250.00,
    "short_description": "Smoky oud and amber",
    "description": "Full details...",
    "image": "/uploads/perfume.jpg",
    "notes": ["Oud", "Amber"],
    "top_notes": ["Bergamot"],
    "heart_notes": ["Amber"],
    "base_notes": ["Oud"],
    "status": "published",
    "inventory_qty": 50,
    "is_featured": 1,
    "is_new_arrival": 1,
    "variants": [
      {
        "size": "5ml",
        "price": 500.00,
        "cost_price": 250.00,
        "sku": "AN-5ML",
        "stock_qty": 25,
        "image": ""
      }
    ],
    "additional_images": ["/uploads/perfume-angle.jpg"]
  }
  ```
- **Response Shape (201)**:
  ```json
  {
    "success": true,
    "data": { "id": "prod-amber-noir" },
    "message": "Product created successfully"
  }
  ```

#### C. Update Product
- **Method**: `PUT`
- **Query Parameters or Body**: `id` (required, string)
- **Request Body (JSON)**: Same attributes as create.
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": { "id": "prod-amber-noir" },
    "message": "Product updated successfully"
  }
  ```

#### D. Archive Product
- **Method**: `DELETE`
- **Query Parameters**: `id` (required, string)
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Product archived successfully"
  }
  ```

---

### 4.3 Order Management (`/api/admin/orders.php`)

#### A. List Orders / Get Order Details
- **Method**: `GET`
- **Query Parameters**:
  - `id` (optional, string/int): Order ID or order number.
  - `status` (optional, string): Filter by order status (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).
  - `search` (optional, string): Search customer name, phone, email, order number, or tracking number.
- **Response Shape (200)**: List of orders or single order with `items` and `history`.

#### B. Update Order Status & Notes
- **Method**: `PUT`
- **Query Parameters or Body**: `id` (required, int/string)
- **Request Body (JSON)**:
  ```json
  {
    "order_status": "confirmed",
    "payment_status": "paid",
    "tracking_number": "STEADFAST-12345",
    "internal_notes": "Customer confirmed over phone."
  }
  ```
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": { "id": 1, "order_status": "confirmed" },
    "message": "Order updated successfully"
  }
  ```

---

### 4.4 ML Perfume Inventory Management (`/api/admin/inventory.php`)

#### A. List Inventory & Statistics
- **Method**: `GET`
- **Query Parameters**:
  - `id` (optional, string): Perfume inventory ID.
  - `history` or `transactions` (optional, boolean): If `id` is specified, returns transaction audit ledger.
  - `status` (optional, string): Filter by `in_stock`, `low_stock`, or `out_of_stock`.
  - `search` (optional, string): Filter by name or brand.
- **List Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "inventory": [
        {
          "id": "inv-1",
          "product_id": "prod-1",
          "brand": "ARRINA",
          "name": "Pure Portions",
          "bottle_size_ml": 100.00,
          "remaining_ml": 85.00,
          "low_stock_threshold_ml": 15.00,
          "notes": "Original flacon",
          "status": "in_stock"
        }
      ],
      "stats": {
        "total_bottles": 10,
        "total_volume_ml": 850.00,
        "low_stock_count": 1,
        "out_of_stock_count": 0
      },
      "recent_transactions": [ ... ]
    }
  }
  ```

#### B. Add New Master Bottle
- **Method**: `POST`
- **Request Body (JSON)**:
  ```json
  {
    "id": "optional-inv-id",
    "name": "Genesis Leo",
    "brand": "ARRINA",
    "product_id": "prod-genesis-leo",
    "bottle_size_ml": 100.00,
    "remaining_ml": 100.00,
    "low_stock_threshold_ml": 15.00,
    "notes": "New batch allocation"
  }
  ```
- **Response Shape (201)**:
  ```json
  {
    "success": true,
    "data": { "id": "inv-genesis-leo" },
    "message": "Perfume inventory added successfully"
  }
  ```

#### C. Adjust / Restock Volume
- **Method**: `PUT`
- **Query Parameter or Body**: `id` (required, string)
- **Request Body (JSON)**:
  - For manual volume adjustment:
    ```json
    {
      "action": "adjust",
      "new_ml": 75.0,
      "reason": "Spill during decanting"
    }
    ```
  - For bottle restock:
    ```json
    {
      "action": "restock",
      "amount_ml": 100.0,
      "notes": "Received supplier shipment"
    }
    ```
  - For general metadata editing:
    ```json
    {
      "action": "edit",
      "name": "Pure Portions",
      "brand": "ARRINA",
      "bottle_size_ml": 100.0,
      "low_stock_threshold_ml": 20.0
    }
    ```
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": { "id": "inv-1", "remaining_ml": 75.0 },
    "message": "Inventory adjusted successfully"
  }
  ```

#### D. Delete Inventory Record
- **Method**: `DELETE`
- **Query Parameter**: `id` (required, string)
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Perfume inventory deleted successfully"
  }
  ```

---

### 4.5 Customer Management (`/api/admin/customers.php`)

#### A. List Customers / Customer Detail
- **Method**: `GET`
- **Query Parameters**:
  - `id` (optional, int): Customer ID. Includes customer order history.
  - `search` (optional, string): Search by name, phone, or email.
- **Response Shape (200)**: Array of customers (with `order_count` and `total_spent`) or single customer object.

---

### 4.6 Collections Management (`/api/admin/collections.php`)

#### A. List Collections / Collection Detail
- **Method**: `GET`
- **Query Parameters**: `id` (optional, string)
- **Response Shape (200)**: Collections list or single collection with `mapped_product_ids`.

#### B. Create Collection
- **Method**: `POST`
- **Request Body (JSON)**:
  ```json
  {
    "title": "Summer Vault",
    "slug": "summer-vault",
    "description": "Exclusive summer blends",
    "image": "/uploads/summer.jpg",
    "rule_type": "manual",
    "rule_value": null,
    "display_order": 10,
    "is_enabled": 1,
    "product_ids": ["prod-1", "prod-2"]
  }
  ```
- **Response Shape (201)**:
  ```json
  {
    "success": true,
    "data": { "id": "col-summer-vault" },
    "message": "Collection created successfully"
  }
  ```

#### C. Update Collection
- **Method**: `PUT`
- **Query Parameter or Body**: `id` (required, string)
- **Request Body (JSON)**: Same attributes as create.
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": { "id": "col-summer-vault" },
    "message": "Collection updated successfully"
  }
  ```

#### D. Delete Collection
- **Method**: `DELETE`
- **Query Parameter**: `id` (required, string)
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Collection deleted successfully"
  }
  ```

---

### 4.7 Coupon Management (`/api/admin/coupons.php`)

#### A. List Coupons
- **Method**: `GET`
- **Response Shape (200)**: Array of coupon objects (`id`, `code`, `discount_type`, `discount_value`, `min_spend`, `is_active`, `expiry_date`, `created_at`).

#### B. Create Coupon
- **Method**: `POST`
- **Request Body (JSON)**:
  ```json
  {
    "code": "SUMMER20",
    "discount_type": "percent",
    "discount_value": 20.00,
    "min_spend": 1500.00,
    "is_active": 1
  }
  ```
- **Response Shape (201)**:
  ```json
  {
    "success": true,
    "data": { "id": 2 },
    "message": "Coupon created"
  }
  ```

---

### 4.8 Homepage CMS Management (`/api/admin/homepage.php`)

#### A. Fetch All Homepage Sections & CMS Data
- **Method**: `GET`
- **Response Shape (200)**: Returns `sections`, `faqs`, `reviews`, `articles`, `socialCards`.

#### B. Update Section or Add Sub-Item
- **Method**: `POST` or `PUT`
- **Sub-Item Actions**:
  - Add FAQ: `action: "add_faq"`, fields `question`, `answer`, `display_order`
  - Add Review: `action: "add_review"`, fields `quote`, `content`, `author`, `rating`, `verified`, `display_order`
  - Add Journal Article: `action: "add_article"`, fields `title`, `date`, `publisher`, `description`, `image`, `display_order`
  - Add Social Card: `action: "add_social_card"`, fields `handle`, `image`, `likes`, `comments`, `tag`, `display_order`
  - Update Homepage Section: `section_key` (e.g. `hero_marquee`), `title`, `subtitle`, `content` (object/array), `display_order`, `is_enabled`
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Updated successfully"
  }
  ```

#### C. Delete Sub-Item
- **Method**: `DELETE`
- **Query Parameters**:
  - `type` (required): `faq`, `review`, or `article`
  - `id` (required, string)
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Item deleted successfully"
  }
  ```

---

### 4.9 Store Settings Management (`/api/admin/settings.php`)

#### A. Fetch All Store Settings
- **Method**: `GET`
- **Response Shape (200)**: Key-value dictionary of all store settings in the database.

#### B. Update Store Settings
- **Method**: `POST` or `PUT`
- **Request Body (JSON)**:
  ```json
  {
    "store_name": "AROMATICA ONE",
    "shipping_fee_dhaka": "80",
    "shipping_fee_outside_dhaka": "150",
    "free_shipping_threshold": "3500",
    "announcement_bar": "Special Autumn allocations available now"
  }
  ```
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": null,
    "message": "Settings updated successfully"
  }
  ```

---

### 4.10 Analytics & Statistics (`/api/admin/analytics.php`)

#### A. Fetch Analytics Dashboard Metrics
- **Method**: `GET`
- **Query Parameters**:
  - `period` (optional): `today`, `7d`, `30d` (default), `90d`, `all`, `custom`
  - `start_date` (optional, string `YYYY-MM-DD`): For custom period
  - `end_date` (optional, string `YYYY-MM-DD`): For custom period
- **Response Shape (200)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "revenue": { "current": 250000.0, "previous": 210000.0, "growth_percent": 19.05 },
        "orders": { "current": 120, "previous": 105, "growth_percent": 14.29 },
        "average_order_value": { "current": 2083.33, "previous": 2000.0, "growth_percent": 4.17 },
        "customers": { "current": 85, "previous": 70, "growth_percent": 21.43 }
      },
      "revenue_timeline": [
        { "period_label": "2026-11-01", "revenue": 12500.0, "orders_count": 6 }
      ],
      "order_status_distribution": {
        "pending": 5,
        "confirmed": 12,
        "processing": 8,
        "shipped": 20,
        "delivered": 75,
        "cancelled": 2
      },
      "top_selling_products": [
        { "product_id": "prod-1", "product_name": "Pure Portions", "brand_name": "ARRINA", "units_sold": 45, "revenue": 20250.0 }
      ],
      "inventory_status": {
        "total_bottles": 10,
        "total_volume_ml": 850.0,
        "low_stock_count": 1,
        "out_of_stock_count": 0
      }
    }
  }
  ```
