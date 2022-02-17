module.exports = function (app,pool,util) {

app.post('/insertQuestion', async function (request, response) {
	//Must be logged in as teacher
	//Must have valid SessionToken in express session
	//Must have following fields: QuestionText, FunctionName

	if(!(await util.isUserLoggedIn(request.session, pool))) {
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

app.post('/addQuestionToExam', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session))) {
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
    if(!(await util.isUserLoggedIn(request.session))) {
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
	if(!(await util.isUserLoggedIn(request.session, pool))) {
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
  
app.get('/getAllQuestions', async function(request, response) {
	//Get all questions in the database in JSON format
	if(!(await util.isUserLoggedIn(request.session))) {
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
  
}