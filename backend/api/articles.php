<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
  case 'GET':
    $category = $_GET['category'] ?? null;
    $q = $_GET['q'] ?? null;
    if ($id) {
      $stmt = $conn->prepare('SELECT * FROM articles WHERE id = ?');
      $stmt->bind_param('s', $id);
      $stmt->execute();
      $res = $stmt->get_result();
      $item = $res->fetch_assoc();
      $stmt->close();
      if (!$item) sendJsonResponse(['error' => 'Not found'], 404);
      if (!empty($item['tags'])) { $item['tags'] = json_decode($item['tags'], true); }
      sendJsonResponse($item);
    } else {
      $sql = 'SELECT * FROM articles';
      $params = [];
      $types = '';
      $conds = [];
      if ($category) { $conds[] = 'category = ?'; $types .= 's'; $params[] = $category; }
      if ($q) { $conds[] = '(title LIKE ? OR content LIKE ?)'; $types .= 'ss'; $like = '%' . $q . '%'; $params[] = $like; $params[] = $like; }
      if ($conds) { $sql .= ' WHERE ' . implode(' AND ', $conds); }
      $sql .= ' ORDER BY createdAt DESC';
      $stmt = $conn->prepare($sql);
      if ($params) { $stmt->bind_param($types, ...$params); }
      $stmt->execute();
      $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
      $stmt->close();
      foreach ($rows as &$r) { if (!empty($r['tags'])) $r['tags'] = json_decode($r['tags'], true); }
      sendJsonResponse($rows);
    }
    break;

  case 'POST':
    session_start();
    if (!isset($_SESSION['user'])) sendJsonResponse(['error' => 'Unauthorized'], 401);
    $data = getJsonInput();
    validateRequired($data, ['title','content','category']);
    $id = generateId();
    $now = date('Y-m-d H:i:s');
    $tags = isset($data['tags']) ? json_encode($data['tags']) : null;
    $reviewedBy = $data['reviewedBy'] ?? null;
    $isReviewed = $reviewedBy ? 1 : 0;
    $stmt = $conn->prepare('INSERT INTO articles (id, title, content, category, tags, reviewedBy, isReviewed, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?)');
    $stmt->bind_param('ssssssiss', $id, $data['title'], $data['content'], $data['category'], $tags, $reviewedBy, $isReviewed, $now, $now);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to create article'], 500);
    $stmt->close();
    logAction('Articles', $_SESSION['user']['username'], 'Article created: ' . $data['title']);
    sendJsonResponse(['id' => $id], 201);
    break;

  case 'PUT':
    session_start();
    if (!isset($_SESSION['user'])) sendJsonResponse(['error' => 'Unauthorized'], 401);
    if (!$id) sendJsonResponse(['error' => 'Article ID required'], 400);
    $data = getJsonInput();
    $updates = [];
    $types = '';
    $params = [];
    foreach (['title','content','category','tags','reviewedBy','isReviewed'] as $f) {
      if (isset($data[$f])) { $updates[] = "$f = ?"; $types .= 's'; $params[] = ($f === 'tags' ? json_encode($data[$f]) : $data[$f]); }
    }
    if (empty($updates)) sendJsonResponse(['error' => 'No fields to update'], 400);
    $updates[] = 'updatedAt = ?';
    $types .= 's';
    $params[] = date('Y-m-d H:i:s');
    $params[] = $id;
    $types .= 's';
    $sql = 'UPDATE articles SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to update'], 500);
    $stmt->close();
    logAction('Articles', $_SESSION['user']['username'], 'Article updated: ' . $id);
    sendJsonResponse(['success' => true]);
    break;

  case 'DELETE':
    session_start();
    if (!isset($_SESSION['user'])) sendJsonResponse(['error' => 'Unauthorized'], 401);
    if (!$id) sendJsonResponse(['error' => 'Article ID required'], 400);
    $stmt = $conn->prepare('DELETE FROM articles WHERE id = ?');
    $stmt->bind_param('s', $id);
    if (!$stmt->execute()) sendJsonResponse(['error' => 'Failed to delete'], 500);
    $stmt->close();
    logAction('Articles', $_SESSION['user']['username'], 'Article deleted: ' . $id);
    sendJsonResponse(['success' => true]);
    break;

  default:
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>
