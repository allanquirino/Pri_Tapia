<?php
require_once '../config.php';
session_start();
$userId = $_SESSION['user']['id'] ?? '';
$conn = getDBConnection();
$status = ['connected' => false, 'channelActive' => false, 'expiresAt' => null];
if ($userId) {
  $row = $conn->query("SELECT accessToken, expiresAt FROM google_tokens WHERE userId='" . $conn->real_escape_string($userId) . "'")->fetch_assoc();
  if ($row) {
    $status['connected'] = true;
    $status['expiresAt'] = $row['expiresAt'];
  }
  $chan = $conn->query("SELECT expiration FROM calendar_channels WHERE userId='" . $conn->real_escape_string($userId) . "' ORDER BY createdAt DESC LIMIT 1")->fetch_assoc();
  if ($chan && strtotime($chan['expiration']) > time()) {
    $status['channelActive'] = true;
  }
}
sendJsonResponse($status);
?>
