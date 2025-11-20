<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT * FROM settings LIMIT 1");
        $settings = $result->fetch_assoc();
        if ($settings) {
            // Decode JSON fields
            $settings['businessHours'] = json_decode($settings['businessHours'], true);
            sendJsonResponse($settings);
        } else {
            sendJsonResponse(['error' => 'Settings not found'], 404);
        }
        break;

    case 'PUT':
        $data = getJsonInput();
        $updates = [];
        $types = '';
        $params = [];

        $fields = ['businessName', 'address', 'phone', 'email', 'businessHours', 'currency', 'language', 'theme'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = $field . ' = ?';
                $types .= 's';
                $params[] = ($field === 'businessHours') ? json_encode($data[$field]) : $data[$field];
            }
        }

        if (empty($updates)) {
            sendJsonResponse(['error' => 'No fields to update'], 400);
        }

        // Check if settings exist
        $check = $conn->query("SELECT id FROM settings LIMIT 1");
        if ($check->num_rows == 0) {
            // Insert new
            $id = generateId();
            $params = array_merge([$id], $params);
            $types = 's' . $types;
            $sql = "INSERT INTO settings (id, " . implode(', ', array_keys(array_filter($data, function($k) use ($fields) { return in_array($k, $fields); }, ARRAY_FILTER_USE_KEY))) . ") VALUES (?" . str_repeat(', ?', count($params)-1) . ")";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
        } else {
            // Update existing
            $sql = "UPDATE settings SET " . implode(', ', $updates);
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
        }

        if ($stmt->execute()) {
            logAction('Settings', 'System', 'Application settings updated');
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to update settings'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>