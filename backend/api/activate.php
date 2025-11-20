<?php
require_once '../config.php';

$conn = getDBConnection();
$token = $_GET['token'] ?? '';
if (!$token) {
    sendJsonResponse(['error' => 'Token required'], 400);
}

$stmt = $conn->prepare("UPDATE users SET isActive = 1, activationToken = NULL WHERE activationToken = ?");
$stmt->bind_param('s', $token);
if ($stmt->execute() && $stmt->affected_rows > 0) {
    sendJsonResponse(['success' => true]);
} else {
    sendJsonResponse(['error' => 'Invalid token'], 400);
}
$stmt->close();
?>
