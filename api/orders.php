<?php
/**
 * Public Checkout & Order Confirmation REST Endpoint
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/inventory_helpers.php';

sendCorsAndHeaders();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $orderNumber = sanitizeString($_GET['order_number'] ?? null);
    if (!$orderNumber) {
        jsonError('Order number required', 400);
    }

    $stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ? LIMIT 1");
    $stmt->execute([$orderNumber]);
    $order = $stmt->fetch();

    if (!$order) {
        jsonError('Order not found', 404);
    }

    $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$order['id']]);
    $items = $itemStmt->fetchAll();

    jsonResponse([
        'order' => $order,
        'items' => $items
    ], 200);

} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = sanitizeString($_GET['action'] ?? $input['action'] ?? '');

    // Server-side Quote & Validation (Pricing, Delivery, Coupon, Stock)
    if ($action === 'quote') {
        $cityZone = sanitizeString($input['city_zone'] ?? 'outside_dhaka');
        $couponCode = sanitizeString($input['coupon_code'] ?? null);
        $itemsInput = $input['items'] ?? [];

        $setStmt = $db->query("SELECT setting_key, setting_value FROM store_settings");
        $settings = $setStmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];

        $feeDhaka = (float)($settings['shipping_fee_dhaka'] ?? 70);
        $feeOutside = (float)($settings['shipping_fee_outside_dhaka'] ?? 130);
        $freeThreshold = (float)($settings['free_shipping_threshold'] ?? 3000);

        $subtotal = 0.00;
        $validatedItems = [];
        $stockIssues = [];

        if (is_array($itemsInput)) {
            foreach ($itemsInput as $item) {
                $productId = sanitizeString($item['product_id'] ?? $item['productId'] ?? null);
                $size = sanitizeString($item['selected_size'] ?? $item['selectedSize'] ?? null);
                $qty = max(1, (int)($item['quantity'] ?? 1));

                if (!$productId || !$size) continue;

                $pStmt = $db->prepare("SELECT id, name, brand, starting_price, inventory_qty FROM products WHERE id = ? LIMIT 1");
                $pStmt->execute([$productId]);
                $prod = $pStmt->fetch();
                if (!$prod) continue;

                $vStmt = $db->prepare("SELECT id, price, stock_qty FROM product_variants WHERE product_id = ? AND size = ? LIMIT 1");
                $vStmt->execute([$productId, $size]);
                $variant = $vStmt->fetch();

                $unitPrice = $variant ? (float)$variant['price'] : (float)$prod['starting_price'];
                $availableStock = $variant ? (int)$variant['stock_qty'] : (int)$prod['inventory_qty'];
                $lineTotal = $unitPrice * $qty;
                $subtotal += $lineTotal;

                if ($availableStock > 0 && $qty > $availableStock) {
                    $stockIssues[] = [
                        'product_id' => $prod['id'],
                        'product_name' => $prod['name'],
                        'selected_size' => $size,
                        'requested_qty' => $qty,
                        'available_stock' => $availableStock
                    ];
                }

                $validatedItems[] = [
                    'product_id' => $prod['id'],
                    'product_name' => $prod['name'],
                    'brand_name' => $prod['brand'],
                    'selected_size' => $size,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'available_stock' => $availableStock
                ];
            }
        }

        $isOutsideZone = in_array(strtolower($cityZone), ['outside_dhaka', 'outside_chittagong'], true);
        $deliveryFee = $isOutsideZone ? $feeOutside : $feeDhaka;
        if ($subtotal <= 0 || $subtotal >= $freeThreshold) {
            $deliveryFee = 0.00;
        }

        $discount = 0.00;
        $couponApplied = false;
        $appliedCode = null;
        $couponError = null;

        if ($couponCode) {
            $normalizedCode = strtoupper(trim($couponCode));
            $cStmt = $db->prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1");
            $cStmt->execute([$normalizedCode]);
            $coupon = $cStmt->fetch();

            if (!$coupon) {
                $couponError = 'Invalid or inactive coupon code.';
            } elseif (!empty($coupon['expiry_date']) && strtotime($coupon['expiry_date']) < time()) {
                $couponError = 'This coupon code has expired.';
            } elseif ($subtotal < (float)$coupon['min_spend']) {
                $minSpendFormatted = number_format((float)$coupon['min_spend'], 0);
                $couponError = "Minimum spend of ৳ {$minSpendFormatted} required for code {$normalizedCode}.";
            } else {
                if ($coupon['discount_type'] === 'percent') {
                    $discount = round(($subtotal * (float)$coupon['discount_value']) / 100, 2);
                } else {
                    $discount = min($subtotal, (float)$coupon['discount_value']);
                }
                $couponApplied = true;
                $appliedCode = $normalizedCode;
            }
        }

        $totalAmount = max(0, ($subtotal - $discount)) + $deliveryFee;

        jsonResponse([
            'items' => $validatedItems,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'delivery_fee' => $deliveryFee,
            'total_amount' => $totalAmount,
            'shipping_fee_dhaka' => $feeDhaka,
            'shipping_fee_outside_dhaka' => $feeOutside,
            'free_shipping_threshold' => $freeThreshold,
            'coupon_applied' => $couponApplied,
            'coupon_code' => $appliedCode,
            'coupon_error' => $couponError,
            'stock_issues' => $stockIssues
        ], 200);
    }

    $customerName = sanitizeString($input['customer_name'] ?? '');
    $customerPhone = sanitizeString($input['customer_phone'] ?? '');
    $whatsappNumber = sanitizeString($input['whatsapp_number'] ?? '');
    $customerEmail = sanitizeString($input['customer_email'] ?? '');
    $shippingAddress = sanitizeString($input['shipping_address'] ?? '');
    $cityZone = sanitizeString($input['city_zone'] ?? 'outside_dhaka'); // outside_dhaka | inside_dhaka
    $paymentMethod = 'cod';
    $couponCode = sanitizeString($input['coupon_code'] ?? null);
    $itemsInput = $input['items'] ?? [];

    if (empty($customerName) || empty($customerPhone) || empty($shippingAddress)) {
        jsonError('Customer name, phone number, and delivery address are required', 400);
    }

    if (empty($itemsInput) || !is_array($itemsInput)) {
        jsonError('Cart is empty', 400);
    }

    // Fetch store settings for shipping rules
    $setStmt = $db->query("SELECT setting_key, setting_value FROM store_settings");
    $settings = $setStmt->fetchAll(PDO::FETCH_KEY_PAIR) ?: [];

    $feeDhaka = (float)($settings['shipping_fee_dhaka'] ?? 70);
    $feeOutside = (float)($settings['shipping_fee_outside_dhaka'] ?? 130);
    $freeThreshold = (float)($settings['free_shipping_threshold'] ?? 3000);

    // SERVER-SIDE PRICE & ITEM VALIDATION
    $subtotal = 0.00;
    $validatedItems = [];

    foreach ($itemsInput as $item) {
        $productId = sanitizeString($item['product_id'] ?? $item['productId'] ?? null);
        $size = sanitizeString($item['selected_size'] ?? $item['selectedSize'] ?? null);
        $qty = (int)($item['quantity'] ?? 1);

        if (!$productId || !$size || $qty <= 0) {
            jsonError('Invalid item payload in cart', 400);
        }

        // Get product
        $pStmt = $db->prepare("SELECT id, name, brand FROM products WHERE id = ? LIMIT 1");
        $pStmt->execute([$productId]);
        $prod = $pStmt->fetch();
        if (!$prod) {
            jsonError("Product $productId not found or unavailable", 400);
        }

        // Get variant price from DB
        $vStmt = $db->prepare("SELECT id, price, stock_qty FROM product_variants WHERE product_id = ? AND size = ? LIMIT 1");
        $vStmt->execute([$productId, $size]);
        $variant = $vStmt->fetch();

        if (!$variant) {
            jsonError("Size variant $size for product {$prod['name']} not found", 400);
        }

        $availableStock = (int)$variant['stock_qty'];
        if ($availableStock > 0 && $qty > $availableStock) {
            jsonError("Requested quantity ($qty) exceeds available stock ($availableStock) for {$prod['name']} ({$size})", 400);
        }

        $unitPrice = (float)$variant['price'];
        $lineTotal = $unitPrice * $qty;
        $subtotal += $lineTotal;

        $validatedItems[] = [
            'product_id' => $prod['id'],
            'variant_id' => $variant['id'],
            'product_name' => $prod['name'],
            'brand_name' => $prod['brand'],
            'selected_size' => $size,
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'line_total' => $lineTotal
        ];
    }

    // Calculate delivery fee
    $isOutsideZone = in_array(strtolower($cityZone), ['outside_dhaka', 'outside_chittagong'], true);
    $deliveryFee = $isOutsideZone ? $feeOutside : $feeDhaka;
    if ($subtotal >= $freeThreshold) {
        $deliveryFee = 0.00;
    }

    // Calculate coupon discount
    $discount = 0.00;
    if ($couponCode) {
        $cStmt = $db->prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1");
        $cStmt->execute([strtoupper(trim($couponCode))]);
        $coupon = $cStmt->fetch();

        $isNotExpired = !$coupon || empty($coupon['expiry_date']) || strtotime($coupon['expiry_date']) >= time();
        if ($coupon && $isNotExpired && $subtotal >= (float)$coupon['min_spend']) {
            if ($coupon['discount_type'] === 'percent') {
                $discount = round(($subtotal * (float)$coupon['discount_value']) / 100, 2);
            } else {
                $discount = min($subtotal, (float)$coupon['discount_value']);
            }
        }
    }

    $totalAmount = max(0, ($subtotal - $discount)) + $deliveryFee;

    // DATABASE TRANSACTION
    try {
        $db->beginTransaction();

        // 1. Find or create customer
        $custStmt = $db->prepare("SELECT id FROM customers WHERE phone = ? LIMIT 1");
        $custStmt->execute([$customerPhone]);
        $cust = $custStmt->fetch();

        if ($cust) {
            $customerId = $cust['id'];
            $upCust = $db->prepare("UPDATE customers SET name = ?, email = ?, address = ?, city_zone = ? WHERE id = ?");
            $upCust->execute([$customerName, $customerEmail, $shippingAddress, $cityZone, $customerId]);
        } else {
            $inCust = $db->prepare("INSERT INTO customers (name, email, phone, address, city_zone) VALUES (?, ?, ?, ?, ?)");
            $inCust->execute([$customerName, $customerEmail, $customerPhone, $shippingAddress, $cityZone]);
            $customerId = $db->lastInsertId();
        }

        // 2. Generate Unique Order Number
        $year = date('Y');
        $randomSuffix = strtoupper(bin2hex(random_bytes(3)));
        $orderNumber = "ORD-$year-$randomSuffix";

        // 3. Insert Order
        $ordStmt = $db->prepare("INSERT INTO orders (order_number, customer_id, customer_name, customer_phone, whatsapp_number, customer_email, shipping_address, city_zone, subtotal, discount, delivery_fee, total_amount, payment_method, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'pending')");
        $ordStmt->execute([
            $orderNumber,
            $customerId,
            $customerName,
            $customerPhone,
            $whatsappNumber,
            $customerEmail,
            $shippingAddress,
            $cityZone,
            $subtotal,
            $discount,
            $deliveryFee,
            $totalAmount,
            $paymentMethod
        ]);
        $orderId = $db->lastInsertId();

        // 4. Insert Order Items & Deduct Stock
        $itemIns = $db->prepare("INSERT INTO order_items (order_id, product_id, product_name, brand_name, selected_size, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stockDeductVar = $db->prepare("UPDATE product_variants SET stock_qty = CASE WHEN stock_qty >= ? THEN stock_qty - ? ELSE 0 END WHERE id = ?");
        $stockDeductProd = $db->prepare("UPDATE products SET inventory_qty = CASE WHEN inventory_qty >= ? THEN inventory_qty - ? ELSE 0 END WHERE id = ?");
        $logIns = $db->prepare("INSERT INTO inventory_logs (product_id, variant_id, change_qty, previous_qty, new_qty, reason, created_by) VALUES (?, ?, ?, 0, 0, 'order_placed', 'customer')");

        foreach ($validatedItems as $vItem) {
            $itemIns->execute([
                $orderId,
                $vItem['product_id'],
                $vItem['product_name'],
                $vItem['brand_name'],
                $vItem['selected_size'],
                $vItem['quantity'],
                $vItem['unit_price'],
                $vItem['line_total']
            ]);

            // Deduct variant and main product stock
            $stockDeductVar->execute([$vItem['quantity'], $vItem['quantity'], $vItem['variant_id']]);
            $stockDeductProd->execute([$vItem['quantity'], $vItem['quantity'], $vItem['product_id']]);
            $logIns->execute([$vItem['product_id'], $vItem['variant_id'], -$vItem['quantity']]);
        }

        // 5. Status History
        $histStmt = $db->prepare("INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by) VALUES (?, NULL, 'pending', 'Order created at checkout', 'customer')");
        $histStmt->execute([$orderId]);

        $db->commit();

        jsonResponse([
            'order_number' => $orderNumber,
            'customer_name' => $customerName,
            'customer_phone' => $customerPhone,
            'whatsapp_number' => $whatsappNumber,
            'customer_email' => $customerEmail,
            'shipping_address' => $shippingAddress,
            'city_zone' => $cityZone,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'delivery_fee' => $deliveryFee,
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'status' => 'pending',
            'items' => $validatedItems
        ], 201, 'Order placed successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        jsonError('Failed to process checkout: ' . $e->getMessage(), 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
