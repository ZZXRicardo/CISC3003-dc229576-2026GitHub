<?php
declare(strict_types=1);

$status = $_GET['status'] ?? '';
$debug = $_GET['debug'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CISC3003 Final Exam Paper 02B</title>
    <link rel="stylesheet" href="css/styles.css">
    <script defer src="js/script.js"></script>
</head>
<body>
    <header>
        <h1>Scenario B: Contact Form with PHPMailer</h1>
        <p>This page demonstrates HTML validation, PHPMailer SMTP sending, debugging output, and Post/Redirect/Get.</p>
    </header>

    <main>
        <?php if ($status === 'sent'): ?>
            <section class="panel notice">
                <h2>Email sent</h2>
                <p>The contact message was sent by PHPMailer.</p>
            </section>
        <?php elseif ($status === 'missing-phpmailer'): ?>
            <section class="panel warning">
                <h2>PHPMailer is not installed</h2>
                <p>Run <code>composer install</code> inside this project folder, then submit the form again.</p>
            </section>
        <?php elseif ($status === 'invalid'): ?>
            <section class="panel warning">
                <h2>Invalid form data</h2>
                <p>Please complete every field with a valid email address.</p>
            </section>
        <?php elseif ($status === 'error'): ?>
            <section class="panel warning">
                <h2>Email sending error</h2>
                <p><?= htmlspecialchars($debug) ?></p>
            </section>
        <?php endif; ?>

        <section class="panel">
            <h2>Contact Us</h2>
            <form id="contact-form" action="php/send_contact.php" method="post">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required maxlength="100">

                <label for="email">Email</label>
                <input type="email" id="email" name="email" required maxlength="150">

                <label for="subject">Subject</label>
                <input type="text" id="subject" name="subject" required maxlength="160">

                <label for="message">Message</label>
                <textarea id="message" name="message" required></textarea>

                <button type="submit">Send message</button>
            </form>
        </section>
    </main>

    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
