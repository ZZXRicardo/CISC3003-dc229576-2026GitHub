<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

$name = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$subject = trim(filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$message = trim(filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');

$errors = [];

if ($name === '') {
    $errors[] = 'name';
}

if (!$email) {
    $errors[] = 'email';
}

if ($subject === '') {
    $errors[] = 'subject';
}

if ($message === '') {
    $errors[] = 'message';
}

if ($errors !== []) {
    header('Location: ../index.php?status=invalid');
    exit;
}

$autoload = __DIR__ . '/../vendor/autoload.php';

if (!file_exists($autoload)) {
    header('Location: ../index.php?status=missing-phpmailer');
    exit;
}

require $autoload;

$config = require __DIR__ . '/mail_config.php';
$mail = new PHPMailer(true);

try {
    $mail->SMTPDebug = SMTP::DEBUG_OFF;
    $mail->isSMTP();
    $mail->Host = $config['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['username'];
    $mail->Password = $config['password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['port'];

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($config['to_email'], $config['to_name']);
    $mail->addReplyTo((string) $email, $name);

    $mail->isHTML(false);
    $sentAt = date('Y-m-d H:i:s');
    $mail->Subject = '[CISC3003 Scenario B Contact] ' . $subject . ' - ' . $sentAt;
    $mail->Body = "Scenario B PHPMailer contact form\nSent at: {$sentAt}\nName: {$name}\nEmail: {$email}\n\nMessage:\n{$message}";

    $mail->send();
    header('Location: ../index.php?status=sent');
    exit;
} catch (Exception $exception) {
    $debugMessage = urlencode($mail->ErrorInfo ?: $exception->getMessage());
    header('Location: ../index.php?status=error&debug=' . $debugMessage);
    exit;
}
