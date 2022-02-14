require('dotenv').config();
let express = require('express');
let app = express();
let mysql = require('mysql');
const bluebird = require('bluebird');
let bodyParser = require('body-parser');


const connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});

const pool = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME,
  connectionLimit : 10,
});

/*
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('static'));


/* Backend */

app.post('/login', async function (request, response) { 
	let username = request.body.username;
	let password = request.body.password;

	if(username && password) {
		connection.query("SELECT UserId, Username, AccountType FROM Users WHERE Username=? and Password=SHA2(CONCAT(?, Salt), 256)", 
			[username, password],
			async function(error, results, fields) {
				if (error) throw error;
				if (results.length > 0) {
					let json = {};
					json.Result = 'Success';
					json.UserData = results[0];
					json.UserData.SessionToken = await getSessionToken(results[0]['UserId']);
					response.json(json);
				} else {
					response.send('Incorrect Username and/or Password!');
				}
				response.end();
			});
	} else {
		response.send('Please enter Username and Password!');
        response.end();
	}
	
});

app.post('/checkSession', async function (request, response) {
	let UserId = request.body.UserId;
	let SessionToken = request.body.SessionToken;
	if(UserId && SessionToken) {
		let checkResult = await checkSessionToken(UserId, SessionToken);
		if(checkResult.Result == "Success") {
			response.json(checkResult);
			response.end();
		} else {
			response.send("Error");
			response.end();
		}
	} else {
		response.send('Please enter Username and Password!');
        response.end();
	}

})




app.listen(8081, function () {
	console.log('Node server listening on port 8081!');
});



/* Database functions */

async function getSessionToken(UserId) {
	replaceTokenPromise = () => {
		return new Promise((resolve, reject)=>{
			pool.query("REPLACE INTO SessionToken (UserId, Token, InvalidAfter) SELECT ?, SHA2(RAND(), 256), DATE_ADD(NOW(), INTERVAL 15 MINUTE)", [UserId],
				(error, elements) => {
					if(error) reject(error);
					return resolve(elements);
				});
		});
	}
	await replaceTokenPromise;
	
	/*
	connection.query("REPLACE INTO SessionToken (UserId, Token, InvalidAfter) SELECT ?, SHA2(RAND(), 256), DATE_ADD(NOW(), INTERVAL 15 MINUTE)", [UserId], 
		function(error, result, fields) {
			if (error) throw error;
		});
	*/

	return new Promise((resolve, reject)=>{
		pool.query("SELECT Token, InvalidAfter FROM SessionToken WHERE UserId=? and InvalidAfter > NOW()", [UserId], 
			async (error, elements) => {
				if(error) {
					return reject(error);
				}
				return resolve(elements[0]);
			});
		});
}

async function checkSessionToken(UserId, SessionToken) {
	return new Promise((resolve, reject)=>{
		pool.query("SELECT UserId, Token, InvalidAfter FROM SessionToken WHERE UserId=? and Token=? and InvalidAfter > NOW()", [UserId, SessionToken],
			async (error, elements) => {
				if(error) return reject(error);
				if(elements.length == 0) return resolve({"Result":"Error"});
				await refreshSessionToken(UserId);
				return resolve({"Result":"Success", SessionToken:elements[0]});
			});
	});
}

async function refreshSessionToken(UserId) {
	return new Promise((resolve, reject)=>{
		pool.query("UPDATE SessionToken SET InvalidAfter=DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE UserId=?", [UserId],
			async (error, elements) => {
				if(error) return reject(error);
				return resolve("Success");
			});
	});
}
