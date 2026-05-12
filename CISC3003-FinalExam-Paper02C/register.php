<?php
declare(strict_types=1);

require __DIR__ . '/php/helpers.php';

$errors = [];
$activationLink = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require __DIR__ . '/php/connect.php';
    require __DIR__ . '/php/mailer.php';

    $name = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    $passwordConfirm = $_POST['password_confirm'] ?? '';

    if ($name === '') {
        $errors[] = 'Name is required.';
    }

    if (!$email) {
        $errors[] = 'Valid email is required.';
    }

    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }

    if ($password !== $passwordConfirm) {
        $errors[] = 'Passwords do not match.';
    }

    if ($errors === []) {
        $check = $mysqli->prepare('SELECT id FROM users WHERE email = ?');
        $check->bind_param('s', $email);
        $check->execute();

        if ($check->get_result()->num_rows > 0) {
            $errors[] = 'This email is already registered.';
        } else {
            $token = bin2hex(random_bytes(32));
            $tokenHash = hash('sha256', $token);
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $mysqli->prepare(
                'INSERT INTO users (name, email, password_hash, activation_token_hash)
                 VALUES (?, ?, ?, ?)'
            );
            $stmt->bind_param('ssss', $name, $email, $passwordHash, $tokenHash);

            if ($stmt->execute()) {
                $activationLink = app_url('activate.php?token=' . $token);
                send_app_email(
                    (string) $email,
                    $name,
                    'Activate your CISC3003 account',
                    "Please activate your account:\n\n{$activationLink}"
                );
            } else {
                $errors[] = 'Registration failed: ' . $stmt->error;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="css/styles.css">
    <script defer src="js/script.js"></script>
</head>
<body>
    <header>
        <h1>Create Account</h1>
        <nav><a href="index.php">Home</a><a href="login.php">Login</a></nav>
    </header>
    <main>
        <?php if ($activationLink !== ''): ?>
            <section class="panel message">
                <h2>Registration saved</h2>
                <p>Please check email for activation. For local testing, open this activation link:</p>
                <p><a href="<?= e($activationLink) ?>"><?= e($activationLink) ?></a></p>
            </section>
        <?php endif; ?>

        <?php if ($errors): ?>
            <section class="panel error">
                <h2>Registration errors</h2>
                <ul><?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?></ul>
            </section>
        <?php endif; ?>

        <section class="panel">
            <form id="signup-form" method="post" action="register.php">
                <label for="name">Full name</label>
                <input type="text" id="name" name="name" required maxlength="100">

                <label for="email">Email</label>
                <input type="email" id="email" name="email" required maxlength="150">
                <p id="email-hint" class="small">Ajax email availability check runs after leaving this field.</p>

                <label for="password">Password</label>
                <input type="password" id="password" name="password" required minlength="8">

                <label for="password_confirm">Confirm password</label>
                <input type="password" id="password_confirm" name="password_confirm" required minlength="8">

                <button type="submit">Sign up</button>
            </form>
        </section>
    </main>
    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
