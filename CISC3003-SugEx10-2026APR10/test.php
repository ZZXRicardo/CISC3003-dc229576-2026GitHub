<?php
echo "PHP is working!";
echo "<br>";
echo "Current directory: " . __DIR__;
echo "<br>";
echo "File exists test: ";
echo file_exists('includes/book-utilities.inc.php') ? 'YES' : 'NO';
echo "<br>";
echo "GET parameters: ";
print_r($_GET);
?>