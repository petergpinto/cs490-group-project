<?php
	header('Content-Type:application/json');
	
	include 'dbInfo.php';

	$conn = new mysqli($servername, $username, $password, $dbname);

        if($conn->connect_errno){
                die("Connection failed:" . $conn->connect_error);
        }


        $stmt = $conn->prepare("SELECT UserId, Username, AccountType FROM Users WHERE Username=? and Password=SHA2(CONCAT(?, Salt), 256)");
        $stmt->bind_param("ss", $_POST["Username"], $_POST["Password"]);

	$stmt->execute();

	$stmt->store_result();
	$stmt->bind_result($UserId, $Username, $AccountType);
        
	$data = new StdClass;

        if($stmt->num_rows != 1) {
                $data->result = "Error";
		$data->num_rows = $stmt->num_rows;
        } else {
                $data->Result = "Success";
		$stmt->fetch();
		$data->UserData = new StdClass;
		$data->UserData->UserId = $UserId;
		$data->UserData->Username = $Username;
		$data->UserData->AccountType = $AccountType;

		//Check for a session token, if none is found or the token is expired, create a new token
		$stmt = $conn->prepare("SELECT Token, InvalidAfter FROM SessionToken WHERE UserId=? and InvalidAfter > NOW()");
		$stmt->bind_param("i", $UserId);
		$stmt->execute();
		$stmt->store_result();
		$stmt->bind_result($Token, $InvalidAfter);

		if($stmt->num_rows != 1) {
			//Create session token
			$stmt = $conn->prepare("REPLACE INTO SessionToken (UserId, Token, InvalidAfter) SELECT ?, SHA2(RAND(), 256), DATE_ADD(NOW(), INTERVAL 15 MINUTE)");
			$stmt->bind_param("i", $UserId);
			$stmt->execute();
			
			//Get and send token
			$stmt = $conn->prepare("SELECT Token, InvalidAfter FROM SessionToken WHERE UserId=? and InvalidAfter > NOW()");
	                $stmt->bind_param("i", $UserId);
	                $stmt->execute();
			$stmt->store_result();
			$stmt->bind_result($Token, $InvalidAfter);

			$stmt->fetch();
			$data->UserData->SessionToken = new StdClass;
			$data->UserData->SessionToken->Token = $Token;
			$data->UserData->SessionToken->InvalidAfter = $InvalidAfter;
		} else {
			//Send session token
			$stmt->fetch();
			$data->UserData->SessionToken = new StdClass;
			$data->UserData->SessionToken->Token = $Token;
			$data->UserData->SessionToken->InvalidAfter = $InvalidAfter;

		}

        }
	$stmt->close();

        $json = json_encode($data);
        echo $json;
	
?>
