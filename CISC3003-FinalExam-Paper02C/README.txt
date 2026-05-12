CISC3003 Final Exam Paper 02C

What is completed:
- register.php creates accounts and saves password_hash values in MySQL.
- login.php and logout.php provide session login/logout.
- dashboard.php is protected and shows account services after login.
- js/script.js performs browser password validation and Ajax email availability checking.
- activate.php confirms email addresses before login.
- reset_request.php and reset_password.php implement token-based password reset.
- composer.json declares the PHPMailer dependency.

Before testing:
1. Copy this folder into XAMPP htdocs if it is not already there.
2. Import database.sql in phpMyAdmin.
3. The connection is configured for 127.0.0.1:3306, root, password 751222.
4. Run composer install in this folder.
5. Edit php/mail_config.php with your Gmail SMTP address and app password.
6. Open http://localhost/CISC3003-FinalExam-Paper02C/index.php.
7. Capture screenshots for C.01 through C.09 and save them in My Screen Shots.

Note:
The registration and reset pages show local testing links after form submission so that you can test activation and password reset even before SMTP is fully configured.
