<?php
/**
 * Admin ML Perfume Inventory Management REST Endpoint
 * Full support for:
 * - GET: List inventory, stats summary, filter by status, search, or fetch transaction history for a perfume
 * - POST: Add new perfume to inventory & log initial stock
 * - PUT: Edit perfume information, update low-stock threshold, or adjust/restock ML
 * - DELETE: Delete perfume inventory record
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../inventory_helpers.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $id = sanitizeString($_GET['id'] ?? null);
    $history = isset($_GET['history']) || isset($_GET['transactions']);
    $search = sanitizeString($_GET['search'] ?? null);
    $statusFilter = sanitizeString($_GET['status'] ?? null); // in_stock, low_stock, out_of_stock

    // If transactions history requested for specific perfume inventory
    if ($id && $history) {
        $invStmt = $db->prepare("SELECT * FROM perfume_inventory WHERE id = ? LIMIT 1");
        $invStmt->execute([$id]);
        $inv = $invStmt->fetch();

        if (!$inv) {
            jsonError('Perfume inventory record not found', 404);
        }

        $txStmt = $db->prepare("SELECT t.*, o.order_number FROM inventory_transactions t LEFT JOIN orders o ON t.order_id = o.id WHERE t.inventory_id = ? ORDER BY t.created_at DESC, t.id DESC");
        $txStmt->execute([$id]);
        $transactions = $txStmt->fetchAll();

        // Calculate metadata
        $bottleSize = (float)$inv['bottle_size_ml'];
        $remaining = (float)$inv['remaining_ml'];
        $threshold = (float)$inv['low_stock_threshold_ml'];
        $percentage = ($bottleSize > 0) ? round(($remaining / $bottleSize) * 100, 1) : 0;

        $status = 'in_stock';
        if ($remaining <= 0) {
            $status = 'out_of_stock';
        } elseif ($remaining <= $threshold) {
            $status = 'low_stock';
        }

        jsonResponse([
            'inventory' => array_merge($inv, [
                'stock_percentage' => $percentage,
                'stock_status' => $status
            ]),
            'transactions' => $transactions
        ], 200);
    }

    // Single inventory item
    if ($id && !$history) {
        $stmt = $db->prepare("SELECT i.*, p.image, p.starting_price FROM perfume_inventory i LEFT JOIN products p ON i.product_id = p.id WHERE i.id = ? LIMIT 1");
        $stmt->execute([$id]);
        $inv = $stmt->fetch();

        if (!$inv) {
            jsonError('Perfume inventory record not found', 404);
        }

        $bottleSize = (float)$inv['bottle_size_ml'];
        $remaining = (float)$inv['remaining_ml'];
        $threshold = (float)$inv['low_stock_threshold_ml'];
        $percentage = ($bottleSize > 0) ? round(($remaining / $bottleSize) * 100, 1) : 0;

        $status = 'in_stock';
        if ($remaining <= 0) {
            $status = 'out_of_stock';
        } elseif ($remaining <= $threshold) {
            $status = 'low_stock';
        }

        $inv['stock_percentage'] = $percentage;
        $inv['stock_status'] = $status;

        jsonResponse($inv, 200);
    }

    // List all inventory items with stats overview
    $where = ["1=1"];
    $params = [];

    if ($search) {
        $where[] = "(i.name LIKE ? OR i.brand LIKE ? OR i.notes LIKE ?)";
        $term = '%' . $search . '%';
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    $whereSql = implode(' AND ', $where);
    $sql = "SELECT i.*, p.image, p.starting_price, p.slug as product_slug
            FROM perfume_inventory i
            LEFT JOIN products p ON i.product_id = p.id
            WHERE $whereSql
            ORDER BY i.updated_at DESC, i.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $items = [];
    $totalPerfumes = count($rows);
    $totalRemainingMl = 0.0;
    $totalBottleCapacityMl = 0.0;
    $lowStockCount = 0;
    $outOfStockCount = 0;

    foreach ($rows as $row) {
        $bottleSize = (float)$row['bottle_size_ml'];
        $remaining = (float)$row['remaining_ml'];
        $threshold = (float)$row['low_stock_threshold_ml'];
        $percentage = ($bottleSize > 0) ? round(($remaining / $bottleSize) * 100, 1) : 0;

        $status = 'in_stock';
        if ($remaining <= 0) {
            $status = 'out_of_stock';
            $outOfStockCount++;
        } elseif ($remaining <= $threshold) {
            $status = 'low_stock';
            $lowStockCount++;
        }

        $totalRemainingMl += $remaining;
        $totalBottleCapacityMl += $bottleSize;

        $row['bottle_size_ml'] = $bottleSize;
        $row['remaining_ml'] = $remaining;
        $row['low_stock_threshold_ml'] = $threshold;
        $row['stock_percentage'] = $percentage;
        $row['stock_status'] = $status;

        // Apply status filter in memory or SQL
        if ($statusFilter && $statusFilter !== 'all' && $statusFilter !== '') {
            if ($row['stock_status'] !== $statusFilter) {
                continue;
            }
        }

        $items[] = $row;
    }

    // Fetch recent 5 transactions for dashboard activity
    $recentTxStmt = $db->query("SELECT t.*, i.name as perfume_name, i.brand as perfume_brand, o.order_number
                                FROM inventory_transactions t
                                JOIN perfume_inventory i ON t.inventory_id = i.id
                                LEFT JOIN orders o ON t.order_id = o.id
                                ORDER BY t.created_at DESC, t.id DESC
                                LIMIT 6");
    $recentTransactions = $recentTxStmt->fetchAll();

    jsonResponse([
        'stats' => [
            'total_perfumes' => $totalPerfumes,
            'total_remaining_ml' => round($totalRemainingMl, 1),
            'total_capacity_ml' => round($totalBottleCapacityMl, 1),
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'in_stock_count' => max(0, $totalPerfumes - $lowStockCount - $outOfStockCount)
        ],
        'items' => $items,
        'recent_transactions' => $recentTransactions
    ], 200);

} elseif ($method === 'POST') {
    // Add new perfume to inventory
    $input = getJsonInput();

    $name = sanitizeString($input['name'] ?? '');
    $brand = sanitizeString($input['brand'] ?? '');
    $productId = sanitizeString($input['product_id'] ?? null);
    $bottleSizeMl = (float)($input['bottle_size_ml'] ?? 100.00);
    $remainingMl = isset($input['remaining_ml']) ? (float)$input['remaining_ml'] : $bottleSizeMl;
    $thresholdMl = (float)($input['low_stock_threshold_ml'] ?? 15.00);
    $notes = sanitizeString($input['notes'] ?? '');

    if (empty($name) || empty($brand)) {
        jsonError('Perfume name and brand are required', 400);
    }

    if ($bottleSizeMl <= 0) {
        jsonError('Original bottle size in ML must be greater than 0', 400);
    }

    if ($remainingMl < 0 || $remainingMl > $bottleSizeMl * 2) {
        jsonError('Remaining ML must be between 0 and twice the bottle capacity', 400);
    }

    $id = 'inv-' . bin2hex(random_bytes(6));

    try {
        $db->beginTransaction();

        $ins = $db->prepare("INSERT INTO perfume_inventory (id, product_id, brand, name, bottle_size_ml, remaining_ml, low_stock_threshold_ml, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $ins->execute([
            $id,
            $productId ?: null,
            $brand,
            $name,
            $bottleSizeMl,
            $remainingMl,
            $thresholdMl,
            $notes
        ]);

        // Record initial stock transaction
        $tx = $db->prepare("INSERT INTO inventory_transactions (inventory_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, 'initial_stock', ?, 0, ?, ?, ?)");
        $tx->execute([
            $id,
            $remainingMl,
            $remainingMl,
            $notes ?: 'Initial stock entry',
            $admin['username']
        ]);

        $db->commit();

        jsonResponse([
            'id' => $id,
            'name' => $name,
            'brand' => $brand,
            'remaining_ml' => $remainingMl,
            'bottle_size_ml' => $bottleSizeMl
        ], 201, 'Perfume inventory created successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to create perfume inventory: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'PUT') {
    // Edit perfume inventory details or adjust/restock ML
    $input = getJsonInput();
    $id = sanitizeString($_GET['id'] ?? $input['id'] ?? null);

    if (!$id) {
        jsonError('Inventory ID required', 400);
    }

    $stmt = $db->prepare("SELECT * FROM perfume_inventory WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $inv = $stmt->fetch();

    if (!$inv) {
        jsonError('Perfume inventory record not found', 404);
    }

    $prevMl = (float)$inv['remaining_ml'];
    $prevBottleSize = (float)$inv['bottle_size_ml'];

    $action = sanitizeString($input['action'] ?? 'edit'); // 'edit' | 'adjust' | 'restock'
    $notes = sanitizeString($input['notes'] ?? $input['reason'] ?? '');

    try {
        $db->beginTransaction();

        if ($action === 'adjust') {
            // Manual adjustment (increase or decrease by delta, or set to target value)
            if (isset($input['new_ml'])) {
                $targetMl = (float)$input['new_ml'];
                $delta = round($targetMl - $prevMl, 2);
            } elseif (isset($input['change_ml'])) {
                $delta = (float)$input['change_ml'];
                $targetMl = round($prevMl + $delta, 2);
            } else {
                jsonError('Either new_ml or change_ml is required for manual adjustment', 400);
            }

            if ($targetMl < 0) {
                jsonError('Remaining stock cannot be negative', 400);
            }

            if ($delta == 0) {
                jsonError('No change in ML specified', 400);
            }

            $up = $db->prepare("UPDATE perfume_inventory SET remaining_ml = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $up->execute([$targetMl, $id]);

            $tx = $db->prepare("INSERT INTO inventory_transactions (inventory_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, 'manual_adjustment', ?, ?, ?, ?, ?)");
            $tx->execute([$id, $delta, $prevMl, $targetMl, $notes ?: 'Manual stock adjustment by admin', $admin['username']]);

        } elseif ($action === 'restock') {
            // Restocking (adds ML)
            $restockMl = (float)($input['restock_ml'] ?? $input['amount_ml'] ?? 0);
            if ($restockMl <= 0) {
                jsonError('Restock quantity in ML must be greater than 0', 400);
            }

            $targetMl = round($prevMl + $restockMl, 2);

            $up = $db->prepare("UPDATE perfume_inventory SET remaining_ml = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $up->execute([$targetMl, $id]);

            $tx = $db->prepare("INSERT INTO inventory_transactions (inventory_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, 'restock', ?, ?, ?, ?, ?)");
            $tx->execute([$id, $restockMl, $prevMl, $targetMl, $notes ?: 'Bottle restock / replacement', $admin['username']]);

        } else {
            // Standard metadata edit (name, brand, bottle_size_ml, low_stock_threshold_ml, notes)
            $name = sanitizeString($input['name'] ?? $inv['name']);
            $brand = sanitizeString($input['brand'] ?? $inv['brand']);
            $productId = sanitizeString($input['product_id'] ?? $inv['product_id']);
            $bottleSizeMl = isset($input['bottle_size_ml']) ? (float)$input['bottle_size_ml'] : $prevBottleSize;
            $thresholdMl = isset($input['low_stock_threshold_ml']) ? (float)$input['low_stock_threshold_ml'] : (float)$inv['low_stock_threshold_ml'];
            $invNotes = sanitizeString($input['notes'] ?? $inv['notes']);

            if (isset($input['remaining_ml']) && (float)$input['remaining_ml'] != $prevMl) {
                $targetMl = (float)$input['remaining_ml'];
                $delta = round($targetMl - $prevMl, 2);

                $tx = $db->prepare("INSERT INTO inventory_transactions (inventory_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, 'manual_adjustment', ?, ?, ?, ?, ?)");
                $tx->execute([$id, $delta, $prevMl, $targetMl, 'Stock updated during information edit', $admin['username']]);
            } else {
                $targetMl = $prevMl;
            }

            $up = $db->prepare("UPDATE perfume_inventory SET name = ?, brand = ?, product_id = ?, bottle_size_ml = ?, remaining_ml = ?, low_stock_threshold_ml = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $up->execute([$name, $brand, $productId ?: null, $bottleSizeMl, $targetMl, $thresholdMl, $invNotes, $id]);
        }

        $db->commit();
        jsonResponse(null, 200, 'Perfume inventory updated successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to update perfume inventory: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'DELETE') {
    $id = sanitizeString($_GET['id'] ?? null);
    if (!$id) {
        jsonError('Inventory ID required', 400);
    }

    try {
        $db->beginTransaction();

        $delTx = $db->prepare("DELETE FROM inventory_transactions WHERE inventory_id = ?");
        $delTx->execute([$id]);

        $del = $db->prepare("DELETE FROM perfume_inventory WHERE id = ?");
        $del->execute([$id]);

        $db->commit();
        jsonResponse(null, 200, 'Perfume inventory record removed successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to delete perfume inventory: ' . $e->getMessage(), 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
