<?php
declare(strict_types=1);

require __DIR__ . '/php/helpers.php';
require __DIR__ . '/php/connect.php';

$token = $_GET['token'] ?? $_POST['token'] ?? '';
$tokenHash = hash('sha256', $token);
$errors = [];
$success = false;

$stmt = $mysqli->prepare('SELECT id FROM users WHERE reset_token_hash = ? AND reset_token_expires_at > NOW()');
$stmt->bind_param('s', $tokenHash);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    $errors[] = 'The password reset token is invalid or expired.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $user) {
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['password_confirm'] ?? '';

    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }

    if ($password !== $confirm) {
        $errors[] = 'Passwords do not match.';
    }

    if (count($errors) === 0) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $update = $mysqli->prepare(
            'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?'
        );
        $update->bind_param('si', $hash, $user['id']);
        $success = $update->execute();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set New Password</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header><h1>Set New Password</h1><nav><a href="login.php">Login</a></nav></header>
    <main>
        <?php if ($success): ?>
            <section class="panel message"><p>Password changed. You can login with the new password.</p></section>
        <?php elseif ($errors): ?>
            <section class="panel error"><ul><?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?></ul></section>
        <?php endif; ?>

        <?php if (!$success && $user): ?>
            <section class="panel">
                <form method="post" action="reset_password.php">
                    <input type="hidden" name="token" value="<?= e($token) ?>">
                    <label for="password">New password</label>
                    <input type="password" id="password" name="password" required minlength="8">
                    <label for="password_confirm">Confirm new password</label>
                    <input type="password" id="password_confirm" name="password_confirm" required minlength="8">
                    <button type="submit">Change password</button>
                </form>
            </section>
        <?php endif; ?>
    </main>
    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
