
module.exports = function (app, pool, util) {

	app.post('/insertTestCase', async function (request, response) {
		if(!(await util.isUserLoggedIn(request.session))) {
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


	app.post('/getQuestionTestCases', async function(request, response) {
		if(!(await util.isUserLoggedIn(request.session))) {
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
}
