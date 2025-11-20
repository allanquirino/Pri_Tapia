<?php
// Database connection test
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('DB_HOST', 'localhost');
define('DB_USER', 'hg0e7639_Wexio2025');
define('DB_PASS', 'Wexio2025');
define('DB_NAME', 'hg0e7639_NAEstetica');

try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Connection failed: ' . $conn->connect_error,
            'error_code' => $conn->connect_errno
        ]);
        exit;
    }

    // Test query
    $result = $conn->query("SELECT COUNT(*) as count FROM clients");
    if ($result) {
        $row = $result->fetch_assoc();
        echo json_encode([
            'status' => 'success',
            'message' => 'Database connection successful',
            'clients_count' => $row['count'],
            'server_info' => $conn->server_info
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Query failed: ' . $conn->error
        ]);
    }

    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Exception: ' . $e->getMessage()
    ]);
}
?>