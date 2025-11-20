<?php
require_once '../config.php';
session_start();
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
}
sendJsonResponse(['token' => $_SESSION['csrf_token']]);
?>
