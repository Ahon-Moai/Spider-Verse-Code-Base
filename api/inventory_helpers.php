<?php
/**
 * ML-Based Perfume Stock Management Helpers
 * Handles:
 * - Parsing decant ML quantities from size strings
 * - Idempotent, atomic stock deductions for orders
 * - Idempotent, atomic stock restoration for cancellations and refunds
 * - Full audit transaction logging
 */

require_once __DIR__ . '/db.php';

/**
 * Parse decant ML from human-readable size labels.
 * Examples:
 *  "3ml" -> 3.0
 *  "5ml" -> 5.0
 *  "9ml" -> 9.0
 *  "10ml (2x5ml)" -> 10.0
 *  "15ml Boxed Set" -> 15.0
 *  "1.5ML TESTER" -> 1.5
 *  "0.5 ml" -> 0.5
 *  "100ml Full Bottle" -> 100.0
 */
function parseDecantMl(string $size): float {
    $trimmed = trim(strtolower($size));

    // Handle expressions like "10ml" or "1.5ml" or "5 ml"
    if (preg_match('/^([0-9]+(?:\.[0-9]+)?)\s*ml\b/i', $trimmed, $matches)) {
        return (float)$matches[1];
    }

    // Match any number preceding "ml" anywhere in string e.g. "Bottle 15ml"
    if (preg_match('/([0-9]+(?:\.[0-9]+)?)\s*ml\b/i', $trimmed, $matches)) {
        return (float)$matches[1];
    }

    // Fallback: extract the first floating point / integer number found
    if (preg_match('/([0-9]+(?:\.[0-9]+)?)/', $trimmed, $matches)) {
        return (float)$matches[1];
    }

    return 5.0; // Default sensible fallback for decants
}

/**
 * Deduct ML inventory for an order atomically and idempotently.
 *
 * @param PDO $db
 * @param int $orderId
 * @param string $triggeredBy 'checkout' | admin username
 * @return array ['success' => bool, 'deducted' => array, 'message' => string]
 * @throws Exception if stock is insufficient or DB error occurs
 */
