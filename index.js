require('dotenv').config();
let express = require('express');
let session = require('express-session');
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

const fiveMinutes = 1000 * 60 * 5;
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: fiveMinutes, sameSite: 'strict' }
}));
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

//let util = require(__dirname + '/Utility.js')(app, pool);
//require(__dirname + '/TestCases.js')(app, pool, util);
//require(__dirname + '/Questions.js')(app, pool, util);

/* Backend */

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
		                    json.UserData.SessionToken = await getSessionToken(elements[0]['UserId']);
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

})


app.post('/insertQuestion', async function (request, response) {
	//Must be logged in as teacher
	//Must have valid SessionToken in express session
	//Must have following fields: QuestionText, FunctionName

	if(!(await isUserLoggedIn(request.session))) {
		response.send('Please login');
        response.end();
		return;
	} 

	let QuestionText = request.body.QuestionText;
	let FunctionName = request.body.FunctionName;
	if(!FunctionName || !QuestionText) {
		response.json({'Result':'Invalid Request'});
        response.end();
	} else {
		insertQuestionPromise = () => {
			return new Promise((resolve, reject) => {
				pool.query('INSERT INTO Questions (QuestionText, FunctionName) VALUES (?, ?)', [QuestionText, FunctionName],
					(error, elements) => {
						if(error) return reject(error);
						return resolve(true);
					});
			});
		}
		if(await insertQuestionPromise()) {
			response.json({'Result':'Success'});
			response.end();
		} else {
			response.json({'Result':'Error'});
			response.end();
		}

	}
});



app.post('/insertTestCase', async function (request, response) {
	if(!(await isUserLoggedIn(request.session))) {
		response.send('Please login');
		response.end();
		return;
	}

	let QuestionId = request.body.QuestionId;
	let TestCaseInput = request.body.TestCaseInput;
	let TestCaseOutput = request.body.TestCaseOutput;
	let TestCaseInputType = request.body.TestCaseInputType; //'S' For strings, 'I' for integers, 'F' for floating point values
	let TestCaseOutputType = request.body.TestCaseOutputType;
	if(!QuestionId || !TestCaseInput || !TestCaseOutput || !TestCaseInputType || !TestCaseOutputType) {
		response.json({'Result':'Invalid Request'});
		response.end()
		return;
	}

	insertTestCasePromise = () => {
		return new Promise((resolve, reject) => {
			pool.query('INSERT INTO TestCases (QuestionId, TestCaseInput, TestCaseOutput, TestCaseInputType, TestCaseOutputType) VALUES (?, ?, ?, ?, ?)', [QuestionId, TestCaseInput, TestCaseOutput, TestCaseInputType, TestCaseOutputType],
				(error, elements) => {
					if(error) return reject(error);
					return resolve(true);
				});
		});
	}

	if(await insertTestCasePromise()) {
		response.json({'Result':'Success'});
        response.end();
	} else {
		response.json({'Result':'Error'});
        response.end();
	}
});


app.get('/createNewExam', async function (request, response) {
	if(!(await isUserLoggedIn(request.session))) {
        response.send('Please login');
        response.end();
        return;
    }

	createExamPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('CALL create_exam()', 
				(error, elements) => {
					if(error) return reject(error);
					return resolve(elements[0][0]);
				});
		});
	}
	response.json(await createExamPromise());
	response.end();
});

app.post('/releaseExamScore', async function (request, response) {
	if(!(await isUserLoggedIn(request.session))) {
        response.send('Please login');
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;

	releaseScoresPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE Exam SET ExamScoresReleased=TRUE WHERE ExamId=?', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(true);
                });
        });
    }

    if(await releaseScoresPromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }


});


app.post('/addQuestionToExam', async function(request, response) {
    if(!(await isUserLoggedIn(request.session))) {
        response.send('Please login');
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
	let QuestionId = request.body.QuestionId;
	if(!ExamId || !QuestionId) {
		response.json({'Result':'Invalid Request'});
		response.end();
		return;
	}
	
	addQuestionToExamPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('INSERT INTO ExamQuestions (ExamId, QuestionId) VALUES (?, ?)', [ExamId, QuestionId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(true);
                });
        });
    }

	if(await addQuestionToExamPromise()) {
		response.json({'Result':'Success'});
        response.end();
	} else {
		response.json({'Result':'Error'});
        response.end();
	}

});



app.post('/removeQuestionFromExam', async function(request, response) {
    if(!(await isUserLoggedIn(request.session))) {
        response.send('Please login');
        response.end();
        return;
    }
	
	let ExamId = request.body.ExamId;
    let QuestionId = request.body.QuestionId;
    if(!ExamId || !QuestionId) {
        response.json({'Result':'Invalid Request'});
        response.end();
        return;
    }

    removeQuestionFromExamPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('DELETE FROM ExamQuestions WHERE ExamId=? and QuestionId=?', [ExamId, QuestionId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(true);
                });
        });
    }

    if(await removeQuestionFromExamPromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }
});



