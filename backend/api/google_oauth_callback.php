<?php
require_once '../config.php';
session_start();
if (!isset($_GET['state']) || $_GET['state'] !== ($_SESSION['oauth_state'] ?? '')) { http_response_code(403); exit; }
$code = $_GET['code'] ?? '';
$clientId = GOOGLE_CLIENT_ID;
$clientSecret = GOOGLE_CLIENT_SECRET;
$redirectUri = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/backend/api/google_oauth_callback.php';
$body = http_build_query([
  'code' => $code,
  'client_id' => $clientId,
  'client_secret' => $clientSecret,
  'redirect_uri' => $redirectUri,
  'grant_type' => 'authorization_code'
]);
$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_POSTFIELDS=>$body, CURLOPT_RETURNTRANSFER=>true]);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);
$accessToken = $res['access_token'] ?? '';
$refreshToken = $res['refresh_token'] ?? '';
$expiresIn = (int)($res['expires_in'] ?? 0);
$expiresAt = date('Y-m-d H:i:s', time() + $expiresIn);
$userId = $_SESSION['user']['id'] ?? '';
$conn = getDBConnection();
$stmt = $conn->prepare('REPLACE INTO google_tokens (userId, accessToken, refreshToken, expiresAt, scope, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
$scope = 'calendar';
$stmt->bind_param('sssss', $userId, $accessToken, $refreshToken, $expiresAt, $scope);
$stmt->execute(); $stmt->close();
header('Location: /admin');
?>
