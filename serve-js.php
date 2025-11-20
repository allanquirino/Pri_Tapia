<?php
// PHP script to serve JavaScript files with correct MIME type
// Usage: serve-js.php?file=assets/index-abc123.js

$file = $_GET['file'] ?? '';

if (!$file) {
    http_response_code(400);
    echo 'File parameter required';
    exit;
}

// Security: only allow assets/ directory
if (strpos($file, '..') !== false || strpos($file, '/') === 0) {
    http_response_code(403);
    echo 'Access denied';
    exit;
}

$filePath = __DIR__ . '/' . $file;

if (!file_exists($filePath)) {
    http_response_code(404);
    echo 'File not found';
    exit;
}

// Set correct MIME type
$mime = 'application/javascript';
if (strpos($file, '.css') !== false) {
    $mime = 'text/css';
} elseif (strpos($file, '.json') !== false) {
    $mime = 'application/json';
}

header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=31536000');
readfile($filePath);
?>