const process = require('child_process');
const fs = require('fs');

module.exports = function (app, pool, util) {

app.post('/updatePointValue', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
        response.end();
        return;
    }

	let PointValue = request.body.PointValue;
	let ExamId = request.body.ExamId;
	let QuestionId = request.body.QuestionId;

	if(!PointValue || !ExamId || !QuestionId) {
		response.json({'Result':'Invalid Request'});
        response.end();
        return;
	}

	updateScoresPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE ExamQuestions SET PointValue=? WHERE ExamId=? AND QuestionId=?', [PointValue, ExamId, QuestionId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	if(await updateScoresPromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }

})

app.post('/getPointValues', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;

    if(!ExamId) {
        response.json({'Result':'Invalid Request'});
        response.end();
        return;
    }


	    getPointValuesPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT QuestionId, PointValue FROM ExamQuestions WHERE ExamId=?', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	response.json(await getPointValuesPromise());
	response.end();

})

app.post('/triggerAutoGrader', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;

    if(!ExamId) {
        response.json({'Result':'Invalid Request'});
        response.end();
        return;
    }

	autoGraderDataPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM StudentAnswers LEFT JOIN TestCases ON StudentAnswers.QuestionId=TestCases.QuestionId LEFT JOIN Questions on Questions.QuestionId=StudentAnswers.QuestionId WHERE ExamId=?', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	let autoGraderData = await autoGraderDataPromise();
	let data = JSON.stringify(autoGraderData);

	console.log(autoGraderData);

	fs.writeFile('data.json', data, (err) => {
    if (err) {
        throw err;
    }
    	console.log("JSON data is saved.");
	});

	process.exec('python3 grader.py data.json');

	/*
	const ls = process.exec('ls -l', function (error, stdout, stderr) {
  	if (error) {
    	console.log(error.stack);
    	console.log('Error code: ' + error.code);
    	console.log('Signal received: ' + error.signal);
  	}
  		console.log('Child Process STDOUT: ' + stdout);
  		console.log('Child Process STDERR: ' + stderr);
	});

	ls.on('exit', function (code) {
 	 	console.log('Child process exited with exit code ' + code);
	});
	*/

	response.end();

});

app.post('/createNewExam', async function (request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
        response.end();
        return;
    }

	let ExamFriendlyName = request.body.ExamFriendlyName;

	if(!ExamFriendlyName) {
		response.json({'Result':'Invalid Request'});
		response.end();
		return;
	}

    createExamPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('CALL create_exam(?)', [ExamFriendlyName],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements[0][0]);
                });
        });
    }

    response.json(await createExamPromise());
    response.end();
});

app.post('/submitExam', async function (request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
	let UserId = request.session.UserData.UserId;

	if(!ExamId) {
		response.json({'Result':'Invalid Request'});
        response.end();
        return;
	}

	submitExamPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('INSERT INTO StudentSubmittedExam (UserId, ExamId) VALUES (?, ?)', [UserId, ExamId],
			(error, elements) => {
            	if(error) return reject(error);
                    return resolve(elements);
                });
		});
	}
	
	if(await submitExamPromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }



});

app.post('/releaseExamScore', async function (request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
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

app.post('/getExamQuestions', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;

	getExamQuestionsPromise = () => {
        return new Promise((resolve, reject) => {
			pool.query("SELECT Questions.QuestionId, T.PointValue, Questions.QuestionText FROM Questions INNER JOIN (SELECT * FROM ExamQuestions WHERE ExamId=?) AS T ON Questions.QuestionId=T.QuestionId", [ExamId],
				(error, elements) => {
					if(error) return reject(error);
					return resolve(elements)
				});
		});
	}
	
	response.json(await getExamQuestionsPromise());
	response.end();

})

app.post('/updateStudentResponse', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({'Result':'Please login'});
        response.end();
        return;
    }

	let UserId = request.session.UserData.UserId;
	let ExamId = request.body.ExamId;
	let QuestionId = request.body.QuestionId;
	let StudentResponse = request.body.StudentResponse;
	if(!ExamId || !QuestionId || !StudentResponse) {
		response.json({'Result':'Invalid Request'});
		response.end();
		return;
	}
	
	updateResponsePromise = () => {
        return new Promise((resolve, reject) => {
            pool.query("REPLACE INTO StudentAnswers (UserId, QuestionId, ExamId, StudentResponse) VALUES (?, ?, ?, ?)", [UserId, QuestionId, ExamId, StudentResponse],
				(error, elements) => {
					if(error) return reject(error);
					return resolve(elements);
				});
		});
	}

	if(await updateResponsePromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }

})

app.get('/getAllExams', async function(request, response) {
    //Get all the exams currently in the database
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

	let UserId = request.session.UserData.UserId;


    getAllExamsPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT ExamFriendlyName, Exam.ExamId, ExamScoresReleased, IFNULL(Submitted, FALSE) as Submitted FROM Exam LEFT JOIN (SELECT ExamId, Submitted FROM StudentSubmittedExam WHERE UserId=?) AS T ON Exam.ExamId=T.ExamId', [UserId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }
    response.json(await getAllExamsPromise());
    response.end();


})


}
