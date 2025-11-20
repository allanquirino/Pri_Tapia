<?php
require_once '../config.php';
session_start();

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            // Get single user
            $stmt = $conn->prepare("SELECT id, username, email, fullName, role, isActive, createdAt, lastLogin FROM users WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            $stmt->close();

            if ($user) {
                sendJsonResponse($user);
            } else {
                sendJsonResponse(['error' => 'User not found'], 404);
            }
        } else {
            // Get all users
            $result = $conn->query("SELECT id, username, email, fullName, role, isActive, createdAt, lastLogin FROM users ORDER BY createdAt DESC");
            $users = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($users);
        }
        break;

    case 'POST':
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
            sendJsonResponse(['error' => 'Forbidden'], 403);
        }
        // CSRF token check
        $csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!isset($_SESSION['csrf_token']) || $csrf !== $_SESSION['csrf_token']) {
            sendJsonResponse(['error' => 'Invalid CSRF token'], 403);
        }
        $data = getJsonInput();
        validateRequired($data, ['email', 'fullName', 'password', 'role']);
        // Validate role
        $allowedRoles = ['admin','user'];
        if (!in_array($data['role'], $allowedRoles)) {
            $data['role'] = 'user';
        }
        // Basic password policy
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/', $data['password'])) {
            sendJsonResponse(['error' => 'Weak password'], 400);
        }
        // Rate limit (max 5 per minute)
        $now = time();
        $_SESSION['create_user_attempts'] = $_SESSION['create_user_attempts'] ?? [];
        $_SESSION['create_user_attempts'] = array_filter($_SESSION['create_user_attempts'], function($t) use ($now){ return $now - $t < 60; });
        if (count($_SESSION['create_user_attempts']) >= 5) {
            sendJsonResponse(['error' => 'Too many attempts'], 429);
        }
        $_SESSION['create_user_attempts'][] = $now;

        $id = generateId();
        $createdAt = date('Y-m-d H:i:s');
        $activationToken = bin2hex(random_bytes(16));

        $stmt = $conn->prepare("INSERT INTO users (id, username, email, fullName, password, role, isActive, activationToken, activationSentAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?, NOW(), ?)");
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $username = $data['email'];
        $stmt->bind_param('ssssssss', $id, $username, $data['email'], $data['fullName'], $hashed, $data['role'], $activationToken, $createdAt);

        if ($stmt->execute()) {
            logAction('User Management', 'System', 'New user created: ' . $data['username']);
            // Send activation email
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $link = 'https://' . $host . '/backend/api/activate.php?token=' . $activationToken;
            $subject = 'Ative sua conta - PriTapia ONG';
            $message = "Olá, \n\nPor favor ative sua conta clicando no link: $link \n\nObrigado.";
            $headers = 'From: no-reply@' . $host;
            $sent = @mail($data['email'], $subject, $message, $headers);
            sendJsonResponse(['id' => $id, 'email' => $data['email'], 'role' => $data['role'], 'createdAt' => $createdAt, 'activationEmailSent' => $sent], 201);
        } else {
            sendJsonResponse(['error' => 'Failed to create user'], 500);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
            sendJsonResponse(['error' => 'Forbidden'], 403);
        }
        if (!$id) {
            sendJsonResponse(['error' => 'User ID required'], 400);
        }

        $data = getJsonInput();
        $updates = [];
        $types = '';
        $params = [];

        if (isset($data['username'])) {
            $updates[] = 'username = ?';
            $types .= 's';
            $params[] = $data['username'];
        }
        if (isset($data['password'])) {
            $updates[] = 'password = ?';
            $types .= 's';
            $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        if (isset($data['role'])) {
            $updates[] = 'role = ?';
            $types .= 's';
            $params[] = $data['role'];
        }
        if (isset($data['email'])) {
            $updates[] = 'email = ?';
            $types .= 's';
            $params[] = $data['email'];
        }
        if (isset($data['fullName'])) {
            $updates[] = 'fullName = ?';
            $types .= 's';
            $params[] = $data['fullName'];
        }
        if (isset($data['isActive'])) {
            $updates[] = 'isActive = ?';
            $types .= 'i';
            $params[] = intval($data['isActive']);
        }
        if (isset($data['lastLogin'])) {
            $updates[] = 'lastLogin = ?';
            $types .= 's';
            $params[] = $data['lastLogin'];
        }

        if (empty($updates)) {
            sendJsonResponse(['error' => 'No fields to update'], 400);
        }

        $params[] = $id;
        $types .= 's';

        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            logAction('User Management', 'System', 'User updated: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to update user'], 500);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
            sendJsonResponse(['error' => 'Forbidden'], 403);
        }
        if (!$id) {
            sendJsonResponse(['error' => 'User ID required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param('s', $id);

        if ($stmt->execute()) {
            logAction('User Management', 'System', 'User deleted: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to delete user'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>
