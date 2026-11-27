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

function normalizeOrderPaymentFields(array $row): array {
    $total = (float)($row['total_amount'] ?? 0);
    $advance = isset($row['advance_amount']) ? (float)$row['advance_amount'] : 250.00;
    if ($advance <= 0) {
        $advance = 250.00;
    }
    $remaining = isset($row['remaining_cod_amount']) && (float)$row['remaining_cod_amount'] >= 0
        ? (float)$row['remaining_cod_amount']
        : max(0.00, $total - $advance);

    $row['advance_amount'] = $advance;
    $row['remaining_cod_amount'] = $remaining;
    $row['payment_verification_status'] = $row['payment_verification_status'] ?: 'pending_verification';
    return $row;
}

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $statusFilter = $_GET['status'] ?? null;
    $verificationFilter = $_GET['verification_status'] ?? null;
    $search = $_GET['search'] ?? null;

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1");
        $stmt->execute([$id, $id]);
        $order = $stmt->fetch();

        if (!$order) {
            jsonError('Order not found', 404);
        }

        $order = normalizeOrderPaymentFields($order);

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

        if ($verificationFilter) {
            $allowedVerification = ['pending_verification', 'verified', 'rejected'];
            if (in_array($verificationFilter, $allowedVerification, true)) {
                $where[] = "COALESCE(payment_verification_status, 'pending_verification') = ?";
                $params[] = $verificationFilter;
            }
        }

        if ($search) {
            $where[] = "(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR transaction_ref LIKE ? OR sender_number LIKE ?)";
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $whereSql = implode(' AND ', $where);
        $sql = "SELECT * FROM orders WHERE $whereSql ORDER BY created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $orders = array_map('normalizeOrderPaymentFields', $stmt->fetchAll());

        jsonResponse($orders, 200);
    }

} elseif ($method === 'PUT') {
    verifyCsrfToken();
    $input = getJsonInput();
    $id = sanitizeString($_GET['id'] ?? $input['id'] ?? null);

    if (!$id) {
        jsonError('Order ID required', 400);
    }

    $newStatus = sanitizeString($input['order_status'] ?? $input['orderStatus'] ?? null);
    $trackingNumber = sanitizeString($input['tracking_number'] ?? null);
    $internalNotes = sanitizeString($input['internal_notes'] ?? null);
    $newPaymentStatus = sanitizeString($input['payment_status'] ?? $input['paymentStatus'] ?? null);
    $newVerificationStatus = sanitizeString($input['payment_verification_status'] ?? $input['paymentVerificationStatus'] ?? null);
    $rejectionReason = sanitizeString($input['payment_rejection_reason'] ?? $input['paymentRejectionReason'] ?? null);

    $allowedOrderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if ($newStatus !== null && !in_array($newStatus, $allowedOrderStatuses, true)) {
        jsonError('Invalid order status', 400);
    }

    $allowedVerificationStatuses = ['pending_verification', 'verified', 'rejected'];
    if ($newVerificationStatus !== null && !in_array($newVerificationStatus, $allowedVerificationStatuses, true)) {
        jsonError('Invalid payment verification status', 400);
    }

    if ($newVerificationStatus === 'rejected' && empty(trim((string)$rejectionReason))) {
        jsonError('Please provide a rejection reason when rejecting an advance payment.', 400);
    }

    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ? OR order_number = ? LIMIT 1");
    $stmt->execute([$id, $id]);
    $order = $stmt->fetch();

    if (!$order) {
        jsonError('Order not found', 404);
    }

    $oldStatus = $order['order_status'];
    $oldPaymentStatus = $order['payment_status'];
    $oldVerificationStatus = $order['payment_verification_status'] ?: 'pending_verification';

    try {
        $db->beginTransaction();

        // ML INVENTORY DEDUCTION TRIGGER:
        // Only deduct when admin confirms/processes/ships/delivers or marks payment verified/paid
        $isNowConfirmedOrPaid =
            in_array($newStatus, ['confirmed', 'processing', 'shipped', 'delivered'], true) ||
            $newPaymentStatus === 'paid' ||
            $newVerificationStatus === 'verified';
        if ($isNowConfirmedOrPaid && $oldStatus !== 'cancelled' && $newStatus !== 'cancelled') {
            deductInventoryForOrder($db, (int)$order['id'], $admin['username']);
        }

        // ML INVENTORY RESTORATION TRIGGER:
        if (($newStatus === 'cancelled' && $oldStatus !== 'cancelled') || ($newPaymentStatus === 'refunded' && $oldPaymentStatus !== 'refunded')) {
            $txType = ($newPaymentStatus === 'refunded') ? 'order_refund' : 'order_cancellation';
            restoreInventoryForOrder($db, (int)$order['id'], $txType, $admin['username']);

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

        // Handle manual payment verification state transitions
        $verifiedAtClause = "";
        $verificationParams = [];

        if ($newVerificationStatus !== null) {
            if ($newVerificationStatus === 'verified') {
                $verifiedAtClause = ", payment_verification_status = ?, payment_verified_at = CURRENT_TIMESTAMP, payment_verified_by = ?, payment_rejection_reason = NULL";
                $verificationParams = ['verified', $admin['username']];
            } elseif ($newVerificationStatus === 'rejected') {
                $verifiedAtClause = ", payment_verification_status = ?, payment_verified_at = CURRENT_TIMESTAMP, payment_verified_by = ?, payment_rejection_reason = ?, payment_status = 'unpaid'";
                $verificationParams = ['rejected', $admin['username'], trim((string)$rejectionReason)];
            } else {
                $verifiedAtClause = ", payment_verification_status = ?, payment_verified_at = NULL, payment_verified_by = NULL, payment_rejection_reason = NULL, payment_status = 'unpaid'";
                $verificationParams = ['pending_verification'];
            }
        }

        $upSql = "UPDATE orders SET order_status = COALESCE(?, order_status), payment_status = COALESCE(?, payment_status), tracking_number = COALESCE(?, tracking_number), internal_notes = COALESCE(?, internal_notes){$verifiedAtClause} WHERE id = ?";
        $upParams = array_merge(
            [$newStatus, $newPaymentStatus, $trackingNumber, $internalNotes],
            $verificationParams,
            [$order['id']]
        );
        $upStmt = $db->prepare($upSql);
        $upStmt->execute($upParams);

        // Insert history record if fulfillment status changed
        if ($newStatus && $newStatus !== $oldStatus) {
            $hist = $db->prepare("INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by) VALUES (?, ?, ?, ?, ?)");
            $hist->execute([$order['id'], $oldStatus, $newStatus, "Status updated by admin", $admin['username']]);
        }

        // Insert history & audit record if payment verification changed
        if ($newVerificationStatus && $newVerificationStatus !== $oldVerificationStatus) {
            $vNote = $newVerificationStatus === 'verified'
                ? "Advance payment (৳250) manually verified by {$admin['username']}"
                : ($newVerificationStatus === 'rejected'
                    ? "Advance payment rejected by {$admin['username']}: {$rejectionReason}"
                    : "Advance payment reset to Pending Verification by {$admin['username']}");

            $histV = $db->prepare("INSERT INTO order_status_history (order_id, old_status, new_status, note, changed_by) VALUES (?, ?, ?, ?, ?)");
            $histV->execute([$order['id'], $oldVerificationStatus, $newVerificationStatus, $vNote, $admin['username']]);

            $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'verify_payment', 'orders', ?, ?)");
            $logStmt->execute([$admin['id'], $order['id'], "Updated order #{$order['order_number']} advance verification to {$newVerificationStatus}"]);
        } else {
            $logStmt = $db->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'update_order', 'orders', ?, ?)");
            $logStmt->execute([$admin['id'], $order['id'], "Updated order #{$order['order_number']}"]);
        }

        $db->commit();

        // Return refreshed order object
        $refreshStmt = $db->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
        $refreshStmt->execute([$order['id']]);
        $updatedOrder = normalizeOrderPaymentFields($refreshStmt->fetch());

        jsonResponse($updatedOrder, 200, 'Order updated successfully');

    } catch (\Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonError('Failed to update order. Please try again.', 500);
    }

} else {
    jsonError('Method not allowed', 405);
}
