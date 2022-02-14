<?php
session_start();
if(!isset($_SESSION["teacher"])){
        header("location:https://afsaccess4.njit.edu/~dk544/index.html");
        exit();
}
echo "<font size = '18' face='Arial'>";
echo "Teacher Landing Page<br/>";
echo "Welcome ";
echo $_SESSION["teacher"];
session_destroy();
?>
