<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();
validateRequired($data, ['username', 'password']);

$username = $data['username'];
$password = $data['password'];

$stmt = $conn->prepare("SELECT id, username, password, role, isActive, createdAt, lastLogin, twoFactorEnabled, twoFactorSecret FROM users WHERE username = ?");
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if ($user && (password_verify($password, $user['password']) || $user['password'] === $password)) {
    if (!empty($user['twoFactorEnabled']) && intval($user['twoFactorEnabled']) === 1) {
        $totp = $data['totp'] ?? '';
        if (!$totp || !verifyTotp($user['twoFactorSecret'] ?? '', $totp)) {
            sendJsonResponse(['error' => 'Two-factor code required or invalid'], 401);
        }
    }
    if (isset($user['isActive']) && intval($user['isActive']) !== 1) {
        sendJsonResponse(['error' => 'Account not activated'], 403);
    }
    // Update last login
    $now = date('Y-m-d H:i:s');
    $updateStmt = $conn->prepare("UPDATE users SET lastLogin = ? WHERE id = ?");
    $updateStmt->bind_param('ss', $now, $user['id']);
    $updateStmt->execute();
    $updateStmt->close();

    session_start();
    $token = bin2hex(random_bytes(16));
    $_SESSION['user'] = [
        'id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role']
    ];
    $_SESSION['api_token'] = $token;

    logAction('Authentication', $username, 'User logged in successfully');

    // Remove password from response
    unset($user['password']);
    $user['lastLogin'] = $now;

    $user['token'] = $token;
    sendJsonResponse($user);
} else {
    logAction('Authentication', $username, 'Failed login attempt');
    sendJsonResponse(['error' => 'Invalid credentials'], 401);
}
?>
