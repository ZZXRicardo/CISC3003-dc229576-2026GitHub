<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/php/helpers.php';

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require __DIR__ . '/php/connect.php';

    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';

    if (!$email || $password === '') {
        $errors[] = 'Email and password are required.';
    } else {
        $stmt = $mysqli->prepare('SELECT id, name, password_hash, activated_at, created_at FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $errors[] = 'Invalid login details.';
        } elseif ($user['activated_at'] === null) {
            $errors[] = 'Please confirm your email address before login.';
        } else {
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['created_at'] = $user['created_at'];
            header('Location: dashboard.php');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <h1>Login</h1>
        <nav><a href="index.php">Home</a><a href="register.php">Register</a><a href="reset_request.php">Reset password</a></nav>
    </header>
    <main>
        <?php if ($errors): ?>
            <section class="panel error"><ul><?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?></ul></section>
        <?php endif; ?>
        <section class="panel">
            <form method="post" action="login.php">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Login</button>
            </form>
        </section>
    </main>
    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
