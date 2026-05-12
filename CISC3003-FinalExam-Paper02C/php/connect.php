<?php
declare(strict_types=1);

$mysqli = new mysqli('127.0.0.1', 'root', '751222', 'cisc3003_paper02c', 3306);

if ($mysqli->connect_errno) {
    die('Database connection failed: ' . htmlspecialchars($mysqli->connect_error));
}

$mysqli->set_charset('utf8mb4');
?>
