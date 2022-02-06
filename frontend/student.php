<?php
session_start();
if(!isset($_SESSION["student"])){
        header("location:https://afsaccess4.njit.edu/~dk544/index.html");
        exit();
}
echo "<font size = '18' face='Arial'>";
echo "Student Landing Page<br/>";
echo "Welcome ";
echo $_SESSION["student"];
session_destroy();
?>
