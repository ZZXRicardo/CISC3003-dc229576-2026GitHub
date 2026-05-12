<?php
declare(strict_types=1);

require __DIR__ . '/php/helpers.php';
require __DIR__ . '/php/connect.php';

$token = $_GET['token'] ?? '';
$message = 'Invalid activation token.';

if ($token !== '') {
    $tokenHash = hash('sha256', $token);
    $stmt = $mysqli->prepare('UPDATE users SET activation_token_hash = NULL, activated_at = NOW() WHERE activation_token_hash = ?');
    $stmt->bind_param('s', $tokenHash);
    $stmt->execute();

    if ($stmt->affected_rows === 1) {
        $message = 'Your email has been confirmed. You may login now.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate Account</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header><h1>Email Activation</h1><nav><a href="login.php">Login</a></nav></header>
    <main><section class="panel message"><p><?= e($message) ?></p></section></main>
    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
