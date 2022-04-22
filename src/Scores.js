module.exports = function (app, pool, util) {


app.post('/studentGetFunctionNameScores', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
    if(!ExamId) {
        response.json({'Result':"Invalid Request"});
        response.end();
        return;
    }
	let UserId = request.session.UserData.UserId;

    getFunctionScoresPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT FunctionNameScores.CorrectFunctionName, FunctionNameScores.OverrideScore, FunctionNameScores.ProvidedFunctionName, FunctionNameScores.UserId, FunctionNameScores.ExamId, FunctionNameScores.QuestionId, Questions.FunctionName FROM FunctionNameScores INNER JOIN Questions ON FunctionNameScores.QuestionId=Questions.QuestionId WHERE FunctionNameScores.ExamId=? AND FunctionNameScores.UserId=?', [ExamId, UserId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

    response.json(await getFunctionScoresPromise());

});


app.post('/getFunctionNameScores', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;
    if(!ExamId) {
        response.json({'Result':"Invalid Request"});
        response.end();
        return;
    }

	getFunctionScoresPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT FunctionNameScores.CorrectFunctionName, FunctionNameScores.OverrideScore, FunctionNameScores.ProvidedFunctionName, FunctionNameScores.UserId, FunctionNameScores.ExamId, FunctionNameScores.QuestionId, Questions.FunctionName FROM FunctionNameScores INNER JOIN Questions ON FunctionNameScores.QuestionId=Questions.QuestionId WHERE FunctionNameScores.ExamId=?', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	response.json(await getFunctionScoresPromise());

})

app.post('/getConstraintScores', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;
    if(!ExamId) {
        response.json({'Result':"Invalid Request"});
        response.end();
        return;
    }

    getFunctionScoresPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT ConstraintScores.UserId, ConstraintScores.ExamId, ConstraintScores.QuestionId, ConstraintScores.ConstraintFollowed, ConstraintScores.OverrideScore, Questions.ConstraintType FROM ConstraintScores INNER JOIN Questions ON ConstraintScores.QuestionId=Questions.QuestionId WHERE ConstraintScores.ExamId=?', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

    response.json(await getFunctionScoresPromise());

})

app.post('/studentGetConstraintScores', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;
    if(!ExamId) {
        response.json({'Result':"Invalid Request"});
        response.end();
        return;
    }
    let UserId = request.session.UserData.UserId;

    getFunctionScoresPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT ConstraintScores.UserId, ConstraintScores.ExamId, ConstraintScores.QuestionId, ConstraintScores.ConstraintFollowed, ConstraintScores.OverrideScore, Questions.ConstraintType FROM ConstraintScores INNER JOIN Questions ON ConstraintScores.QuestionId=Questions.QuestionId WHERE ConstraintScores.ExamId=? AND ConstraintScores.UserId=?', [ExamId, UserId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

    response.json(await getFunctionScoresPromise());

});

app.post('/overrideConstraintScore', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
	let UserId = request.body.UserId;
	let QuestionId = request.body.QuestionId;
	let OverrideScore = request.body.OverrideScore;
	if(!OverrideScore) {
		OverrideScore=0
	}

	if(!ExamId || !UserId || !QuestionId || !OverrideScore) {
		response.json({'Result':"Invalid Request"});
        response.end();
        return;
    }
	
	constraintOverridePromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE ConstraintScores SET OverrideScore=? WHERE ExamId=? AND UserId=? AND QuestionId=?', [OverrideScore, ExamId, UserId, QuestionId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }
	
	if(await constraintOverridePromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }

});

app.post('/overrideFunctionNameScore', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;
    let UserId = request.body.UserId;
    let QuestionId = request.body.QuestionId;
    let OverrideScore = request.body.OverrideScore;
    if(!OverrideScore) {
        OverrideScore=0
    }

    if(!ExamId || !UserId || !QuestionId || !OverrideScore) {
        response.json({'Result':"Invalid Request"});
        response.end();
        return;
    }

    constraintOverridePromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE FunctionNameScores SET OverrideScore=? WHERE ExamId=? AND UserId=? AND QuestionId=?', [OverrideScore, ExamId, UserId, QuestionId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

    if(await constraintOverridePromise()) {
        response.json({'Result':'Success'});
        response.end();
    } else {
        response.json({'Result':'Error'});
        response.end();
    }

});


