import React, { Component, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ReviewExams.css';


class ReviewExams extends Component {

	constructor(props) {
        super(props);
			
		this.refreshExams = this.refreshExams.bind(this);
		this.selectExam = this.selectExam.bind(this);
		this.showExamButtons = this.showExamButtons.bind(this);
		this.refreshStudents = this.refreshStudents.bind(this);
		this.refreshStudentResponses = this.refreshStudentResponses.bind(this);
		this.showTestCases = this.showTestCases.bind(this);
		this.selectUser = this.selectUser.bind(this);
		this.refreshFunctionNameScores = this.refreshFunctionNameScores.bind(this);
		this.showExamTotalPoints = this.showExamTotalPoints.bind(this);
		this.overrideScore = this.overrideScore.bind(this);
		this.state = {exams:[], students:[], responses:[], selectedExam:-1, selectedUser:-1, points:0};
	}

	refreshExams() {
        fetch('https://cs490backend.peterpinto.dev/getAllExams', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({exams:json})
            });
    }
	
	refreshStudents(examid) {
		let data = new URLSearchParams();
		data.append("ExamId", examid);
		return fetch('https://cs490backend.peterpinto.dev/getStudentsByExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }, body:data
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
				this.setState({students:json});
            });
	}

	refreshStudentResponses(examid) {
		let data = new URLSearchParams();
        data.append("ExamId", examid);

		return fetch('https://cs490backend.peterpinto.dev/getStudentResponsesAndScores', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }, body:data
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({responses:json});
            });

	}

	refreshFunctionNameScores(examid) {
		let data = new URLSearchParams();
        data.append("ExamId", examid);

        return fetch('https://cs490backend.peterpinto.dev/getFunctionNameScores', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }, body:data
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({functions:json});
            });
	}

	overrideScore(event) {
		event.preventDefault();
		console.log(event);
		let data = new URLSearchParams();
		data.append("UserId", event.target.getAttribute('userid'));
		data.append("ExamId", event.target.getAttribute('examid'));
		data.append("TestCaseId", event.target.getAttribute('testcaseid'));
		data.append("InstructorOverrideScore", event.target.value);
		
		return fetch('https://cs490backend.peterpinto.dev/overrideScore', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }, body:data
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
					this.props.navigate('/login');
				this.refreshStudentResponses(this.state.selectedExam);
            });
	}

	addComment(event) {
		event.preventDefault();
		let data = new URLSearchParams();
        data.append("UserId", event.target.getAttribute('userid'));
        data.append("ExamId", event.target.getAttribute('examid'));
        data.append("TestCaseId", event.target.getAttribute('testcaseid'));
		data.append("InstructorComment", event.target.value);

		return fetch('https://cs490backend.peterpinto.dev/addComment', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }, body:data
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
            });
	}

	releaseScores(event) {
		let data = new URLSearchParams();
        data.append("ExamId", event.target.value);

		return fetch('https://cs490backend.peterpinto.dev/releaseExamScore', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }, body:data
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
            });

	}

	selectExam(event) {
		this.setState({selectedExam:event.target.value});
		this.setState({selectedUser:-1});
		this.setState({points:0});
		this.refreshStudents(event.target.value);
		this.refreshStudentResponses(event.target.value);
		this.refreshFunctionNameScores(event.target.value);
	}

	showExamButtons() {
        let items = this.state.exams;

		return items.map((row, index) => {
			console.log(this.state.selectedExam, parseInt(row.ExamId), this.state.selectedExam == parseInt(row.ExamId))
			return <button onClick={this.selectExam} value={row.ExamId} className={this.state.selectedExam == parseInt(row.ExamId)? "ActiveExam":"NotActiveExam"} >{row.ExamFriendlyName}</button>
        	//return <button name = 'ExamButtons' id = 'ExamButtons' onClick={this.selectExam} value={row.ExamId}>{row.ExamFriendlyName}</button>
	})
    }
	
	selectUser(event) {
		//Weird
		//console.log(event.target.getAttribute('examid'));
		this.setState({selectedUser:event.target.value});
	}

	showStudentButtons() {
		let items = this.state.students;
		return items.map((row, index) => {
			return <button onClick={this.selectUser} value={row.UserId} className={this.state.selectedUser == parseInt(row.UserId) ? "ActiveStudent" : "NotActiveStudent"}>{row.Username}</button>
		//return <button name = 'StudentButtons' id = 'StudentButtons' onClick={this.selectUser} value={row.UserId}>{row.Username}</button>
        })
	}

	showResponses() {
		let items = this.state.responses;	
		let questionIds = [];

		return items.map((row, index) => {
			if(questionIds.indexOf(row.QuestionId) >= 0 || row.UserId != this.state.selectedUser) 
				return null
			questionIds.push(row.QuestionId);
			if(this.state.selectedUser == -1)
				return null
            return <div>
				<h2>{row.FunctionName}</h2>
				<h3>{row.QuestionText}</h3>
				<div className="StudentResponse">{row.StudentResponse}</div>
					<br/><div className="TestCaseTable">
					<table>
						<thead><tr><th></th><th>Input</th><th>Expected Output</th><th>AutoGrader Output</th><th>Points Possible</th><th>Points Awarded</th><th>Override Score</th><th>Comment</th></tr></thead>
						<tbody>
							{this.showTestCases(row.QuestionId, this.state.selectedUser)}
							{this.showFunctionName(row.QuestionId, this.state.selectedUser)}
							{this.showTotalPoints(row.QuestionId, this.state.selectedUser) }
						</tbody>
					</table>
					</div>
				</div>
        })
	}

	showTotalPoints(questionId, userId) {
		let points = 0;
		let responses = this.state.responses;

		for(let i in responses) {
			
			if(responses[i].UserId==userId && responses[i].QuestionId==questionId && responses[i].InstructorOverrideScore) {
				//console.log("hello");
				points += responses[i].InstructorOverrideScore;
			}
			else if(responses[i].UserId==userId && responses[i].QuestionId==questionId && responses[i].AutoGraderScore == 1) {
				points += responses[i].TestCasePointValue;
			}
		}
		let items2 = this.state.functions;
		for (let i in items2) {
			if(items2[i].QuestionId==questionId && items2[i].ExamId==this.state.selectedExam && items2[i].CorrectFunctionName == 0) {
				points -= 1;
			}
		}
		if(points < 0)
			points = 0;

		return <tr><td>Total Points</td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td><td>{points}</td></tr>
	}

	showExamTotalPoints(userId) {
		let points = 0;
		let totalPossible = 0;
        let responses = this.state.responses;
		let small_map = {};
		
		//console.info(responses);
		if(this.state.selectedExam == -1 || this.state.selectedUser == -1)
			return;

        for(let i in responses) {
            if(responses[i].UserId==userId) {
                if(responses[i].InstructorOverrideScore) {
					points += responses[i].InstructorOverrideScore;
             	}
				else if(responses[i].AutoGraderScore == 1) {
					points += responses[i].TestCasePointValue;
            	}
				else {
					if(responses[i].QuestionId in small_map){
						small_map[responses[i].QuestionId] += 1
					}
					else {
						small_map[responses[i].QuestionId] = 1
					}
				}	
				totalPossible += responses[i].TestCasePointValue;			
        	}
		}
		console.info(small_map);
		for( var key in small_map){
			if(small_map[key]<2){
				delete small_map[key];
			}
		}
        let items2 = this.state.functions;
        for (let i in items2) {
            if(items2[i].UserId==userId && items2[i].ExamId==this.state.selectedExam && items2[i].CorrectFunctionName == 0 && !(items2[i].QuestionId in small_map)) {
                points -= 1;
            }
        }
        if(points < 0)
            points = 0;

        return <div className='TestCaseTable'><table><tr><td>Total Points</td><td>{points}</td></tr><tr><td>Total Possible Points</td><td>{totalPossible}</td></tr><tr><td>Percentage Score</td><td>{(points / totalPossible)*100}</td></tr></table></div>
	}

	showFunctionName(questionId, userId) {
		let items = this.state.functions;
		for (let i in items) {
			//console.log(items[i]);
			if(items[i].UserId==userId && items[i].QuestionId==questionId && items[i].ExamId==this.state.selectedExam) {
				return <tr><td>Function Name</td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td><td>{items[i].CorrectFunctionName == 1? "Correct":"Incorrect"}</td><td>{items[i].CorrectFunctionName == 1? 0 : -1}</td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td></tr>
			}
		}
	}

	showTestCases(questionId, userId) {
		let items = this.state.responses;
		//console.info(items);
		let i = 1;
		return items.map((row, index) => {
			if(row.QuestionId != questionId || row.UserId != userId)
				return null
			return <tr>
				<td>Test Case {i++}: {row.AutoGraderScore == 1? 'Passed': 'Failed'}</td>
				<td>{row.TestCaseInput}</td>
				<td>{row.TestCaseOutput}</td>
				<td>{row.AutoGraderOutput}</td>
				<td>{row.TestCasePointValue}</td>
				<td>{row.AutoGraderScore == 1? row.TestCasePointValue : 0}</td>
				<td><input placeholder={row.InstructorOverrideScore ? row.InstructorOverrideScore : null}  examid={row.ExamId} userid={row.UserId} testcaseid={row.TestCaseId} onChange={this.overrideScore} type='number' min = {0} max={row.TestCasePointValue ? row.TestCasePointValue : null} step = "0.1"/></td>
				<td><input value={row.InstructorComment ? row.InstructorComment : null} examid={row.ExamId} userid={row.UserId} testcaseid={row.TestCaseId} onChange={this.addComment} type='text' /></td></tr>
		});
	}

	componentDidMount() {
		this.refreshExams();
		this.interval = setInterval(this.refreshExams, 3000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}
/*
	constructor(props) {
		super(props);
		this.state = {
    			render: false;
		}
		this.alertHi = this.alertHi.bind(this);
	}

	alertHi() {
 		this.setState({render: !this.state.render});
	}	
*/
	render() {
		if (!this.props.showElement) {
            		return <div></div>
        	}
		return (
			<div className='ReviewExams'>
				<h2>Review Student Exam Responses</h2>
				<div className="ReviewExamButtons">{ this.showExamButtons() }</div>
				<br />

				{ this.state.selectedExam !== -1? <button name = 'release' id = 'release' onClick={this.releaseScores} value={this.state.selectedExam}>Release Score to Students</button> : null }
				<br /><br />
				<div className="ReviewExamStudentButtons">{ this.showStudentButtons() }</div>
				<br />
				<div className="display-linebreak">
						{ this.showResponses() }
					<br/>
					{ this.showExamTotalPoints(this.state.selectedUser) }
				</div>
				<br/>
			</div>
		)
	}
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <ReviewExams {...props} navigate={navigate} />
}
export default WithNavigate

