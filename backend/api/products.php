<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $product = $result->fetch_assoc();
            $stmt->close();

            if ($product) {
                sendJsonResponse($product);
            } else {
                sendJsonResponse(['error' => 'Product not found'], 404);
            }
        } else {
            $result = $conn->query("SELECT * FROM products ORDER BY createdAt DESC");
            $products = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($products);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        validateRequired($data, ['name', 'category', 'quantity', 'minQuantity', 'unit', 'price']);

        $id = generateId();
        $createdAt = date('Y-m-d H:i:s');
        $updatedAt = $createdAt;

        $stmt = $conn->prepare("INSERT INTO products (id, name, category, quantity, minQuantity, unit, price, supplier, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('sssiissssss', $id, $data['name'], $data['category'], $data['quantity'], $data['minQuantity'], $data['unit'], $data['price'], $data['supplier'] ?? null, $data['description'] ?? null, $createdAt, $updatedAt);

        if ($stmt->execute()) {
            logAction('Inventory Management', 'System', 'New product added: ' . $data['name']);
            sendJsonResponse(array_merge($data, ['id' => $id, 'createdAt' => $createdAt, 'updatedAt' => $updatedAt]), 201);
        } else {
            sendJsonResponse(['error' => 'Failed to create product'], 500);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!$id) {
            sendJsonResponse(['error' => 'Product ID required'], 400);
        }

        $data = getJsonInput();
        $updates = [];
        $types = '';
        $params = [];

        $fields = ['name', 'category', 'quantity', 'minQuantity', 'unit', 'price', 'supplier', 'description'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = $field . ' = ?';
                $types .= (in_array($field, ['quantity', 'minQuantity'])) ? 'i' : 's';
                $params[] = $data[$field];
            }
        }

        if (empty($updates)) {
            sendJsonResponse(['error' => 'No fields to update'], 400);
        }

        $updates[] = 'updatedAt = ?';
        $types .= 's';
        $params[] = date('Y-m-d H:i:s');

        $params[] = $id;
        $types .= 's';

        $sql = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            logAction('Inventory Management', 'System', 'Product updated: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to update product'], 500);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) {
            sendJsonResponse(['error' => 'Product ID required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param('s', $id);

        if ($stmt->execute()) {
            logAction('Inventory Management', 'System', 'Product deleted: ' . $id);
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to delete product'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>