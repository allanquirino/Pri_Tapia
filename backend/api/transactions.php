<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM transactions WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $transaction = $result->fetch_assoc();
            $stmt->close();

            if ($transaction) {
                sendJsonResponse($transaction);
            } else {
                sendJsonResponse(['error' => 'Transaction not found'], 404);
            }
        } else {
            $result = $conn->query("SELECT * FROM transactions ORDER BY createdAt DESC");
            $transactions = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($transactions);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        validateRequired($data, ['type', 'description', 'category', 'amount', 'date']);

        $id = generateId();
        $createdAt = date('Y-m-d H:i:s');
        $updatedAt = $createdAt;

        $stmt = $conn->prepare("INSERT INTO transactions (id, type, description, category, amount, date, paymentMethod, clientId, appointmentId, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('ssssdsssssss', $id, $data['type'], $data['description'], $data['category'], $data['amount'], $data['date'], $data['paymentMethod'] ?? null, $data['clientId'] ?? null, $data['appointmentId'] ?? null, $data['notes'] ?? null, $createdAt, $updatedAt);

        if ($stmt->execute()) {
            logAction('Financial Management', 'System', 'New transaction: ' . $data['type'] . ' - ' . $data['description']);
            sendJsonResponse(array_merge($data, ['id' => $id, 'createdAt' => $createdAt, 'updatedAt' => $updatedAt]), 201);
        } else {
            sendJsonResponse(['error' => 'Failed to create transaction'], 500);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!$id) {
            sendJsonResponse(['error' => 'Transaction ID required'], 400);
        }

        $data = getJsonInput();
        $updates = [];
        $types = '';
        $params = [];

        $fields = ['type', 'description', 'category', 'amount', 'date', 'paymentMethod', 'clientId', 'appointmentId', 'notes'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = $field . ' = ?';
                $types .= ($field === 'amount') ? 'd' : 's';
                $params[] = $data[$field];
            }
        }

        if (empty($updates)) {
            sendJsonResponse(['error' => 'No fields to update'], 400);
        }

        $updates[] = 'updatedAt = ?';
        $types .= 's';
        $params[] = date('Y-m-d H:i:s');

        $params[] = $id;
        $types .= 's';

        $sql = "UPDATE transactions SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            logAction('Financial Management', 'System', 'Transaction updated: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to update transaction'], 500);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) {
            sendJsonResponse(['error' => 'Transaction ID required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM transactions WHERE id = ?");
        $stmt->bind_param('s', $id);

        if ($stmt->execute()) {
            logAction('Financial Management', 'System', 'Transaction deleted: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to delete transaction'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>
