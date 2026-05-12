<?php
declare(strict_types=1);

$errors = [];
$saved = false;

function clean_text(string $value): string
{
    return trim(filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS));
}

function looks_like_sql_injection(string $value): bool
{
    return (bool) preg_match("/('|\")\s*(or|and)\s*('|\")?\d*('|\")?\s*=\s*('|\")?\d*|--|;|\/\*|\b(drop|insert|delete|update|union|select)\b/i", $value);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = clean_text($_POST['full_name'] ?? '');
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $studentId = clean_text($_POST['student_id'] ?? '');
    $programme = clean_text($_POST['programme'] ?? '');
    $studyYear = clean_text($_POST['study_year'] ?? '');
    $message = clean_text($_POST['message'] ?? '');
    $interests = array_map('clean_text', $_POST['interests'] ?? []);
    $consent = isset($_POST['consent']);

    if ($fullName === '') {
        $errors[] = 'Full name is required.';
    }

    if (looks_like_sql_injection($fullName) || looks_like_sql_injection($message)) {
        $errors[] = 'Possible SQL injection input detected. The form was not saved.';
    }

    if (!$email) {
        $errors[] = 'A valid email address is required.';
    }

    if ($studentId === '') {
        $errors[] = 'Student ID is required.';
    }

    if ($programme === '') {
        $errors[] = 'Please select a programme.';
    }

    if (!in_array($studyYear, ['Year 1', 'Year 2', 'Year 3', 'Year 4'], true)) {
        $errors[] = 'Please select a valid study year.';
    }

    if ($message === '') {
        $errors[] = 'Please enter a message.';
    }

    if (!$consent) {
        $errors[] = 'Please agree before submitting.';
    }

    if ($errors === []) {
        require __DIR__ . '/php/connect.php';

        $interestList = implode(',', $interests);
        $stmt = $mysqli->prepare(
            'INSERT INTO feedback_entries (full_name, email, student_id, programme, study_year, interests, message)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        if (!$stmt) {
            $errors[] = 'Prepared statement failed: ' . $mysqli->error;
        } else {
            $stmt->bind_param('sssssss', $fullName, $email, $studentId, $programme, $studyYear, $interestList, $message);
            $saved = $stmt->execute();

            if (!$saved) {
                $errors[] = 'Insert failed: ' . $stmt->error;
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
    <title>CISC3003 Final Exam Paper 02A</title>
    <link rel="stylesheet" href="css/styles.css">
    <script defer src="js/script.js"></script>
</head>
<body>
    <header>
        <h1>Scenario A: HTML Form and MySQL Insert</h1>
        <p>This page demonstrates A.01 to A.10 with server-side validation, filter functions, and a prepared statement.</p>
    </header>

    <main>
        <?php if ($saved): ?>
            <section class="panel success">
                <h2>Record saved</h2>
                <p>The submitted form data was inserted into MySQL using a prepared statement.</p>
            </section>
        <?php endif; ?>

        <?php if ($errors): ?>
            <section class="panel error">
                <h2>Please fix these errors</h2>
                <ul>
                    <?php foreach ($errors as $error): ?>
                        <li><?= htmlspecialchars($error) ?></li>
                    <?php endforeach; ?>
                </ul>
            </section>
        <?php endif; ?>

        <section class="panel">
            <h2>Course Feedback Form</h2>
            <form action="index.php" method="post" novalidate>
                <label for="full_name">Full name</label>
                <input type="text" id="full_name" name="full_name" required maxlength="100">

                <label for="email">Email address</label>
                <input type="email" id="email" name="email" required maxlength="150">

                <label for="student_id">Student ID</label>
                <input type="text" id="student_id" name="student_id" required maxlength="30" value="dc229576">

                <label for="programme">Programme</label>
                <select id="programme" name="programme" required>
                    <option value="">Select one programme</option>
                    <option value="Web Programming">Web Programming</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Systems">Information Systems</option>
                </select>

                <fieldset>
                    <legend>Study year</legend>
                    <label class="choice"><input type="radio" name="study_year" value="Year 1" required> Year 1</label>
                    <label class="choice"><input type="radio" name="study_year" value="Year 2"> Year 2</label>
                    <label class="choice"><input type="radio" name="study_year" value="Year 3"> Year 3</label>
                    <label class="choice"><input type="radio" name="study_year" value="Year 4"> Year 4</label>
                </fieldset>

                <fieldset>
                    <legend>Topics practised</legend>
                    <label class="choice"><input type="checkbox" name="interests[]" value="HTML"> HTML form</label>
                    <label class="choice"><input type="checkbox" name="interests[]" value="PHP"> PHP processing</label>
                    <label class="choice"><input type="checkbox" name="interests[]" value="MySQL"> MySQL database</label>
                </fieldset>

                <label for="message">Message</label>
                <textarea id="message" name="message" required placeholder="Write a multi-line message here."></textarea>

                <label class="choice"><input type="checkbox" name="consent" value="1" required> I confirm the submitted information is correct.</label>

                <button type="submit">Submit feedback</button>
            </form>
        </section>
    </main>

    <footer>CISC3003 Web Programming: zhangzhexuan + dc229576 + 2026</footer>
</body>
</html>
