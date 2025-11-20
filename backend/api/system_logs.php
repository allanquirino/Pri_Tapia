<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM system_logs WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $log = $result->fetch_assoc();
            $stmt->close();

            if ($log) {
                sendJsonResponse($log);
            } else {
                sendJsonResponse(['error' => 'Log not found'], 404);
            }
        } else {
            $result = $conn->query("SELECT * FROM system_logs ORDER BY createdAt DESC LIMIT 1000");
            $logs = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($logs);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        validateRequired($data, ['type', 'action']);

        $id = generateId();
        $details = $data['details'] ?? null;
        $status = $data['status'] ?? null;
        $durationMs = isset($data['durationMs']) ? intval($data['durationMs']) : null;

        $stmt = $conn->prepare("INSERT INTO system_logs (id, type, action, details, status, durationMs, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param('sssssi', $id, $data['type'], $data['action'], $details, $status, $durationMs);

        if ($stmt->execute()) {
            sendJsonResponse(['id' => $id], 201);
        } else {
            sendJsonResponse(['error' => 'Failed to add log'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>
