module.exports = function (app, pool, util) {

app.post('/insertScore', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
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


});

app.post('/getScores', async function(request, response) {
    if(!(await util.isUserLoggedIn(request.session, pool))) {
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
    if(!(await util.isUserLoggedIn(request.session, pool))) {
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




}
