<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

session_start();

function requireAuth() {
  if (!isset($_SESSION['user']) || !isset($_SESSION['api_token'])) {
    sendJsonResponse(['error' => 'Unauthorized'], 401);
  }
}

switch ($method) {
  case 'GET':
    $ownerId = $_GET['ownerId'] ?? null;
    if ($id) {
      $stmt = $conn->prepare('SELECT * FROM pets WHERE id = ?');
      $stmt->bind_param('s', $id);
      $stmt->execute();
      $res = $stmt->get_result();
      $pet = $res->fetch_assoc();
      $stmt->close();
      if (!$pet) sendJsonResponse(['error' => 'Not found'], 404);
      // photos
      $pstmt = $conn->prepare('SELECT id, url, mimeType, sizeBytes, createdAt FROM pet_photos WHERE petId = ?');
      $pstmt->bind_param('s', $id);
      $pstmt->execute();
      $photos = $pstmt->get_result()->fetch_all(MYSQLI_ASSOC);
      $pstmt->close();
      $pet['photos'] = $photos;
      sendJsonResponse($pet);
    } else {
      if ($ownerId) {
        $stmt = $conn->prepare('SELECT * FROM pets WHERE ownerId = ? ORDER BY createdAt DESC');
        $stmt->bind_param('s', $ownerId);
      } else {
        $stmt = $conn->prepare('SELECT * FROM pets ORDER BY createdAt DESC');
      }
      $stmt->execute();
      $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
      $stmt->close();
      sendJsonResponse($items);
    }
    break;

  case 'POST':
    requireAuth();
    $data = $_POST ? $_POST : getJsonInput();
    $required = ['name','species','sex'];
    validateRequired($data, $required);
    $id = generateId();
    $now = date('Y-m-d H:i:s');
    $ownerId = $_SESSION['user']['id'];
    $stmt = $conn->prepare('INSERT INTO pets (id, ownerId, name, species, breed, birthDate, sex, weightKg, color, medicalHistory, allergies, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $weight = isset($data['weightKg']) ? floatval($data['weightKg']) : null;
    $birth = isset($data['birthDate']) ? $data['birthDate'] : null;
    $stmt->bind_param('sssssssssssss', $id, $ownerId, $data['name'], $data['species'], $data['breed'] ?? null, $birth, $data['sex'], $weight, $data['color'] ?? null, $data['medicalHistory'] ?? null, $data['allergies'] ?? null, $now, $now);
    if (!$stmt->execute()) { sendJsonResponse(['error' => 'Failed to create pet'], 500); }
    $stmt->close();

    if (!empty($_FILES['photo'])) {
      $file = $_FILES['photo'];
      if ($file['error'] === UPLOAD_ERR_OK) {
        $allowed = ['image/jpeg','image/png'];
        if (!in_array($file['type'], $allowed)) { sendJsonResponse(['error' => 'Invalid file type'], 400); }
        if ($file['size'] > 2*1024*1024) { sendJsonResponse(['error' => 'File too large'], 400); }
        $uploadDir = __DIR__ . '/../../uploads';
        if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0775, true); }
        $fname = $id . '_' . basename($file['name']);
        $dest = $uploadDir . '/' . $fname;
        if (move_uploaded_file($file['tmp_name'], $dest)) {
          $url = '/uploads/' . $fname;
          $psId = generateId();
          $pstmt = $conn->prepare('INSERT INTO pet_photos (id, petId, url, mimeType, sizeBytes, createdAt) VALUES (?,?,?,?,?,?)');
          $pstmt->bind_param('ssssss', $psId, $id, $url, $file['type'], $file['size'], $now);
          $pstmt->execute();
          $pstmt->close();
        }
      }
    }

    logAction('Pet Management', $_SESSION['user']['username'], 'Pet created: ' . $data['name']);
    sendJsonResponse(['id' => $id]);
    break;

  case 'PUT':
    requireAuth();
    if (!$id) sendJsonResponse(['error' => 'Pet ID required'], 400);
    $data = getJsonInput();
    $fields = ['name','species','breed','birthDate','sex','weightKg','color','medicalHistory','allergies'];
    $updates = [];
    $types = '';
    $params = [];
    foreach ($fields as $f) {
      if (isset($data[$f])) { $updates[] = "$f = ?"; $types .= 's'; $params[] = $data[$f]; }
    }
    if (empty($updates)) sendJsonResponse(['error' => 'No fields to update'], 400);
    $updates[] = 'updatedAt = ?';
    $types .= 's';
    $params[] = date('Y-m-d H:i:s');
    $params[] = $id;
    $types .= 's';
    $sql = 'UPDATE pets SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to update'], 500);
    $stmt->close();
    logAction('Pet Management', $_SESSION['user']['username'], 'Pet updated: ' . $id);
    sendJsonResponse(['success' => true]);
    break;

  case 'DELETE':
    requireAuth();
    if (!$id) sendJsonResponse(['error' => 'Pet ID required'], 400);
    $stmt = $conn->prepare('DELETE FROM pets WHERE id = ?');
    $stmt->bind_param('s', $id);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to delete'], 500);
    $stmt->close();
    logAction('Pet Management', $_SESSION['user']['username'], 'Pet deleted: ' . $id);
    sendJsonResponse(['success' => true]);
    break;

  default:
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>