app.post('/getAllQuestionsOnExam', async function(request, response) {
	if(!(await isUserLoggedIn(request.session))) {
        response.send("Please login");
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
	
	getExamQuestionsPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM Questions WHERE QuestionId IN (SELECT QuestionId FROM ExamQuestions WHERE ExamId=?)', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	response.json(await getExamQuestionsPromise());
	response.end();

});


app.post('/insertScore', async function(request, response) {
	if(!(await isUserLoggedIn(request.session))) {
        response.send("Please login");
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
	let QuestionId = request.body.QuestionId;
	let AutoGraderScore = request.body.AutoGraderScore;
	let UserId = request.session.UserData.UserId;

	insertScoresPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('INSERT INTO Scores (ExamId, QuestionId, UserId, AutoGraderScore) VALUES (?, ?, ?, ?)', [ExamId, QuestionId, UserId, AutoGraderScore],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(true);
                });
        });
    }

	if(await insertScoresPromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }


})

app.post('/getScores', async function(request, response) {
	if(!(await isUserLoggedIn(request.session))) {
        response.send("Please login");
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
	let UserId = request.body.UserId;
	//Students can only retrieve their own scores
	if(request.session.UserData.AccountType == 'S') {
		UserId = request.session.UserData.UserId;
	}

	getScoresPromise  = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM Scores WHERE UserId=? AND ExamId=?', [UserId, ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	response.json(await getScoresPromise());
	response.end();

});

app.post('/overrideScore', async function(request, response) {
	if(!(await isUserLoggedIn(request.session))) {
        response.send("Please login");
        response.end();
        return;
    }

	//User must be an instructor
	if(request.session.UserData.AccountType != 'T') {
		response.send({'Result':'Invalid Request'});
		response.end();
		return;
	}

	let ExamId = request.body.ExamId;
	let QuestionId = request.body.QuestionId;
	let UserId = request.body.UserId;
	let InstructorOverrideScore = request.body.InstructorOverrideScore;
	let InstructorComment = request.body.InstructorComment;

	updateScorePromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE Scores SET InstructorOverrideScore=?, InstructorComment=? WHERE UserId=? AND ExamId=? AND QuestionId=?;', [InstructorOverrideScore, InstructorComment, UserId, ExamId, QuestionId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(true);
                });
        });
    }

	if(await updateScorePromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }

});


app.post('/getQuestionTestCases', async function(request, response) {
	if(!(await isUserLoggedIn(request.session))) {
        response.send("Please login");
        response.end();
        return;
    }

	let QuestionId = request.body.QuestionId;
	
	getTestCasesPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM TestCases WHERE QuestionId=?', [QuestionId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	response.json(await getTestCasesPromise());
	response.end();

});



/* Data retrieval endpoints */


app.get('/getAllQuestions', async function(request, response) {
	//Get all questions in the database in JSON format
	if(!(await isUserLoggedIn(request.session))) {
    	response.send("Please login");
		response.end();
		return;
	}

	getAllQuestionsPromise = () => {
		return new Promise((resolve, reject) => {
			pool.query('SELECT * FROM Questions', 
				(error, elements) => {
					if(error) return reject(error);
					return resolve(elements);
				});
		});
	}
	response.json(await getAllQuestionsPromise());
	response.end();
});


app.get('/getAllExams', async function(request, response) {
	//Get all the exams currently in the database
	if(!(await isUserLoggedIn(request.session))) {
        response.send("Please login");
        response.end();
        return;
    }

	getAllExamsPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM Exam',
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }
    response.json(await getAllExamsPromise());
    response.end();


})


app.listen(8081, function () {
	console.log('Node server listening on port 8081!');
});


/* Session Helper functions */

async function isUserLoggedIn(session) {
	if(!session.loggedin) return false;
	let checkToken = await checkSessionToken(session.UserData.UserId, session.UserData.SessionToken.Token);
	if(checkToken.Result != "Success") {
		return false;
	} else {
		return true;
	}
}

function checkUserRole(session, role) {

}


/* Database functions */

async function getSessionToken(UserId) {
	replaceTokenPromise = () => {
		return new Promise((resolve, reject)=>{
			pool.query("REPLACE INTO SessionToken (UserId, Token, InvalidAfter) SELECT ?, SHA2(RAND(), 256), DATE_ADD(NOW(), INTERVAL 15 MINUTE)", [UserId],
				(error, elements) => {
					if(error) return reject(error);
					return resolve(elements);
				});
		});
	}
	await replaceTokenPromise();
	
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