app.post('/getStudentResponsesAndScores', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
    if(!ExamId) {
        response.json({'Result':"Invalid Request"});
        response.end();
        return;
    }

	getStudentResponsesPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT Scores.UserId, Scores.ExamId, Scores.TestCaseId, T.QuestionId, Scores.AutoGraderScore, Scores.AutoGraderOutput, T2.PointValue / T3.NumTestCases AS TestCasePointValue, Scores.InstructorOverrideScore, Scores.InstructorComment, StudentAnswers.StudentResponse, Questions.FunctionName, Questions.QuestionText, T.TestCaseInput, T.TestCaseOutput from Scores LEFT JOIN (SELECT TestCaseId, QuestionId, TestCaseInput, TestCaseOutput FROM TestCases) AS T ON Scores.TestCaseId=T.TestCaseId INNER JOIN (SELECT * FROM ExamQuestions WHERE ExamId=?) as T2 ON T2.ExamId=Scores.ExamId AND T2.QuestionId=T.QuestionId INNER JOIN StudentAnswers ON T.QuestionId=StudentAnswers.QuestionId AND Scores.UserId=StudentAnswers.UserId AND Scores.ExamId=StudentAnswers.ExamId INNER JOIN Questions ON Questions.QuestionId=T.QuestionId INNER JOIN (SELECT QuestionID, Count(QuestionId) as NumTestCases FROM TestCases GROUP BY QuestionId) as T3 ON T3.QuestionId=T.QuestionId', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	response.json(await getStudentResponsesPromise());

});

app.post('/getStudentsByExam', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

	let ExamId = request.body.ExamId;
	if(!ExamId) {
		response.json({'Result':"Invalid Request"});
		response.end();
		return;
	}

	getStudentsPromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('SELECT Users.UserId, Users.Username FROM Users RIGHT JOIN (SELECT DISTINCT UserId FROM Scores WHERE ExamId=?) as T ON Users.UserId=T.UserId', [ExamId],
                (error, elements) => {
                    if(error) return reject(error);
                    return resolve(elements);
                });
        });
    }

	response.json(await getStudentsPromise());

});

app.post('/insertScore', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
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


});

app.post('/getScores', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
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
            pool.query('SELECT T.TestCaseId, T.AutoGraderScore, T.InstructorOverrideScore, T.InstructorComment, TestCases.TestCaseInput, TestCases.TestCaseOutput, T.AutoGraderOutput, TestCases.QuestionId, ExamQuestions.PointValue / T2.NumTestCases AS TestCasePointValue, Questions.QuestionText, Questions.FunctionName, StudentAnswers.StudentResponse FROM (SELECT * FROM Scores WHERE ExamId=? AND UserId=?) AS T INNER JOIN TestCases ON T.TestCaseId=TestCases.TestCaseId INNER JOIN ExamQuestions ON T.ExamId=ExamQuestions.ExamId AND TestCases.QuestionId=ExamQuestions.QuestionId INNER JOIN Questions ON TestCases.QuestionId=Questions.QuestionId INNER JOIN StudentAnswers ON StudentAnswers.UserId=T.UserId AND StudentAnswers.ExamId=T.ExamId AND StudentAnswers.QuestionId=TestCases.QuestionId INNER JOIN (SELECT QuestionID, Count(QuestionId) as NumTestCases FROM TestCases GROUP BY QuestionId) AS T2 ON T2.QuestionId=TestCases.QuestionId', [ExamId, UserId],
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
    if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

    //User must be an instructor
    if(request.session.UserData.AccountType != 'T') {
        response.json({'Result':'Invalid Request'});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;
    let TestCaseId = request.body.TestCaseId;
    let UserId = request.body.UserId;
    let InstructorOverrideScore = request.body.InstructorOverrideScore;

    updateScorePromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE Scores SET InstructorOverrideScore=? WHERE UserId=? AND ExamId=? AND TestCaseId=?', [InstructorOverrideScore, UserId, ExamId, TestCaseId],
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

app.post('/addComment', async function(request, response) {
	if(!(await util.isUserLoggedIn(request.session, pool))) {
        response.json({"Result":"Please login"});
        response.end();
        return;
    }

	if(request.session.UserData.AccountType != 'T') {
        response.json({'Result':'Invalid Request'});
        response.end();
        return;
    }

    let ExamId = request.body.ExamId;
    let TestCaseId = request.body.TestCaseId;
    let UserId = request.body.UserId;
    let InstructorComment = request.body.InstructorComment;

    updateScorePromise = () => {
        return new Promise((resolve, reject) => {
            pool.query('UPDATE Scores SET InstructorComment=? WHERE UserId=? AND ExamId=? AND TestCaseId=?', [InstructorComment, UserId, ExamId, TestCaseId],
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


}
