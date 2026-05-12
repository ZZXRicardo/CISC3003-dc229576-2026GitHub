<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

function send_app_email(string $toEmail, string $toName, string $subject, string $body): bool
{
    $autoload = __DIR__ . '/../vendor/autoload.php';

    if (!file_exists($autoload)) {
        return false;
    }

    require_once $autoload;
    $config = require __DIR__ . '/mail_config.php';

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['username'];
    $mail->Password = $config['password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config['port'];

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($toEmail, $toName);
    $mail->isHTML(false);
    $mail->Subject = $subject;
    $mail->Body = $body;

    return $mail->send();
}
?>
