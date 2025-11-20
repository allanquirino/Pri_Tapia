<?php
require_once '../config.php';
session_start();
$userId = $_SESSION['user']['id'] ?? '';
if (!$userId) { sendJsonResponse(['error'=>'Unauthorized'],401); }
$conn = getDBConnection();
$trow = $conn->query("SELECT accessToken FROM google_tokens WHERE userId='" . $conn->real_escape_string($userId) . "'")->fetch_assoc();
if (!$trow) { sendJsonResponse(['error'=>'Not connected'],400); }
$token = $trow['accessToken'];
$crow = $conn->query("SELECT channelId, syncToken FROM calendar_channels WHERE userId='" . $conn->real_escape_string($userId) . "' ORDER BY createdAt DESC LIMIT 1")->fetch_assoc();
$syncToken = $crow['syncToken'] ?? null;
$url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
$query = $syncToken ? ['syncToken'=>$syncToken] : ['updatedMin'=>gmdate('Y-m-d\TH:i:s\Z', time()-3600)];
$ch = curl_init($url . '?' . http_build_query($query));
curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>["Authorization: Bearer {$token}"]]);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);
if (isset($res['items'])) {
  foreach ($res['items'] as $ev) {
    $gid = $ev['id']; $status = $ev['status'] ?? ''; $summary = $ev['summary'] ?? '';
    $start = $ev['start']['dateTime'] ?? ($ev['start']['date'] ?? '');
    $link = $conn->query("SELECT crmAppointmentId FROM calendar_event_links WHERE userId='" . $conn->real_escape_string($userId) . "' AND googleEventId='" . $conn->real_escape_string($gid) . "'")->fetch_assoc();
    if ($link && $status !== 'cancelled') {
      $aid = $link['crmAppointmentId']; $time = substr($start, 11, 5); $date = substr($start, 0, 10);
      $stmt = $conn->prepare("UPDATE appointments SET service=?, date=?, time=?, updatedAt=NOW() WHERE id=?");
      $stmt->bind_param('ssss', $summary, $date, $time, $aid); $stmt->execute(); $stmt->close();
    } elseif ($link && $status === 'cancelled') {
      $aid = $link['crmAppointmentId']; $stmt = $conn->prepare("UPDATE appointments SET status='cancelado', updatedAt=NOW() WHERE id=?");
      $stmt->bind_param('s', $aid); $stmt->execute(); $stmt->close();
    } elseif (!$link && $status !== 'cancelled') {
      $id = generateId(); $createdAt = date('Y-m-d H:i:s'); $updatedAt = $createdAt;
      $date = substr($start, 0, 10); $time = substr($start, 11, 5);
      $stmt = $conn->prepare("INSERT INTO appointments (id, clientId, clientName, service, date, time, duration, status, price, notes, createdAt, updatedAt) VALUES (?, '', '', ?, ?, ?, '60', 'confirmado', NULL, NULL, ?, ?)");
      $stmt->bind_param('sssssss', $id, $summary, $date, $time, $createdAt, $updatedAt); $stmt->execute(); $stmt->close();
      $stmt = $conn->prepare('REPLACE INTO calendar_event_links (userId, crmAppointmentId, googleEventId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())');
      $stmt->bind_param('sss', $userId, $id, $gid); $stmt->execute(); $stmt->close();
    }
  }
}
if (isset($res['nextSyncToken'])) {
  $stmt = $conn->prepare('UPDATE calendar_channels SET syncToken=? WHERE channelId=?');
  $stmt->bind_param('ss', $res['nextSyncToken'], $crow['channelId']); $stmt->execute(); $stmt->close();
}
sendJsonResponse(['success'=>true]);
?>
