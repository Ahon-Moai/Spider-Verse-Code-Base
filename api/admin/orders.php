<?php
/**
 * Admin Orders Management REST Endpoint
 */

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../inventory_helpers.php';

sendCorsAndHeaders();
$admin = requireAdminAuth();

$db = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $statusFilter = $_GET['status'] ?? null;
    $search = $_GET['search'] ?? null;

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1");
        $stmt->execute([$id, $id]);
        $order = $stmt->fetch();

        if (!$order) {
            jsonError('Order not found', 404);
        }

        $itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll();

        $historyStmt = $db->prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC");
        $historyStmt->execute([$order['id']]);
        $order['history'] = $historyStmt->fetchAll();

        jsonResponse($order, 200);
    } else {
        $where = ["1=1"];
        $params = [];

        if ($statusFilter) {
            $where[] = "order_status = ?";
            $params[] = $statusFilter;
        }

        if ($search) {
            $where[] = "(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)";
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $whereSql = implode(' AND ', $where);
        $sql = "SELECT * FROM orders WHERE $whereSql ORDER BY created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        jsonResponse($orders, 200);
    }

} elseif ($method === 'PUT') {
    $input = getJsonInput();
    $id = sanitizeString($_GET['id'] ?? $input['id'] ?? null);

    if (!$id) {
        jsonError('Order ID required', 400);
    }

    $newStatus = sanitizeString($input['order_status'] ?? $input['orderStatus'] ?? null);
    $trackingNumber = sanitizeString($input['tracking_number'] ?? null);
    $internalNotes = sanitizeString($input['internal_notes'] ?? null);
    $newPaymentStatus = sanitizeString($input['payment_status'] ?? $input['paymentStatus'] ?? null);

    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1");
    $stmt->execute([$id, $id]);
    $order = $stmt->fetch();

    if (!$order) {
        jsonError('Order not found', 404);
    }

    $oldStatus = $order['order_status'];
    $oldPaymentStatus = $order['payment_status'];

    try {
        $db->beginTransaction();

        // ML INVENTORY DEDUCTION TRIGGER:
        // When order reaches confirmed / processing / paid status (and was not cancelled)
        $isNowConfirmedOrPaid = in_array($newStatus, ['confirmed', 'processing', 'shipped', 'delivered']) || $newPaymentStatus === 'paid';
        if ($isNowConfirmedOrPaid && $oldStatus !== 'cancelled') {
            deductInventoryForOrder($db, (int)$order['id'], $admin['username']);
        }

        // ML INVENTORY RESTORATION TRIGGER:
        // When status changed to cancelled or payment_status to refunded
        if (($newStatus === 'cancelled' && $oldStatus !== 'cancelled') || ($newPaymentStatus === 'refunded' && $oldPaymentStatus !== 'refunded')) {
            $txType = ($newPaymentStatus === 'refunded') ? 'order_refund' : 'order_cancellation';
            restoreInventoryForOrder($db, (int)$order['id'], $txType, $admin['username']);

            // Also restore original unit stock
            if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
                $itemsStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
                $itemsStmt->execute([$order['id']]);
                $items = $itemsStmt->fetchAll();

                $restoreVar = $db->prepare("UPDATE product_variants SET stock_qty = stock_qty + ? WHERE product_id = ? AND size = ?");
                $restoreProd = $db->prepare("UPDATE products SET inventory_qty = inventory_qty + ? WHERE id = ?");
                $logIns = $db->prepare("INSERT INTO inventory_logs (product_id, change_qty, reason, created_by) VALUES (?, ?, 'order_cancelled', ?)");

                foreach ($items as $item) {
                    $restoreVar->execute([$item['quantity'], $item['product_id'], $item['selected_size']]);
                    $restoreProd->execute([$item['quantity'], $item['product_id']]);
                    $logIns->execute([$item['product_id'], $item['quantity'], $admin['username']]);
                }
            }
        }

        // Update order
        $upSql = "UPDATE orders SET order_status = COALESCE(?, order_status), payment_status = COALESCE(?, payment_status), tracking_number = COALESCE(?, tracking_number), internal_notes = COALESCE(?, internal_notes) WHERE id = ?";
        $upStmt = $db->prepare($upSql);
        $upStmt->execute([$newStatus, $newPaymentStatus, $trackingNumber, $internalNotes, $order['id']]);

        // Insert history record if status changed
        if ($newStatus && $newStatus !== $oldStatus) {
            $hist = $db->prepare("INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by) VALUES (?, ?, ?, ?, ?)");
            $hist->execute([$order['id'], $oldStatus, $newStatus, "Status updated by admin", $admin['username']]);
        }

        // Log audit
        $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'update_order', 'orders', ?, ?)");
        $logStmt->execute([$admin['id'], $order['id'], "Updated order #{$order['order_number']} status to $newStatus"]);

        $db->commit();
        jsonResponse(null, 200, 'Order updated successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to update order: ' . $e->getMessage(), 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
