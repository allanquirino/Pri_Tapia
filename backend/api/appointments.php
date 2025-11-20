<?php
require_once '../config.php';
session_start();

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT * FROM appointments WHERE id = ?");
            $stmt->bind_param('s', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $appointment = $result->fetch_assoc();
            $stmt->close();

            if ($appointment) {
                sendJsonResponse($appointment);
            } else {
                sendJsonResponse(['error' => 'Appointment not found'], 404);
            }
        } else {
            $result = $conn->query("SELECT * FROM appointments ORDER BY createdAt DESC");
            $appointments = $result->fetch_all(MYSQLI_ASSOC);
            sendJsonResponse($appointments);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        validateRequired($data, ['clientId', 'clientName', 'service', 'date', 'time', 'duration', 'status']);

        $id = generateId();
        $createdAt = date('Y-m-d H:i:s');
        $updatedAt = $createdAt;

        $stmt = $conn->prepare("INSERT INTO appointments (id, clientId, clientName, service, date, time, duration, status, price, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('ssssssssdsss', $id, $data['clientId'], $data['clientName'], $data['service'], $data['date'], $data['time'], $data['duration'], $data['status'], $data['price'] ?? null, $data['notes'] ?? null, $createdAt, $updatedAt);

        if ($stmt->execute()) {
            logAction('Appointment Management', 'System', 'New appointment created: ' . $data['service'] . ' for ' . $data['clientName']);
            $userId = $_SESSION['user']['id'] ?? '';
            if ($userId) {
                $trow = $conn->query("SELECT accessToken FROM google_tokens WHERE userId='" . $conn->real_escape_string($userId) . "'")->fetch_assoc();
                if ($trow) {
                    $token = $trow['accessToken'];
                    $start = $data['date'] . 'T' . $data['time'] . ':00';
                    $endTs = strtotime($start) + (int)$data['duration'] * 60;
                    $end = date('Y-m-d\TH:i:s', $endTs);
                    $payload = json_encode([
                        'summary' => $data['service'],
                        'description' => $data['notes'] ?? '',
                        'start' => ['dateTime' => $start],
                        'end' => ['dateTime' => $end]
                    ]);
                    $ch = curl_init('https://www.googleapis.com/calendar/v3/calendars/primary/events');
                    curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>$payload,CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>["Authorization: Bearer {$token}","Content-Type: application/json"]]);
                    $res = json_decode(curl_exec($ch), true);
                    curl_close($ch);
                    if (isset($res['id'])) {
                        $stmt2 = $conn->prepare('REPLACE INTO calendar_event_links (userId, crmAppointmentId, googleEventId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())');
                        $stmt2->bind_param('sss', $userId, $id, $res['id']);
                        $stmt2->execute(); $stmt2->close();
                    }
                }
            }
            sendJsonResponse(array_merge($data, ['id' => $id, 'createdAt' => $createdAt, 'updatedAt' => $updatedAt]), 201);
        } else {
            sendJsonResponse(['error' => 'Failed to create appointment'], 500);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!$id) {
            sendJsonResponse(['error' => 'Appointment ID required'], 400);
        }

        $data = getJsonInput();
        $updates = [];
        $types = '';
        $params = [];

        $fields = ['clientId', 'clientName', 'service', 'date', 'time', 'duration', 'status', 'price', 'notes'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = $field . ' = ?';
                $types .= ($field === 'price') ? 'd' : 's';
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

        $sql = "UPDATE appointments SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        if ($stmt->execute()) {
            logAction('Appointment Management', 'System', 'Appointment updated: ' . $id);
            $userId = $_SESSION['user']['id'] ?? '';
            if ($userId) {
                $link = $conn->query("SELECT googleEventId FROM calendar_event_links WHERE userId='" . $conn->real_escape_string($userId) . "' AND crmAppointmentId='" . $conn->real_escape_string($id) . "'")->fetch_assoc();
                if ($link) {
                    $trow = $conn->query("SELECT accessToken FROM google_tokens WHERE userId='" . $conn->real_escape_string($userId) . "'")->fetch_assoc();
                    if ($trow) {
                        $token = $trow['accessToken'];
                        $gurl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events/' . urlencode($link['googleEventId']);
                        $payload = [];
                        if (isset($data['service'])) { $payload['summary'] = $data['service']; }
                        if (isset($data['notes'])) { $payload['description'] = $data['notes']; }
                        if (isset($data['date']) || isset($data['time']) || isset($data['duration'])) {
                            $startBase = isset($data['date']) ? $data['date'] : ($conn->query("SELECT date FROM appointments WHERE id='" . $conn->real_escape_string($id) . "'")->fetch_assoc()['date']);
                            $timeBase = isset($data['time']) ? $data['time'] : ($conn->query("SELECT time FROM appointments WHERE id='" . $conn->real_escape_string($id) . "'")->fetch_assoc()['time']);
                            $durBase = isset($data['duration']) ? (int)$data['duration'] : (int)$conn->query("SELECT duration FROM appointments WHERE id='" . $conn->real_escape_string($id) . "'")->fetch_assoc()['duration'];
                            $start = $startBase . 'T' . $timeBase . ':00';
                            $end = date('Y-m-d\TH:i:s', strtotime($start) + $durBase * 60);
                            $payload['start'] = ['dateTime' => $start];
                            $payload['end'] = ['dateTime' => $end];
                        }
                        if (!empty($payload)) {
                            $ch = curl_init($gurl);
                            curl_setopt_array($ch,[CURLOPT_CUSTOMREQUEST=>'PATCH',CURLOPT_POSTFIELDS=>json_encode($payload),CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>["Authorization: Bearer {$token}","Content-Type: application/json"]]);
                            curl_exec($ch); curl_close($ch);
                        }
                    }
                }
            }
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to update appointment'], 500);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) {
            sendJsonResponse(['error' => 'Appointment ID required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM appointments WHERE id = ?");
        $stmt->bind_param('s', $id);

        if ($stmt->execute()) {
            logAction('Appointment Management', 'System', 'Appointment deleted: ' . $id);
            $userId = $_SESSION['user']['id'] ?? '';
            if ($userId) {
                $link = $conn->query("SELECT googleEventId FROM calendar_event_links WHERE userId='" . $conn->real_escape_string($userId) . "' AND crmAppointmentId='" . $conn->real_escape_string($id) . "'")->fetch_assoc();
                if ($link) {
                    $trow = $conn->query("SELECT accessToken FROM google_tokens WHERE userId='" . $conn->real_escape_string($userId) . "'")->fetch_assoc();
                    if ($trow) {
                        $token = $trow['accessToken'];
                        $gurl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events/' . urlencode($link['googleEventId']);
                        $ch = curl_init($gurl);
                        curl_setopt_array($ch,[CURLOPT_CUSTOMREQUEST=>'DELETE',CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>["Authorization: Bearer {$token}"]]);
                        curl_exec($ch); curl_close($ch);
                    }
                }
            }
            sendJsonResponse(['success' => true]);
        } else {
            sendJsonResponse(['error' => 'Failed to delete appointment'], 500);
        }
        $stmt->close();
        break;

    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}
?>
