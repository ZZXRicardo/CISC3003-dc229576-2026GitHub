CREATE DATABASE IF NOT EXISTS cisc3003_paper02a
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cisc3003_paper02a;

CREATE TABLE IF NOT EXISTS feedback_entries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  student_id VARCHAR(30) NOT NULL,
  programme VARCHAR(80) NOT NULL,
  study_year VARCHAR(20) NOT NULL,
  interests VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO feedback_entries
  (full_name, email, student_id, programme, study_year, interests, message)
VALUES
  ('Demo Student', 'demo@example.com', 'dc229576', 'Web Programming', 'Year 2', 'PHP,MySQL', 'This INSERT INTO statement demonstrates A.10.');
