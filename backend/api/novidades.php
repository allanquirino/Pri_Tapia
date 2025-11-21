<?php
require_once '../config.php';
session_start();

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

function getBearerToken() {
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (stripos($hdr, 'Bearer ') === 0) {
        return substr($hdr, 7);
    }
    return '';
}

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT n.id, n.title, n.content, n.imageUrl, n.linkUrl, n.createdAt, u.username AS author FROM novidades n LEFT JOIN users u ON n.authorId = u.id WHERE n.id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $res = $stmt->get_result();
            $item = $res->fetch_assoc();
            $stmt->close();
            if ($item) sendJsonResponse($item); else sendJsonResponse(['error'=>'Not found'],404);
        } else {
            $result = $conn->query("SELECT n.id, n.title, n.content, n.imageUrl, n.linkUrl, n.createdAt, u.username AS author FROM novidades n LEFT JOIN users u ON n.authorId = u.id ORDER BY n.createdAt DESC");
            $items = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($items);
        }
        break;
    case 'POST':
        $token = getBearerToken();
        if (!$token || !isset($_SESSION['api_token']) || $token !== $_SESSION['api_token']) {
            sendJsonResponse(['error' => 'Unauthorized'], 401);
        }
        if (!isset($_SESSION['user'])) {
            sendJsonResponse(['error' => 'Unauthorized'], 401);
        }
        $user = $_SESSION['user'];
        $data = getJsonInput();
        validateRequired($data, ['title','content']);
        $idn = generateId();
        $createdAt = date('Y-m-d H:i:s');
        $imageUrl = $data['imageUrl'] ?? null;
        $linkUrl = $data['linkUrl'] ?? null;
        $stmt = $conn->prepare("INSERT INTO novidades (id, title, content, imageUrl, linkUrl, authorId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('sssssss', $idn, $data['title'], $data['content'], $imageUrl, $linkUrl, $user['id'], $createdAt);
        if ($stmt->execute()) {
            logAction('News', $user['username'], 'Nova novidade publicada: ' . $data['title']);
            sendJsonResponse(['id'=>$idn,'title'=>$data['title'],'content'=>$data['content'],'imageUrl'=>$imageUrl,'linkUrl'=>$linkUrl,'authorId'=>$user['id'],'createdAt'=>$createdAt],201);
        } else {
            sendJsonResponse(['error'=>'Failed to publish'],500);
        }
        $stmt->close();
        break;
    default:
        sendJsonResponse(['error'=>'Method not allowed'],405);
}
?>
