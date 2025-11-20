<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

session_start();

function ensureAuth() { if (!isset($_SESSION['user'])) sendJsonResponse(['error'=>'Unauthorized'],401); }

switch ($method) {
  case 'GET':
    if ($action === 'categories') {
      $res = $conn->query('SELECT * FROM forum_categories ORDER BY name');
      sendJsonResponse($res->fetch_all(MYSQLI_ASSOC));
    } elseif ($action === 'topics') {
      $catId = $_GET['categoryId'] ?? '';
      if (!$catId) sendJsonResponse(['error'=>'categoryId required'],400);
      $stmt = $conn->prepare('SELECT * FROM forum_topics WHERE categoryId = ? ORDER BY updatedAt DESC');
      $stmt->bind_param('s', $catId);
      $stmt->execute();
      $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
      $stmt->close();
      sendJsonResponse($rows);
    } elseif ($action === 'posts') {
      $topicId = $_GET['topicId'] ?? '';
      if (!$topicId) sendJsonResponse(['error'=>'topicId required'],400);
      $stmt = $conn->prepare('SELECT * FROM forum_posts WHERE topicId = ? AND isHidden = 0 ORDER BY createdAt ASC');
      $stmt->bind_param('s', $topicId);
      $stmt->execute();
      $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
      $stmt->close();
      sendJsonResponse($rows);
    } else {
      sendJsonResponse(['error'=>'Invalid action'],400);
    }
    break;

  case 'POST':
    ensureAuth();
    $user = $_SESSION['user'];
    $data = getJsonInput();
    if ($action === 'category') {
      validateRequired($data, ['name']);
      $id = generateId();
      $stmt = $conn->prepare('INSERT INTO forum_categories (id, name, description, createdAt) VALUES (?,?,?,NOW())');
      $stmt->bind_param('sss', $id, $data['name'], $data['description'] ?? null);
      if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to create'],500);
      $stmt->close();
      logAction('Forum', $user['username'], 'Category created: ' . $data['name']);
      sendJsonResponse(['id'=>$id],201);
    } elseif ($action === 'topic') {
      validateRequired($data, ['categoryId','title']);
      $id = generateId();
      $stmt = $conn->prepare('INSERT INTO forum_topics (id, categoryId, title, authorId, isLocked, createdAt, updatedAt) VALUES (?,?,?,?,0,NOW(),NOW())');
      $stmt->bind_param('ssss', $id, $data['categoryId'], $data['title'], $user['id']);
      if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to create topic'],500);
      $stmt->close();
      logAction('Forum', $user['username'], 'Topic created: ' . $data['title']);
      sendJsonResponse(['id'=>$id],201);
    } elseif ($action === 'post') {
      validateRequired($data, ['topicId','content']);
      $id = generateId();
      $stmt = $conn->prepare('INSERT INTO forum_posts (id, topicId, authorId, content, isHidden, createdAt, updatedAt) VALUES (?,?,?,?,0,NOW(),NOW())');
      $stmt->bind_param('ssss', $id, $data['topicId'], $user['id'], $data['content']);
      if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to create post'],500);
      $stmt->close();
      logAction('Forum', $user['username'], 'Post created in topic ' . $data['topicId']);
      sendJsonResponse(['id'=>$id],201);
    } else {
      sendJsonResponse(['error'=>'Invalid action'],400);
    }
    break;

  case 'PUT':
    ensureAuth();
    $data = getJsonInput();
    if ($action === 'moderate') {
      validateRequired($data, ['postId','isHidden']);
      $stmt = $conn->prepare('UPDATE forum_posts SET isHidden = ?, updatedAt = NOW() WHERE id = ?');
      $hidden = intval($data['isHidden']) ? 1 : 0;
      $stmt->bind_param('is', $hidden, $data['postId']);
      if (!$stmt->execute()) sendJsonResponse(['error'=>'Failed to moderate'],500);
      $stmt->close();
      logAction('Forum', $_SESSION['user']['username'], 'Post moderated: ' . $data['postId']);
      sendJsonResponse(['success'=>true]);
    } else {
      sendJsonResponse(['error'=>'Invalid action'],400);
    }
    break;

  default:
    sendJsonResponse(['error'=>'Method not allowed'],405);
}
?>
