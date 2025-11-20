<?php
require_once './config.php';

$conn = getDBConnection();
$date = date('Ymd_His');
$backupDir = __DIR__ . '/../backups';
if (!is_dir($backupDir)) { @mkdir($backupDir, 0775, true); }
$file = $backupDir . "/db_backup_$date.json";

$tables = ['users','pets','pet_photos','articles','clinics','clinic_specialties','clinic_ratings','forum_categories','forum_topics','forum_posts','forum_post_votes','user_reputation','calendar_events','reminders','vaccination_schedule','audit_logs','settings'];
$data = [];
foreach ($tables as $t) {
  $res = $conn->query("SELECT * FROM $t");
  $data[$t] = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
}

$json = json_encode($data);
$ok = file_put_contents($file, $json) !== false;
if ($ok) {
  $rel = '/backups/' . basename($file);
  // record in backups table
  $stmt = $conn->prepare('INSERT INTO backups (id, filePath, createdAt, status, details) VALUES (?,?,?,?,?)');
  $id = date('YmdHis') . rand(1000,9999);
  $stmt->bind_param('sssss', $id, $rel, date('Y-m-d H:i:s'), $ok ? 'success' : 'error', 'Automated daily backup');
  $stmt->execute();
  $stmt->close();
  logAction('Backup', 'System', 'Daily backup created: ' . $rel);
}

sendJsonResponse(['success'=>$ok, 'path'=> isset($rel)?$rel:'' ]);
?>
