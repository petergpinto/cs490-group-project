<?php
        header('Content-Type:application/json');

	include 'dbInfo.php';

        $conn = new mysqli($servername, $username, $password, $dbname);

        if($conn->connect_errno){
                die("Connection failed:" . $conn->connect_error);
        }


        $stmt = $conn->prepare("SELECT UserId, Token, InvalidAfter FROM SessionToken WHERE UserId=? and Token=? and InvalidAfter > NOW()");
	$stmt->bind_param("is", $_POST["UserId"], $_POST["SessionToken"]);
        $stmt->execute();
	$stmt->store_result();
	$stmt->bind_result($UserId, $SessionToken, $InvalidAfter);
	
	$data = new StdClass;

	if($stmt->num_rows != 1) {
		//Session token invalid
		$data->Result = "Error";
	} else {
		$stmt->fetch();
		//Session token valid
		$data->Result = "Success";
		$data->UserData = new StdClass;
		$stmt = $conn->prepare("SELECT Username, AccountType FROM Users WHERE UserId=?");
		$stmt->bind_param("i", $UserId);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($Username, $AccountType);
		$stmt->fetch();

		$data->UserData->UserId = $UserId;
		$data->UserData->Username = $Username;
		$data->UserData->AccountType = $AccountType;

		$data->UserData->SessionToken = new StdClass;
		$data->UserData->SessionToken->Token = $SessionToken;
		$data->UserData->SessionToken->InvalidAfter = $InvalidAfter;

		//Set the InvalidAfter field to now+15 minutes each time the token is checked.  
		$stmt = $conn->prepare("UPDATE SessionToken SET InvalidAfter=DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE UserId=?");
		$stmt->bind_param("i", $UserId);
		$stmt->execute();
	}

	$stmt->close();
	$json = json_encode($data);
	echo $json;

?>
