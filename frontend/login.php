<?php
session_start();
function sendCurl($url,$payload)
{
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_POST,1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch,CURLOPT_POSTFIELDS,$payload);
$my_item = curl_exec($ch);

curl_close($ch);

return $my_item;
}
if(!empty($_POST['Uname']) && !empty( $_POST['Passwd'])){
    $message = http_build_query(array('Username' =>$_POST['Uname'],'Password' => $_POST['Passwd']));
    $myurl = "https://afsaccess4.njit.edu/~pf75/middle_end.php";
    $myrequest = sendCurl($myurl,$message);
    $decoded_myrequest = json_decode($myrequest);
    $atype = $decoded_myrequest->UserData->AccountType;
    if($atype == "S"){
        $_SESSION["student"] = $decoded_myrequest->UserData->Username;
        header("location:https://afsaccess4.njit.edu/~dk544/student.php");
        exit();
    }
    if($atype == "T"){
        $_SESSION["teacher"] = $decoded_myrequest->UserData->Username;
        header("location:https://afsaccess4.njit.edu/~dk544/teacher.php");
        exit();
    }
    header("Refresh: 2; url=https://afsaccess4.njit.edu/~dk544/index.html");
    echo "<font size = '18' face='Arial'>";
    echo "Incorrect Username or Password";
    exit();
}
header("location:https://afsaccess4.njit.edu/~dk544/index.html");
exit();
?>
