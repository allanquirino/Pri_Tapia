<?php
// Simple test file to check PHP and database connection
header('Content-Type: application/json');

echo json_encode([
    'status' => 'PHP is working',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME'] ?? 'unknown',
    'php_version' => phpversion()
]);
?>