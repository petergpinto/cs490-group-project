
module.exports = function (app, pool, util) {

app.get('/createNewExam', async function (request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
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
    if(!(await util.isUserLoggedIn(request.session, pool))) {
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


}
