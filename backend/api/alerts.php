<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

session_start();

switch ($method) {
  case 'GET':
    $res = $conn->query("SELECT * FROM alerts ORDER BY FIELD(priority,'urgente','alta','media','baixa'), createdAt DESC");
    sendJsonResponse($res->fetch_all(MYSQLI_ASSOC));
    break;
  case 'POST':
    if (!isset($_SESSION['user'])) sendJsonResponse(['error'=>'Unauthorized'],401);
    $data = getJsonInput();
    validateRequired($data, ['title','message','priority']);
    $id = generateId();
    $stmt = $conn->prepare('INSERT INTO alerts (id, title, message, priority, scheduledAt, createdAt, createdBy) VALUES (?,?,?,?,?,NOW(),?)');
    $stmt->bind_param('ssssss', $id, $data['title'], $data['message'], $data['priority'], $data['scheduledAt'] ?? null, $_SESSION['user']['id']);
    if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to create alert'],500);
    $stmt->close();
    logAction('Alerts', $_SESSION['user']['username'], 'Alert created: ' . $data['title']);
    sendJsonResponse(['id'=>$id],201);
    break;
  case 'DELETE':
    if (!isset($_SESSION['user'])) sendJsonResponse(['error'=>'Unauthorized'],401);
    if (!$id) sendJsonResponse(['error'=>'Alert ID required'],400);
    $stmt = $conn->prepare('DELETE FROM alerts WHERE id = ?');
    $stmt->bind_param('s', $id);
    if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to delete'],500);
    $stmt->close();
    logAction('Alerts', $_SESSION['user']['username'], 'Alert deleted: ' . $id);
    sendJsonResponse(['success'=>true]);
    break;
  default:
    sendJsonResponse(['error'=>'Method not allowed'],405);
}
?>
