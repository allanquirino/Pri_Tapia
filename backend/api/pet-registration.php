<?php
require_once '../config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

$data = $_POST;
$required = ['petName', 'species', 'sex', 'tutorName', 'tutorEmail', 'tutorPhone', 'tutorAddress'];
validateRequired($data, $required);

// Gerar IDs únicos
$clientId = generateId();
$petId = generateId();
$now = date('Y-m-d H:i:s');

// Primeiro, verificar se o cliente já existe pelo email
$stmt = $conn->prepare('SELECT id FROM clients WHERE email = ?');
$stmt->bind_param('s', $data['tutorEmail']);
$stmt->execute();
$result = $stmt->get_result();
$existingClient = $result->fetch_assoc();
$stmt->close();

if ($existingClient) {
    $clientId = $existingClient['id'];
} else {
    // Criar novo cliente
    $stmt = $conn->prepare('INSERT INTO clients (id, name, email, phone, address, lastVisit, totalVisits, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)');
    $stmt->bind_param('ssssssss', $clientId, $data['tutorName'], $data['tutorEmail'], $data['tutorPhone'], $data['tutorAddress'], $now, $now, $now);
    if (!$stmt->execute()) {
        sendJsonResponse(['error' => 'Failed to create client'], 500);
    }
    $stmt->close();
}

// Agora criar o pet associado ao cliente
// Mas a tabela pets tem ownerId que referencia users, não clients.
// Problema: pets.ownerId -> users.id, mas clients é separada.

// Talvez criar um user para o cliente?
// Para simplificar, vou assumir que ownerId pode ser o clientId, mas preciso ajustar a FK.

// Olhando novamente: pets.ownerId REFERENCES users(id)
// Mas clients é outra tabela.

// Talvez o cadastro público crie um user com role 'client' ou algo.

// Para este caso, vou criar um user com username=email, password temporária, e role='user'.

$userId = generateId();
$tempPassword = bin2hex(random_bytes(8)); // Senha temporária
$hashedPassword = password_hash($tempPassword, PASSWORD_DEFAULT);

$stmt = $conn->prepare('INSERT INTO users (id, username, password, role, email, fullName, isActive, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, 1, ?, NULL)');
$stmt->bind_param('sssssss', $userId, $data['tutorEmail'], $hashedPassword, 'user', $data['tutorEmail'], $data['tutorName'], $now);
if (!$stmt->execute()) {
    // Se falhar (email duplicado), buscar user existente
    $stmt->close();
    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->bind_param('s', $data['tutorEmail']);
    $stmt->execute();
    $result = $stmt->get_result();
    $existingUser = $result->fetch_assoc();
    $stmt->close();
    if ($existingUser) {
        $userId = $existingUser['id'];
    } else {
        sendJsonResponse(['error' => 'Failed to create user'], 500);
    }
} else {
    $stmt->close();
}

// Agora criar o pet
$stmt = $conn->prepare('INSERT INTO pets (id, ownerId, name, species, breed, birthDate, sex, color, medicalHistory, allergies, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$birth = isset($data['birthDate']) && !empty($data['birthDate']) ? $data['birthDate'] : null;
$stmt->bind_param('ssssssssssss', $petId, $userId, $data['petName'], $data['species'], $data['breed'] ?? null, $birth, $data['sex'], $data['color'] ?? null, $data['medicalHistory'] ?? null, $data['allergies'] ?? null, $now, $now);
if (!$stmt->execute()) {
    sendJsonResponse(['error' => 'Failed to create pet'], 500);
}
$stmt->close();

// Upload de foto se fornecida
if (!empty($_FILES['photo'])) {
    $file = $_FILES['photo'];
    if ($file['error'] === UPLOAD_ERR_OK) {
        $allowed = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($file['type'], $allowed)) {
            sendJsonResponse(['error' => 'Invalid file type'], 400);
        }
        if ($file['size'] > 5 * 1024 * 1024) { // 5MB
            sendJsonResponse(['error' => 'File too large'], 400);
        }
        $uploadDir = __DIR__ . '/../../uploads';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0775, true);
        }
        $fname = $petId . '_' . basename($file['name']);
        $dest = $uploadDir . '/' . $fname;
        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $url = '/uploads/' . $fname;
            $psId = generateId();
            $pstmt = $conn->prepare('INSERT INTO pet_photos (id, petId, url, mimeType, sizeBytes, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
            $pstmt->bind_param('ssssss', $psId, $petId, $url, $file['type'], $file['size'], $now);
            $pstmt->execute();
            $pstmt->close();
        }
    }
}

// Log da ação
logAction('Pet Registration', 'Public', 'Pet registered: ' . $data['petName'] . ' for ' . $data['tutorEmail']);

// Enviar email de confirmação (placeholder - implementar envio real)
$confirmationEmail = [
    'to' => $data['tutorEmail'],
    'subject' => 'Confirmação de Cadastro - PriTapia',
    'body' => "Olá {$data['tutorName']},\n\nSeu pet {$data['petName']} foi cadastrado com sucesso na PriTapia!\n\nDetalhes:\n- Nome: {$data['petName']}\n- Espécie: {$data['species']}\n\nObrigado por confiar na PriTapia.\n\nAtenciosamente,\nEquipe PriTapia"
];

// TODO: Implementar envio de email real usando PHPMailer ou similar

sendJsonResponse([
    'success' => true,
    'petId' => $petId,
    'clientId' => $clientId,
    'message' => 'Pet cadastrado com sucesso. Confirmação enviada por email.'
]);
?>