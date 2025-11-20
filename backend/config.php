<?php
// Database configuration for PriTapia NGO
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database credentials with environment variable support
define('DB_HOST', getenv('PRI_DB_HOST') ?: 'localhost');
define('DB_USER', getenv('PRI_DB_USER') ?: '');
define('DB_PASS', getenv('PRI_DB_PASS') ?: '');
define('DB_NAME', getenv('PRI_DB_NAME') ?: '');

define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');

// Create database connection
function getDBConnection() {
    static $conn = null;
    if ($conn === null) {
        if (!DB_USER || !DB_PASS || !DB_NAME) {
            http_response_code(500);
            echo json_encode(['error' => 'Database credentials not configured']);
            exit;
        }
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}

// Helper function to get JSON input
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Helper function to validate required fields
function validateRequired($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendJsonResponse(['error' => "Missing required field: $field"], 400);
        }
    }
}

// Generate ID similar to frontend
function generateId() {
    return date('YmdHis') . rand(1000, 9999);
}

// Log action to audit_logs table
function logAction($module, $user, $details) {
    $conn = getDBConnection();
    $id = generateId();
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';

    $stmt = $conn->prepare("INSERT INTO audit_logs (id, action, user, timestamp, details, module, ipAddress) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $action = $module . ' operation';
    $stmt->bind_param('sssssss', $id, $action, $user, $timestamp, $details, $module, $ip);
    $stmt->execute();
    $stmt->close();
}

// Base32 decode
function base32Decode($b32) {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $b32 = strtoupper($b32);
    $buffer = 0; $bitsLeft = 0; $result = '';
    for ($i=0; $i<strlen($b32); $i++) {
        $val = strpos($alphabet, $b32[$i]);
        if ($val === false) continue;
        $buffer = ($buffer << 5) | $val;
        $bitsLeft += 5;
        if ($bitsLeft >= 8) {
            $bitsLeft -= 8;
            $result .= chr(($buffer >> $bitsLeft) & 0xFF);
        }
    }
    return $result;
}

// Verify TOTP (RFC6238)
function verifyTotp($secret, $code, $window = 1, $digits = 6, $period = 30) {
    if (!$secret) return false;
    $t = floor(time() / $period);
    $binSecret = base32Decode($secret);
    for ($i = -$window; $i <= $window; $i++) {
        $counter = pack('N*', 0) . pack('N*', $t + $i);
        $hash = hash_hmac('sha1', $counter, $binSecret, true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $binary = ((ord($hash[$offset]) & 0x7F) << 24) |
                  ((ord($hash[$offset + 1]) & 0xFF) << 16) |
                  ((ord($hash[$offset + 2]) & 0xFF) << 8) |
                  (ord($hash[$offset + 3]) & 0xFF);
        $otp = $binary % pow(10, $digits);
        $otpStr = str_pad($otp, $digits, '0', STR_PAD_LEFT);
        if (hash_equals($otpStr, $code)) return true;
    }
    return false;
}
?>
