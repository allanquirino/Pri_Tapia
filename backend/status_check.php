<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$status = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME'] ?? 'unknown',
    'php_version' => phpversion(),
    'checks' => []
];

$checks = [];

try {
    $conn = getDBConnection();
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result && $result->num_rows > 0) {
        $userCount = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'] ?? 0;
        $clientCount = $conn->query("SELECT COUNT(*) as count FROM clients")->fetch_assoc()['count'] ?? 0;
        $checks['database'] = [
            'status' => 'success',
            'message' => "Connected. Users: $userCount, Clients: $clientCount"
        ];
    } else {
        $checks['database'] = [
            'status' => 'error',
            'message' => 'Database connected but tables missing'
        ];
    }
} catch (Throwable $e) {
    $checks['database'] = [
        'status' => 'error',
        'message' => 'Exception: ' . $e->getMessage()
    ];
}

$required_files = [
    __DIR__ . '/../dist/index.html',
    __DIR__ . '/../.htaccess',
    __DIR__ . '/config.php',
    __DIR__ . '/api/users.php',
    __DIR__ . '/api/login.php'
];

$missing_files = [];
foreach ($required_files as $file) {
    if (!file_exists($file)) {
        $missing_files[] = basename($file);
    }
}

$checks['files'] = empty($missing_files)
    ? ['status' => 'success', 'message' => 'All required files present']
    : ['status' => 'error', 'message' => 'Missing files: ' . implode(', ', $missing_files)];

$has_errors = array_reduce($checks, function ($carry, $check) {
    return $carry || ($check['status'] === 'error');
}, false);

$status['overall_status'] = $has_errors ? 'error' : 'success';
$status['checks'] = $checks;

echo json_encode($status, JSON_PRETTY_PRINT);
?>