function deductInventoryForOrder(PDO $db, int $orderId, string $triggeredBy = 'system'): array {
    // 1. Idempotency Check: check if sale_deduction already logged for this order_id
    $checkTx = $db->prepare("SELECT COUNT(*) FROM inventory_transactions WHERE order_id = ? AND transaction_type = 'sale_deduction'");
    $checkTx->execute([$orderId]);
    if ($checkTx->fetchColumn() > 0) {
        return [
            'success' => true,
            'already_deducted' => true,
            'message' => 'Stock was already deducted for this order.'
        ];
    }

    // 2. Fetch order items
    $itemStmt = $db->prepare("SELECT product_id, product_name, brand_name, selected_size, quantity FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$orderId]);
    $items = $itemStmt->fetchAll();

    if (empty($items)) {
        return [
            'success' => true,
            'deducted' => [],
            'message' => 'No items found for order'
        ];
    }

    // Aggregate required ML per product / inventory item
    $requiredMlByInv = [];

    foreach ($items as $item) {
        $singleMl = parseDecantMl($item['selected_size']);
        $totalMl = round($singleMl * (int)$item['quantity'], 2);

        // Find corresponding perfume_inventory record by product_id or by exact name & brand
        $invStmt = $db->prepare("SELECT * FROM perfume_inventory WHERE product_id = ? LIMIT 1");
        $invStmt->execute([$item['product_id']]);
        $inv = $invStmt->fetch();

        if (!$inv) {
            $invStmt = $db->prepare("SELECT * FROM perfume_inventory WHERE LOWER(name) = LOWER(?) AND LOWER(brand) = LOWER(?) LIMIT 1");
            $invStmt->execute([$item['product_name'], $item['brand_name']]);
            $inv = $invStmt->fetch();
        }

        if (!$inv) {
            // If still not found, search by product name only
            $invStmt = $db->prepare("SELECT * FROM perfume_inventory WHERE LOWER(name) = LOWER(?) LIMIT 1");
            $invStmt->execute([$item['product_name']]);
            $inv = $invStmt->fetch();
        }

        if ($inv) {
            $invId = $inv['id'];
            if (!isset($requiredMlByInv[$invId])) {
                $requiredMlByInv[$invId] = [
                    'inv' => $inv,
                    'total_ml' => 0.0,
                    'items' => []
                ];
            }
            $requiredMlByInv[$invId]['total_ml'] += $totalMl;
            $requiredMlByInv[$invId]['items'][] = [
                'name' => $item['product_name'],
                'size' => $item['selected_size'],
                'qty' => $item['quantity'],
                'ml' => $totalMl
            ];
        }
    }

    // 3. Check for sufficient stock before applying any deductions
    foreach ($requiredMlByInv as $invId => $entry) {
        $inv = $entry['inv'];
        $needed = $entry['total_ml'];

        // Re-read current remaining_ml for accuracy
        $curStmt = $db->prepare("SELECT remaining_ml, name, brand FROM perfume_inventory WHERE id = ?");
        $curStmt->execute([$invId]);
        $currentRecord = $curStmt->fetch();
        $currentMl = (float)($currentRecord['remaining_ml'] ?? 0);

        if ($currentMl < $needed) {
            throw new Exception("Insufficient stock for {$currentRecord['brand']} - {$currentRecord['name']}. Available: {$currentMl}ml, Required: {$needed}ml");
        }
    }

    // 4. Apply atomic stock updates and insert ledger transactions
    $deductedResults = [];
    $updateStmt = $db->prepare("UPDATE perfume_inventory SET remaining_ml = remaining_ml - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND remaining_ml >= ?");
    $txStmt = $db->prepare("INSERT INTO inventory_transactions (inventory_id, order_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, ?, 'sale_deduction', ?, ?, ?, ?, ?)");

    foreach ($requiredMlByInv as $invId => $entry) {
        $needed = $entry['total_ml'];

        // Fetch current stock
        $curStmt = $db->prepare("SELECT remaining_ml, name, brand FROM perfume_inventory WHERE id = ?");
        $curStmt->execute([$invId]);
        $currentRecord = $curStmt->fetch();
        $prevMl = (float)$currentRecord['remaining_ml'];

        // Atomic update with conditional guard
        $updateStmt->execute([$needed, $invId, $needed]);
        if ($updateStmt->rowCount() === 0) {
            throw new Exception("Stock race condition encountered when deducting {$needed}ml from {$currentRecord['name']}. Please try again.");
        }

        $newMl = round($prevMl - $needed, 2);

        $notes = "Order deduction: " . implode(', ', array_map(function($i) {
            return "{$i['qty']}x {$i['size']} ({$i['ml']}ml)";
        }, $entry['items']));

        $txStmt->execute([
            $invId,
            $orderId,
            -$needed,
            $prevMl,
            $newMl,
            $notes,
            $triggeredBy
        ]);

        $deductedResults[] = [
            'inventory_id' => $invId,
            'name' => $currentRecord['name'],
            'deducted_ml' => $needed,
            'previous_ml' => $prevMl,
            'new_ml' => $newMl
        ];
    }

    return [
        'success' => true,
        'deducted' => $deductedResults,
        'message' => 'ML inventory deducted successfully.'
    ];
}

/**
 * Restore ML inventory for an order upon cancellation or refund.
 * Idempotent: cannot restore twice.
 *
 * @param PDO $db
 * @param int $orderId
 * @param string $transactionType 'order_cancellation' | 'order_refund'
 * @param string $triggeredBy admin username
 * @return array
 */
function restoreInventoryForOrder(PDO $db, int $orderId, string $transactionType = 'order_cancellation', string $triggeredBy = 'system'): array {
    // 1. Check if sale_deduction was made for this order
    $deductTxStmt = $db->prepare("SELECT * FROM inventory_transactions WHERE order_id = ? AND transaction_type = 'sale_deduction'");
    $deductTxStmt->execute([$orderId]);
    $deductions = $deductTxStmt->fetchAll();

    if (empty($deductions)) {
        return [
            'success' => true,
            'restored' => [],
            'message' => 'No ML inventory was deducted for this order, nothing to restore.'
        ];
    }

    // 2. Check if already restored
    $restoreTxStmt = $db->prepare("SELECT COUNT(*) FROM inventory_transactions WHERE order_id = ? AND transaction_type IN ('order_cancellation', 'order_refund')");
    $restoreTxStmt->execute([$orderId]);
    if ($restoreTxStmt->fetchColumn() > 0) {
        return [
            'success' => true,
            'already_restored' => true,
            'message' => 'Stock has already been restored for this order.'
        ];
    }

    $restoredResults = [];
    $updateStmt = $db->prepare("UPDATE perfume_inventory SET remaining_ml = remaining_ml + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $txStmt = $db->prepare("INSERT INTO inventory_transactions (inventory_id, order_id, transaction_type, change_ml, previous_ml, new_ml, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($deductions as $d) {
        $invId = $d['inventory_id'];
        $restoreMl = abs((float)$d['change_ml']);

        // Fetch current stock
        $curStmt = $db->prepare("SELECT remaining_ml, name, bottle_size_ml FROM perfume_inventory WHERE id = ?");
        $curStmt->execute([$invId]);
        $inv = $curStmt->fetch();

        if ($inv) {
            $prevMl = (float)$inv['remaining_ml'];
            $newMl = round($prevMl + $restoreMl, 2);

            $updateStmt->execute([$restoreMl, $invId]);

            $notes = "Stock restored for order cancellation/refund (" . $d['notes'] . ")";
            $txStmt->execute([
                $invId,
                $orderId,
                $transactionType,
                $restoreMl,
                $prevMl,
                $newMl,
                $notes,
                $triggeredBy
            ]);

            $restoredResults[] = [
                'inventory_id' => $invId,
                'name' => $inv['name'],
                'restored_ml' => $restoreMl,
                'previous_ml' => $prevMl,
                'new_ml' => $newMl
            ];
        }
    }

    return [
        'success' => true,
        'restored' => $restoredResults,
        'message' => 'ML inventory restored successfully.'
    ];
}
