<?php
declare(strict_types=1);

require __DIR__ . '/php/helpers.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>
    <header>
        <h1>Welcome, <?= e($_SESSION['user_name'] ?? 'User') ?></h1>
        <p>You became a user on <?= e((string) ($_SESSION['created_at'] ?? 'today')) ?>.</p>
        <nav><a href="logout.php">Logout</a></nav>
    </header>
    <main class="grid">
        <section class="service"><h2>Profile</h2><p>View and control your account information.</p></section>
        <section class="service"><h2>Security</h2><p>Use email confirmation and password reset services.</p></section>
        <section class="service"><h2>Course Tools</h2><p>Access protected services after successful login.</p></section>
    </main>
    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
