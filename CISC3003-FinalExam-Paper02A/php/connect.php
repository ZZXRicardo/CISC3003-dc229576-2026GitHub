<?php
declare(strict_types=1);

$host = '127.0.0.1';
$database = 'cisc3003_paper02a';
$username = 'root';
$password = '751222';

$mysqli = new mysqli($host, $username, $password, $database, 3306);

if ($mysqli->connect_errno) {
    die('Database connection failed: ' . htmlspecialchars($mysqli->connect_error));
}

$mysqli->set_charset('utf8mb4');
?>
