<?php
declare(strict_types=1);

header('Content-Type: application/json');
require __DIR__ . '/connect.php';

$email = filter_input(INPUT_GET, 'email', FILTER_VALIDATE_EMAIL);

if (!$email) {
    echo json_encode(['available' => false]);
    exit;
}

$stmt = $mysqli->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();

echo json_encode(['available' => $stmt->get_result()->num_rows === 0]);
