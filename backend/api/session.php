<?php
require_once '../config.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['user'])) {
        sendJsonResponse($_SESSION['user']);
    } else {
        sendJsonResponse(['error' => 'Not logged in'], 401);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    session_destroy();
    sendJsonResponse(['success' => true]);
} else {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>