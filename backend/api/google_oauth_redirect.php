<?php
require_once '../config.php';
session_start();
$clientId = GOOGLE_CLIENT_ID;
$redirectUri = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/backend/api/google_oauth_callback.php';
$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;
$params = http_build_query([
  'client_id' => $clientId,
  'redirect_uri' => $redirectUri,
  'response_type' => 'code',
  'scope' => 'https://www.googleapis.com/auth/calendar',
  'access_type' => 'offline',
  'include_granted_scopes' => 'true',
  'state' => $state,
  'prompt' => 'consent'
]);
header('Location: https://accounts.google.com/o/oauth2/v2/auth?' . $params);
?>
