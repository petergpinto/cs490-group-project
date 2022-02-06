<?php
header('Content-type: application/json');
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
if(!empty($_POST['Username']) && !empty( $_POST['Password'])){
    $message = http_build_query(array('Username' =>$_POST['Username'],'Password' => $_POST['Password']));
    $myurl = "https://afsaccess4.njit.edu/~pp776/login.php";
    $myrequest = sendCurl($myurl,$message);
    echo $myrequest;
    exit();
}
else
{
    echo json_encode(array("result"=>"Error","num_rows"=>0));
    exit();
}
?>
