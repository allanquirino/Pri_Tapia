<?php
// Simple database connection test
header('Content-Type: application/json');

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('DB_HOST', 'localhost');
define('DB_USER', 'hg0e7639_Wexio2025');
define('DB_PASS', 'Wexio2025');
define('DB_NAME', 'hg0e7639_NAEstetica');

echo "Testing connection...\n";

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Connection failed: ' . $conn->connect_error,
        'error_code' => $conn->connect_errno
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'server_info' => $conn->server_info,
        'host_info' => $conn->host_info
    ]);
    $conn->close();
}
?>