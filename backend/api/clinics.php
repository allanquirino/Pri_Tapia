<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
  case 'GET':
    if ($id) {
      $stmt = $conn->prepare('SELECT * FROM clinics WHERE id = ?');
      $stmt->bind_param('s', $id);
      $stmt->execute();
      $res = $stmt->get_result();
      $clinic = $res->fetch_assoc();
      $stmt->close();
      if (!$clinic) sendJsonResponse(['error' => 'Not found'], 404);
      $s = $conn->prepare('SELECT specialty FROM clinic_specialties WHERE clinicId = ?');
      $s->bind_param('s', $id);
      $s->execute();
      $specs = $s->get_result()->fetch_all(MYSQLI_ASSOC);
      $s->close();
      $clinic['specialties'] = array_map(fn($row) => $row['specialty'], $specs);
      sendJsonResponse($clinic);
    } else {
      $city = $_GET['city'] ?? null;
      $specialty = $_GET['specialty'] ?? null;
      $sql = 'SELECT c.* FROM clinics c';
      $conds = [];
      $params = [];
      $types = '';
      if ($specialty) { $sql .= ' JOIN clinic_specialties s ON s.clinicId = c.id'; $conds[] = 's.specialty = ?'; $types .= 's'; $params[] = $specialty; }
      if ($city) { $conds[] = 'c.city = ?'; $types .= 's'; $params[] = $city; }
      if ($conds) { $sql .= ' WHERE ' . implode(' AND ', $conds); }
      $sql .= ' ORDER BY c.createdAt DESC';
      $stmt = $conn->prepare($sql);
      if ($params) { $stmt->bind_param($types, ...$params); }
      $stmt->execute();
      $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
      $stmt->close();
      sendJsonResponse($rows);
    }
    break;

  case 'POST':
    session_start();
    if (!isset($_SESSION['user'])) sendJsonResponse(['error' => 'Unauthorized'], 401);
    $data = getJsonInput();
    validateRequired($data, ['name','address']);
    $id = generateId();
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare('INSERT INTO clinics (id, name, address, city, state, lat, lng, phone, website, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    $stmt->bind_param('sssssssssss', $id, $data['name'], $data['address'], $data['city'] ?? null, $data['state'] ?? null, $data['lat'] ?? null, $data['lng'] ?? null, $data['phone'] ?? null, $data['website'] ?? null, $now, $now);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to create clinic'], 500);
    $stmt->close();
    if (!empty($data['specialties']) && is_array($data['specialties'])) {
      foreach ($data['specialties'] as $sp) {
        $s = $conn->prepare('INSERT INTO clinic_specialties (clinicId, specialty) VALUES (?,?)');
        $s->bind_param('ss', $id, $sp);
        $s->execute();
        $s->close();
      }
    }
    logAction('Clinics', $_SESSION['user']['username'], 'Clinic created: ' . $data['name']);
    sendJsonResponse(['id' => $id], 201);
    break;

  case 'PUT':
    session_start();
    if (!isset($_SESSION['user'])) sendJsonResponse(['error' => 'Unauthorized'], 401);
    if (!$id) sendJsonResponse(['error' => 'Clinic ID required'], 400);
    $data = getJsonInput();
    $fields = ['name','address','city','state','lat','lng','phone','website'];
    $updates = [];
    $types = '';
    $params = [];
    foreach ($fields as $f) { if (isset($data[$f])) { $updates[] = "$f = ?"; $types .= 's'; $params[] = $data[$f]; } }
    if (empty($updates)) sendJsonResponse(['error' => 'No fields to update'], 400);
    $updates[] = 'updatedAt = ?';
    $types .= 's';
    $params[] = date('Y-m-d H:i:s');
    $params[] = $id;
    $types .= 's';
    $sql = 'UPDATE clinics SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to update'], 500);
    $stmt->close();
    if (isset($data['specialties']) && is_array($data['specialties'])) {
      $conn->query("DELETE FROM clinic_specialties WHERE clinicId = '" . $conn->real_escape_string($id) . "'");
      foreach ($data['specialties'] as $sp) {
        $s = $conn->prepare('INSERT INTO clinic_specialties (clinicId, specialty) VALUES (?,?)');
        $s->bind_param('ss', $id, $sp);
        $s->execute();
        $s->close();
      }
    }
    logAction('Clinics', $_SESSION['user']['username'], 'Clinic updated: ' . $id);
    sendJsonResponse(['success' => true]);
    break;

  case 'DELETE':
    session_start();
    if (!isset($_SESSION['user'])) sendJsonResponse(['error' => 'Unauthorized'], 401);
    if (!$id) sendJsonResponse(['error' => 'Clinic ID required'], 400);
    $stmt = $conn->prepare('DELETE FROM clinics WHERE id = ?');
    $stmt->bind_param('s', $id);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to delete'], 500);
    $stmt->close();
    logAction('Clinics', $_SESSION['user']['username'], 'Clinic deleted: ' . $id);
    sendJsonResponse(['success' => true]);
    break;

  default:
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>
