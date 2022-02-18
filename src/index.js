require('dotenv').config();
let express = require('express');
let session = require('express-session');
let app = express();
let cors = require('cors');
let mysql = require('mysql');
const bluebird = require('bluebird');
let bodyParser = require('body-parser');

const pool = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME,
  connectionLimit : 10,
});

const fifteenMinutes = 1000 * 60 * 15;
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: fifteenMinutes, sameSite: 'strict' }
}));
app.use(cors({ origin:"https://cs490.peterpinto.dev", credentials:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('static'));


/* Endpoints *

POST /login [username, password]
POST /checkSession [UserId, SessionToken]
POST /insertQuestion [QuestionText, FunctionName]
POST /insertTestCase [QuestionId, TestCaseInput, TestCaseOutput, TestCaseInputType, TestCaseOutputType]
POST /releaseExamScore [ExamId]
POST /addQuestionToExam [QuestionId, ExamId]
POST /removeQuestionFromExam [QuestionId, ExamId]
POST /getAllQuestionsOnExam [ExamId]
POST /insertScore [ExamId, QuestionId, AutoGraderScore]
POST /getScores [UserId, ExamId]
POST /overrideScore [UserId, ExamId, QuestionId, InstructorOverrideScore, InstructorComment]
POST /getQuestionTestCases [QuestionId]

GET /logout
GET /createNewExam
GET /getAllExams
GET /getAllQuestions

*/

let util = require(__dirname + '/Utility.js');
require(__dirname + '/TestCases.js')(app, pool, util);
require(__dirname + '/Questions.js')(app, pool, util);
require(__dirname + '/Scores.js')(app, pool, util);
require(__dirname + '/Exam.js')(app, pool, util);

/* Backend */

app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

app.post('/login', async function (request, response) { 
	let username = request.body.username;
	let password = request.body.password;

	if(username && password) {

		checkLoginPromise = () => {
			return new Promise((resolve, reject)=> {
				pool.query('SELECT UserId, Username, AccountType FROM Users WHERE Username=? and Password=SHA2(CONCAT(?, Salt), 256)', [username, password],
					async (error, elements)=> {
						if(error) return reject(error);
						let json = {};
						if(elements.length > 0) {
							json.Result = 'Success';
        		            json.UserData = elements[0];
		                    json.UserData.SessionToken = await util.getSessionToken(elements[0]['UserId'], pool);
						} else {
							json.Result = 'Error';
						}
						return resolve(json);
					});
			});
		}
		let loginResult = await checkLoginPromise();
		if(loginResult.Result == "Success") {
			request.session.loggedin = true;
			request.session.UserData = loginResult.UserData;
		}
		response.json(loginResult);
		response.end();
	} else {
		response.send('Please enter Username and Password!');
        response.end();
	}
	
});

app.get('/logout', async function (request, response) {
	request.session.destroy();
	response.send('Logged out');
	response.end();
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

});

app.listen(8081, function () {
	console.log('Node server listening on port 8081!');
});
