<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM castration_registrations WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $registration = $result->fetch_assoc();
            $stmt->close();

            if ($registration) {
                sendJsonResponse($registration);
            } else {
                sendJsonResponse(['error' => 'Registration not found'], 404);
            }
        } else {
            $result = $conn->query("SELECT * FROM castration_registrations ORDER BY created_at DESC");
            $registrations = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($registrations);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        validateRequired($data, ['name', 'address', 'animal_type', 'sex', 'castration_status']);

        $id = generateId();
        $created_at = date('Y-m-d H:i:s');
        $updated_at = $created_at;

        $stmt = $conn->prepare("INSERT INTO castration_registrations (id, name, address, email, phone, animal_type, sex, age, castration_status, vaccines_up_to_date, called, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)");
        $stmt->bind_param('sssssssssiss', $id, $data['name'], $data['address'], $data['email'] ?? null, $data['phone'] ?? null, $data['animal_type'], $data['sex'], $data['age'] ?? null, $data['castration_status'], $data['vaccines_up_to_date'] ?? 0, $created_at, $updated_at);

        if ($stmt->execute()) {
            logAction('Castration Management', 'System', 'New registration added: ' . $data['name']);
            sendJsonResponse(array_merge($data, ['id' => $id, 'created_at' => $created_at, 'updated_at' => $updated_at]), 201);
        } else {
            sendJsonResponse(['error' => 'Failed to create registration'], 500);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!$id) {
            sendJsonResponse(['error' => 'Registration ID required'], 400);
        }

        $data = getJsonInput();
        $updates = [];
        $types = '';
        $params = [];

        $fields = ['name', 'address', 'email', 'phone', 'animal_type', 'sex', 'age', 'castration_status', 'vaccines_up_to_date', 'called'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = $field . ' = ?';
                $types .= is_int($data[$field]) ? 'i' : 's';
                $params[] = $data[$field];
            }
        }

        if (empty($updates)) {
            sendJsonResponse(['error' => 'No fields to update'], 400);
        }

        $updates[] = 'updated_at = ?';
        $types .= 's';
        $params[] = date('Y-m-d H:i:s');

        $params[] = $id;
        $types .= 's';

        $sql = "UPDATE castration_registrations SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            logAction('Castration Management', 'System', 'Registration updated: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to update registration'], 500);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) {
            sendJsonResponse(['error' => 'Registration ID required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM castration_registrations WHERE id = ?");
        $stmt->bind_param('s', $id);

        if ($stmt->execute()) {
            logAction('Castration Management', 'System', 'Registration deleted: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to delete registration'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>