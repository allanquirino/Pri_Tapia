<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM clients WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $client = $result->fetch_assoc();
            $stmt->close();

            if ($client) {
                sendJsonResponse($client);
            } else {
                sendJsonResponse(['error' => 'Client not found'], 404);
            }
        } else {
            $result = $conn->query("SELECT * FROM clients ORDER BY createdAt DESC");
            $clients = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($clients);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        validateRequired($data, ['name', 'email', 'phone', 'lastVisit', 'totalVisits']);

        $id = generateId();
        $createdAt = date('Y-m-d H:i:s');
        $updatedAt = $createdAt;

        $stmt = $conn->prepare("INSERT INTO clients (id, name, email, phone, address, dateOfBirth, lastVisit, totalVisits, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('sssssssisss', $id, $data['name'], $data['email'], $data['phone'], $data['address'] ?? null, $data['dateOfBirth'] ?? null, $data['lastVisit'], $data['totalVisits'], $data['notes'] ?? null, $createdAt, $updatedAt);

        if ($stmt->execute()) {
            logAction('Client Management', 'System', 'New client added: ' . $data['name']);
            sendJsonResponse(array_merge($data, ['id' => $id, 'createdAt' => $createdAt, 'updatedAt' => $updatedAt]), 201);
        } else {
            sendJsonResponse(['error' => 'Failed to create client'], 500);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!$id) {
            sendJsonResponse(['error' => 'Client ID required'], 400);
        }

        $data = getJsonInput();
        $updates = [];
        $types = '';
        $params = [];

        $fields = ['name', 'email', 'phone', 'address', 'dateOfBirth', 'lastVisit', 'totalVisits', 'notes'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = $field . ' = ?';
                $types .= 's';
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

        $sql = "UPDATE clients SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            logAction('Client Management', 'System', 'Client updated: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to update client'], 500);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) {
            sendJsonResponse(['error' => 'Client ID required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM clients WHERE id = ?");
        $stmt->bind_param('s', $id);

        if ($stmt->execute()) {
            logAction('Client Management', 'System', 'Client deleted: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to delete client'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>