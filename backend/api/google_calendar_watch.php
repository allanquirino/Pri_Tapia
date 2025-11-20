<?php
require_once '../config.php';
session_start();
$userId = $_SESSION['user']['id'] ?? '';
if (!$userId) { sendJsonResponse(['error'=>'Unauthorized'],401); }
$conn = getDBConnection();
$row = $conn->query("SELECT accessToken FROM google_tokens WHERE userId='" . $conn->real_escape_string($userId) . "'")->fetch_assoc();
if (!$row) { sendJsonResponse(['error'=>'Not connected'],400); }
$token = $row['accessToken'];
$channelId = 'chan_' . bin2hex(random_bytes(8));
$address = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/backend/api/google_calendar_webhook.php';
$payload = json_encode(['id'=>$channelId,'type'=>'web_hook','address'=>$address]);
$ch = curl_init('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch');
curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>$payload,CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>["Authorization: Bearer {$token}","Content-Type: application/json"]]);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);
if (!isset($res['id'])) { sendJsonResponse(['error'=>'Failed to watch'],500); }
$stmt = $conn->prepare('REPLACE INTO calendar_channels (userId, channelId, resourceId, resourceUri, expiration, syncToken, createdAt) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?/1000), ?, NOW())');
$stmt->bind_param('ssssss', $userId, $res['id'], $res['resourceId'], $res['resourceUri'], $res['expiration'], $res['nextSyncToken']);
$stmt->execute(); $stmt->close();
sendJsonResponse(['channelId'=>$res['id']],201);
?>
