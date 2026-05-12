<?php
declare(strict_types=1);

require __DIR__ . '/php/helpers.php';

$resetLink = '';
$notice = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require __DIR__ . '/php/connect.php';
    require __DIR__ . '/php/mailer.php';

    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $notice = 'If the email exists, a password reset message has been prepared.';

    if ($email) {
        $token = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $token);
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $stmt = $mysqli->prepare('UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE email = ?');
        $stmt->bind_param('sss', $tokenHash, $expires, $email);
        $stmt->execute();

        if ($stmt->affected_rows === 1) {
            $resetLink = app_url('reset_password.php?token=' . $token);
            send_app_email(
                (string) $email,
                'CISC3003 User',
                'Reset your CISC3003 password',
                "Use this secure link within one hour:\n\n{$resetLink}"
            );
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header><h1>Request Password Reset</h1><nav><a href="login.php">Login</a></nav></header>
    <main>
        <?php if ($notice): ?>
            <section class="panel message">
                <p><?= e($notice) ?></p>
                <?php if ($resetLink): ?><p>Local testing link: <a href="<?= e($resetLink) ?>"><?= e($resetLink) ?></a></p><?php endif; ?>
            </section>
        <?php endif; ?>
        <section class="panel">
            <form method="post" action="reset_request.php">
                <label for="email">Registered email</label>
                <input type="email" id="email" name="email" required>
                <button type="submit">Send reset email</button>
            </form>
        </section>
    </main>
    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
