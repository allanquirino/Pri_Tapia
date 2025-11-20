<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM audit_logs WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $log = $result->fetch_assoc();
            $stmt->close();

            if ($log) {
                sendJsonResponse($log);
            } else {
                sendJsonResponse(['error' => 'Audit log not found'], 404);
            }
        } else {
            $result = $conn->query("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 1000");
            $logs = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($logs);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        validateRequired($data, ['action', 'user', 'details', 'module']);

        $id = generateId();
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';

        $stmt = $conn->prepare("INSERT INTO audit_logs (id, action, user, timestamp, details, module, ipAddress) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('sssssss', $id, $data['action'], $data['user'], $timestamp, $data['details'], $data['module'], $ip);

        if ($stmt->execute()) {
            sendJsonResponse(['id' => $id, 'timestamp' => $timestamp], 201);
        } else {
            sendJsonResponse(['error' => 'Failed to add audit log'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>