<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Get statistics
$clients = $conn->query("SELECT COUNT(*) as count FROM clients")->fetch_assoc()['count'];
$appointments = $conn->query("SELECT COUNT(*) as count FROM appointments")->fetch_assoc()['count'];
$products = $conn->query("SELECT COUNT(*) as count FROM products")->fetch_assoc()['count'];
$transactions = $conn->query("SELECT COUNT(*) as count FROM transactions")->fetch_assoc()['count'];

$today = date('Y-m-d');
$todayAppointments = $conn->query("SELECT COUNT(*) as count FROM appointments WHERE date = '$today'")->fetch_assoc()['count'];

$thisMonth = date('Y-m');
$monthlyRevenue = $conn->query("SELECT SUM(amount) as sum FROM transactions WHERE type = 'receita' AND date LIKE '$thisMonth%'")->fetch_assoc()['sum'] ?? 0;

$lowStockProducts = $conn->query("SELECT COUNT(*) as count FROM products WHERE quantity <= minQuantity")->fetch_assoc()['count'];

$totalRevenue = $conn->query("SELECT SUM(amount) as sum FROM transactions WHERE type = 'receita'")->fetch_assoc()['sum'] ?? 0;

$stats = [
    'totalClients' => (int)$clients,
    'todayAppointments' => (int)$todayAppointments,
    'totalProducts' => (int)$products,
    'lowStockProducts' => (int)$lowStockProducts,
    'monthlyRevenue' => (float)$monthlyRevenue,
    'totalRevenue' => (float)$totalRevenue
];

sendJsonResponse($stats);
?>