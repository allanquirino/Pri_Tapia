<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

session_start();
if (!isset($_SESSION['user'])) {
  sendJsonResponse(['error'=>'Unauthorized'],401);
}
$userId = $_SESSION['user']['id'];

switch ($method) {
  case 'GET':
    $stmt = $conn->prepare('SELECT * FROM calendar_events WHERE userId = ? ORDER BY eventDate ASC');
    $stmt->bind_param('s', $userId);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    sendJsonResponse($rows);
    break;

  case 'POST':
    $data = getJsonInput();
    validateRequired($data, ['title','eventDate','type']);
    $id = generateId();
    $stmt = $conn->prepare('INSERT INTO calendar_events (id, userId, petId, title, description, eventDate, eventTime, type, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())');
    $stmt->bind_param('ssssssss', $id, $userId, $data['petId'] ?? null, $data['title'], $data['description'] ?? null, $data['eventDate'], $data['eventTime'] ?? null, $data['type']);
    if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to create event'],500);
    $stmt->close();
    logAction('Calendar', $_SESSION['user']['username'], 'Event created: ' . $data['title']);
    sendJsonResponse(['id'=>$id],201);
    break;

  case 'PUT':
    if (!$id) sendJsonResponse(['error'=>'Event ID required'],400);
    $data = getJsonInput();
    $fields = ['title','description','eventDate','eventTime','type'];
    $updates = [];
    $types='';
    $params=[];
    foreach ($fields as $f) { if (isset($data[$f])) { $updates[] = "$f = ?"; $types.='s'; $params[] = $data[$f]; } }
    if (empty($updates)) sendJsonResponse(['error'=>'No fields to update'],400);
    $updates[] = 'updatedAt = NOW()';
    $sql = 'UPDATE calendar_events SET ' . implode(', ', $updates) . ' WHERE id = ? AND userId = ?';
    $types .= 'ss';
    $params[] = $id; $params[] = $userId;
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to update'],500);
    $stmt->close();
    logAction('Calendar', $_SESSION['user']['username'], 'Event updated: ' . $id);
    sendJsonResponse(['success'=>true]);
    break;

  case 'DELETE':
    if (!$id) sendJsonResponse(['error'=>'Event ID required'],400);
    $stmt = $conn->prepare('DELETE FROM calendar_events WHERE id = ? AND userId = ?');
    $stmt->bind_param('ss', $id, $userId);
    if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to delete'],500);
    $stmt->close();
    logAction('Calendar', $_SESSION['user']['username'], 'Event deleted: ' . $id);
    sendJsonResponse(['success'=>true]);
    break;

  default:
    sendJsonResponse(['error'=>'Method not allowed'],405);
}
?>
