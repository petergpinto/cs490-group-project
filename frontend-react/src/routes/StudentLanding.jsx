import React, { Component, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import StudentExamList from './StudentExamList.jsx';
import './StudentLanding.css';

const SHOW_EXAM_LIST = "show_exam_list";
const SHOW_TAKE_EXAM = "show_take_exam";
const SHOW_VIEW_SCORE = "show_view_score";

class StudentLanding extends Component {
	constructor(props) {
		super(props);
		this.logout = this.logout.bind(this);
		this.resetPage = this.resetPage.bind(this);
		this.refreshExamList = this.refreshExamList.bind(this);
		this.takeExamButton = this.takeExamButton.bind(this);
		this.viewScoreButton = this.viewScoreButton.bind(this);
		this.state = {data: [{'':''}], activeComponent: SHOW_EXAM_LIST, activeExam:-1};
	}

	refreshExamList() {
		return fetch('https://cs490backend.peterpinto.dev/getAllExams', {
		method: 'GET',
		credentials: 'include',
		headers: {
			'Accept':'application/json'
		}, 
		}).then(data => data.json())
		.then(json => {
			if(json.Result && json.Result != 'Success')
            	this.props.navigate('/login');
			json.forEach(obj => {
				obj.takeExam='Take Exam Now';
				obj.viewScores='View Scores';
			});
			this.setState({data:json});
		});
	}

	resetPage() {
		this.setState({activeComponent: SHOW_EXAM_LIST});
		this.setState({activeExam:-1});
		this.props.navigate('/StudentLanding');
	}

	logout() {
		localStorage.removeItem('token');
		this.props.navigate('/login');
	}

	componentDidMount() {
		this.refreshExamList();
	}

	takeExamButton(event) {
		event.preventDefault();
		this.setState({activeComponent: SHOW_TAKE_EXAM});
		this.setState({activeExam:event.target.value});
	}

	viewScoreButton(event) {
		event.preventDefault();
		this.setState({activeComponent: SHOW_VIEW_SCORE});
		this.setState({activeExam:event.target.value});
	}

	render() {
		let token = JSON.parse(localStorage.getItem('token'));	
		if(!token || token.UserData.AccountType != 'S') {
			return ( <Navigate to="/login" /> );
		}
		
		return (
			<div className="StudentLanding">
				<main className="Main">
					<div className="TopNavigationBar">
						<button onClick={this.resetPage}>Home</button>
						{ true? null:
						<button name='Take' id='Take' onClick={this.refreshExamList}>Take Exam</button>
						}
						{ true? null:
						<button name='View' id='View' >View Exam Scores</button>
						}
						<button onClick={this.logout}>Logout</button>
					</div>
					{ this.state.activeComponent === SHOW_EXAM_LIST? <StudentExamList data={this.state.data} takeExam={this.takeExamButton} viewScore={this.viewScoreButton} /> : null }
					{ this.state.activeComponent === SHOW_TAKE_EXAM? <TakeExam ExamId={this.state.activeExam} /> : null}
					{ this.state.activeComponent === SHOW_VIEW_SCORE? <ViewScore ExamId={this.state.activeExam} /> :null }
					<div className="ScoresList">
					</div>
      				<h2>Student Landing Page</h2>
				</main>
			</div>
  		);
	}
}

class TakeExam extends Component {
	constructor(props) {
        super(props);
		this.fetchExamQuestions = this.fetchExamQuestions.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.debounce = this.debounce.bind(this);
		this.handleQuestionChange = this.handleQuestionChange.bind(this);
		this.submitExam = this.submitExam.bind(this);
		this.renderQuestionMinimap = this.renderQuestionMinimap.bind(this);
		this.setActiveQuestion = this.setActiveQuestion.bind(this);
		this.renderQuestion = this.renderQuestion.bind(this);
		this.goToNextQuestion = this.goToNextQuestion.bind(this);
		this.goToPrevQuestion = this.goToPrevQuestion.bind(this);
		this.saveQuestionInfo = this.saveQuestionInfo.bind(this);

		this.state = {data:[{'':''}], examSubmitted:false, activeQuestion:0}
	}

	debounce(func, delay) {
        let debounceTimer;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer =
            setTimeout(() => func.apply(context, args), delay);
        }
    }

	handleQuestionChange(event) {
		event.persist();
		var data = new URLSearchParams();
		data.append("QuestionId", event.target.getAttribute('questionid'));
		data.append("ExamId", this.props.ExamId)
		data.append("StudentResponse", event.target.value);

        return fetch('https://cs490backend.peterpinto.dev/updateStudentResponse', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept':'application/json'
        }, body: data
        }).then(data => data.json())

	}

	fetchExamQuestions() {

		var data = new URLSearchParams();
		data.append('ExamId', this.props.ExamId)

        return fetch('https://cs490backend.peterpinto.dev/getExamQuestions', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept':'application/json'
        }, body: data
        }).then(data => data.json())
        .then(json => {
			if(json.Result && json.Result != 'Success')
            	this.props.navigate('/login');
            this.setState({data:json});
        });

	}

	submitExam() {
		
		var data = new URLSearchParams();
		data.append('ExamId', this.props.ExamId);

		return fetch('https://cs490backend.peterpinto.dev/submitExam', {
		method: 'POST',
        credentials: 'include',
        headers: {
            'Accept':'application/json'
        }, body: data
        }).then(data => data.json())
        .then(json => {
			if(json.Result && json.Result != 'Success')
            	this.props.navigate('/login');
			this.setState({examSubmitted:true});
        });
	}

	handleKeyDown(e) {
    	if (e.key === "Tab") {
    		e.preventDefault();
			let val = e.target.value;
			let start = e.selectionStart;
			let end = e.selectionEnd;

			e.target.value = e.target.value + '\t';
		}
  	}

	setActiveQuestion(event) {
		//console.log(this.state.data[event.target.value]);
		this.setState({ 
			activeQuestion: event.target.value,
			value: this.state.data[event.target.value] ? this.state.data[event.target.value].user_text : ""
		});
	}

	goToNextQuestion() {
		console.log(this.state.activeQuestion);
		this.setState({
			activeQuestion: parseInt(this.state.activeQuestion) + 1,
			value: this.state.data[parseInt(this.state.activeQuestion)+1] ? this.state.data[parseInt(this.state.activeQuestion)+1].user_text : ""
		});
	}

	goToPrevQuestion() {
		this.setState({
			activeQuestion: parseInt(this.state.activeQuestion) - 1,
			value: this.state.data[parseInt(this.state.activeQuestion)-1] ? this.state.data[parseInt(this.state.activeQuestion)-1].user_text : ""
		});
    }
	saveQuestionInfo(event)	{
		//console.log(this.state.data);
		var newState = Object.assign([], this.state.data);
		//console.log(newState);
		newState[this.state.activeQuestion]["user_text"] = event.target.value;
		//console.log(newState);
		this.setState({
			data: newState,
			value: event.target.value
		});

	}

	renderQuestions() {
		let questions = this.state.data;
		return questions.map((row, index) => {
			return <div className="ExamQuestion"><h3>{row.QuestionText}</h3><h4>{row.PointValue} {row.PointValue>1? 'Points':'Point'}</h4><textarea questionid={row.QuestionId} onChange={this.debounce(this.handleQuestionChange, 1000)} onKeyDown={this.handleKeyDown} /></div>
		})
	}

	renderQuestion() {
		let questions = this.state.data;
		return (
			<div className="ExamQuestion">
				<h2>Question {parseInt(this.state.activeQuestion) + 1}</h2>
				<h3 style={{'max-width':'1000px'}}>{questions[this.state.activeQuestion].QuestionText}</h3>
				<h4>{questions[this.state.activeQuestion].PointValue} {questions[this.state.activeQuestion].PointValue > 1 ? 'Points' : 'Point'}</h4>
				<textarea questionid={questions[this.state.activeQuestion].QuestionId} value = {this.state.value || ""} onChange={e => {this.debounce(this.handleQuestionChange(e), 1000),this.saveQuestionInfo(e)}} onKeyDown={this.handleKeyDown} />
			</div>
		);
    }


	renderQuestionMinimap() {
		let questions = this.state.data;
		return questions.map((row, index) => {
			return <button value={index} onClick={this.setActiveQuestion}>Question {index+1}</button>
        })
	}

	renderNextPrevButtons() {
		let html = [];
		if (parseInt(this.state.activeQuestion) > 0) {
			//show prev button
			html.push(<button name='prev' id='prev' onClick={this.goToPrevQuestion}>Previous Question</button>);
		}
		html.push(<span>&nbsp;&nbsp;&nbsp;</span>)
		if (parseInt(this.state.activeQuestion) < this.state.data.length - 1) {
			//show next button
			html.push(<button name='next' id='next' onClick={this.goToNextQuestion}>Next Question</button>);
		}

		return html;
    }

	componentDidMount() {
		this.fetchExamQuestions();
	}

	render() {
		if(this.state.examSubmitted) {
			window.location.reload();
			return (<p>Exam Submitted</p>);
		}

		return (
			<div className='TakeExam'>
				<div className="QuestionMinimap">
					<h4>Question Minimap</h4>
					{ this.renderQuestionMinimap() }
				</div>
				{this.renderQuestion()}
				<div className='NextPrevButtons'>
					{ this.renderNextPrevButtons() }
				</div>
				<div className='ExamSubmitButton'>
					<button onClick={this.submitExam}>Submit Exam</button>
				</div>
			</div>
		)
	}
}



class ViewScore extends Component {
	constructor(props) {
        super(props);
		this.getScore = this.getScore.bind(this);
		this.getFunctionNameScores = this.getFunctionNameScores.bind(this);
		this.showTotalPoints = this.showTotalPoints.bind(this);
		this.showExamTotalPoints = this.showExamTotalPoints.bind(this);
		this.showResponses = this.showResponses.bind(this);
		this.showTestCases = this.showTestCases.bind(this);
		this.showFunctionName = this.showFunctionName.bind(this);
		this.showConstraint = this.showConstraint.bind(this);
		this.showTotalPoints = this.showTotalPoints.bind(this);

		this.state = {data:[], functions:[], constraints:[]};
	}

	getScore(examid) {
		let data = new URLSearchParams();
		data.append("ExamId", examid);
		return fetch('https://cs490backend.peterpinto.dev/getScores', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept':'application/json'
        }, body: data
        }).then(data => data.json())
        .then(json => {
            if(json.Result && json.Result != 'Success')
                this.props.navigate('/login');
            this.setState({data:json});
        });
	}

	getFunctionNameScores(examid) {
		let data = new URLSearchParams();
        data.append("ExamId", examid);
        return fetch('https://cs490backend.peterpinto.dev/studentGetFunctionNameScores', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept':'application/json'
        }, body: data
        }).then(data => data.json())
        .then(json => {
            if(json.Result && json.Result != 'Success')
                this.props.navigate('/login');
            this.setState({functions:json});
        });

	}

	getConstraintScores(examid) {
		let data = new URLSearchParams();
		data.append("ExamId", examid);

		return fetch('https://cs490backend.peterpinto.dev/getConstraintScores', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
			}, body: data
		}).then(res => res.json())
			.then(json => {
				if (json.Result && json.Result != 'Success')
					this.props.navigate('/login');
				this.setState({ constraints: json });
			});
	}

	componentDidMount() {
		this.getScore(this.props.ExamId);
		this.getFunctionNameScores(this.props.ExamId);
		this.getConstraintScores(this.props.ExamId);
	}

	showExamTotalPoints(userId) {
        let points = 0;
        let totalPossible = 0;
        let responses = this.state.data;
        let small_map = {};

        if(this.props.ExamId == -1 || this.state.selectedUser == -1)
            return;

        for(let i in responses) {
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
        for( var key in small_map){
            if(small_map[key]<2){
                delete small_map[key];
            }
        }
        let items2 = this.state.functions;
        for (let i in items2) {
            if(items2[i].CorrectFunctionName == 0 && !(items2[i].QuestionId in small_map)) {
                points -= 1;
            }
        }
        if(points < 0)
            points = 0;

        return <div className='TestCaseTable'><table><tr><td>Total Points</td><td>{points}</td></tr><tr><td>Total Possible Points</td><td>{totalPossible}</td></tr><tr><td>Percentage Score</td><td>{(points / totalPossible)*100}</td></tr></table></div>
	}

	renderQuestion(questionId) {
		let items = this.state.data;
        let i = 1;

		return items.map((row, index) => {
            if(row.QuestionId != questionId)
                return null
            return <tr>
				<td style={{'white-space':'nowrap'}}>Test Case {i++}: {row.AutoGraderScore == 1? 'Passed': 'Failed'}</td>
                <td>{row.TestCaseInput}</td>
                <td>{row.TestCaseOutput}</td>
                <td>{row.AutoGraderOutput}</td>
                {row.InstructorOverrideScore? <td>{row.InstructorOverrideScore}</td> : <td>{row.AutoGraderScore == 1? row.TestCasePointValue : 0}</td> }
				<td>{row.InstructorComment? row.InstructorComment : null }</td>
                </tr>
        });
	}

	renderFunctionName(questionId) {
		let items = this.state.functions;
		for(let i in items) {
			if(items[i].QuestionId == questionId)
				return (
					<tr>
						<td>Function Name</td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: "none", 'background': 'inherit'}}></td><td>{items[i].CorrectFunctionName == 1? "Correct":"Incorrect"}</td><td>{items[i].CorrectFunctionName == 1? 0 : -1}</td>
            		</tr>
				)
		}
	}

	showTestCases(questionId) {
		let items = this.state.data;
		let i = 1;
		return items.map((row, index) => {
			if (row.QuestionId != questionId)
				return null
			return <tr>
				<td>Test Case {i++}: {row.AutoGraderScore == 1 ? 'Passed' : 'Failed'}</td>
				<td>{row.TestCaseInput}</td>
				<td>{row.TestCaseOutput}</td>
				<td>{row.AutoGraderOutput}</td>
				<td>{row.TestCasePointValue}</td>
				<td>{row.AutoGraderScore == 1 ? row.TestCasePointValue : 0}</td>
				<td>{row.InstructorOverrideScore || row.InstructorOverrideScore === 0 ? row.InstructorOverrideScore : null}</td>
				<td>{row.InstructorComment ? row.InstructorComment : null}</td></tr>
		});
	}

	showFunctionName(questionId) {
		let items = this.state.functions;
		for (let i in items) {
			if (items[i].QuestionId == questionId && items[i].ExamId == this.props.ExamId) {
				return <tr><td>Function Name</td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td><td>{items[i].CorrectFunctionName == 1 ? "Correct" : "Incorrect"}</td><td>{items[i].CorrectFunctionName == 1 ? 0 : -1}</td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td></tr>
			}
		}
	}

	showConstraint(questionId) {
		let items = this.state.constraints;
		for (let i in items) {
			if (items[i].QuestionId == questionId && items[i].ExamId == this.props.ExamId) {
				return <tr><td>Constraint Followed</td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td><td>{items[i].ConstraintFollowed == 1 ? "Followed" : "Not Followed"}</td><td>{items[i].ConstraintFollowed == 1 ? 0 : -1}</td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td></tr>
			}
		}
	}

	showTotalPoints(questionId) {
		let points = 0;
		let totalPoints = 0;
		let responses = this.state.data;

		for (let i in responses) {
			if (responses[i].QuestionId == questionId && (responses[i].InstructorOverrideScore || responses[i].InstructorOverrideScore === 0)) {
				points += responses[i].InstructorOverrideScore;
				totalPoints += responses[i].TestCasePointValue;
			}
			else if (responses[i].QuestionId == questionId && responses[i].AutoGraderScore == 1) {
				points += responses[i].TestCasePointValue;
				totalPoints += responses[i].TestCasePointValue;
			} else if (responses[i].QuestionId == questionId && responses[i].AutoGraderScore == 0) {
				totalPoints += responses[i].TestCasePointValue;
            }
		}
		let items2 = this.state.functions;
		for (let i in items2) {
			if (items2[i].QuestionId == questionId && items2[i].ExamId == this.props.ExamId && items2[i].CorrectFunctionName == 0) {
				points -= 1;
			}
		}

		let items3 = this.state.constraints;
		for (let i in items3) {
			if (items3[i].QuestionId == questionId && items3[i].ExamId == this.props.ExamId && items3[i].ConstraintFollowed == 0) {
				points -= 1;
			}
		}
		if (points < 0)
			points = 0;

		return <tr><td>Total Points</td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td><td>{totalPoints.toFixed(1)}</td><td>{points.toFixed(1)}</td></tr>
	}

	showResponses() {
		let items = this.state.data;
		let questionIds = [];

		return items.map((row, index) => {
			if (questionIds.indexOf(row.QuestionId) >= 0)
				return null
			questionIds.push(row.QuestionId);
			if (this.state.selectedUser == -1)
				return null
			return <div className="ShowResponses">
				<h2>{row.FunctionName}</h2>
				<h3>{row.QuestionText}</h3>
				<div className="StudentResponse">{row.StudentResponse}</div>
				<br /><div className="TestCaseTable">
					<table>
						<thead><tr><th></th><th>Input</th><th>Expected Output</th><th>AutoGrader Output</th><th>Points Possible</th><th>Points Awarded</th><th>Override Score</th><th>Comment</th></tr></thead>
						<tbody>
							{this.showTestCases(row.QuestionId)}
							{this.showFunctionName(row.QuestionId)}
							{this.showConstraint(row.QuestionId)}
							{this.showTotalPoints(row.QuestionId)}
						</tbody>
					</table>
				</div>
			</div>
		})
	}

	showExamTotalPoints() {
		let points = 0;
		let totalPossible = 0;
		let responses = this.state.data;
		let small_map = {};

		//console.info(responses);
		if (this.state.selectedExam == -1 || this.state.selectedUser == -1)
			return;

		for (let i in responses) {
			if (true) {
				if (responses[i].InstructorOverrideScore || responses[i].InstructorOverrideScore === 0) {
					points += responses[i].InstructorOverrideScore;
				}
				else if (responses[i].AutoGraderScore == 1) {
					points += responses[i].TestCasePointValue;
				}
				else {
					if (responses[i].QuestionId in small_map) {
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
		for (var key in small_map) {
			if (small_map[key] < 2) {
				delete small_map[key];
			}
		}
		let items2 = this.state.functions;
		for (let i in items2) {
			if (items2[i].ExamId == this.state.selectedExam && items2[i].CorrectFunctionName == 0 && !(items2[i].QuestionId in small_map)) {
				points -= 1;
			}
		}

		let items3 = this.state.constraints;
		for (let i in items3) {
			if (items3[i].ExamId == this.state.selectedExam && items3[i].ConstraintFollowed == 0 && !(items3[i].QuestionId in small_map)) {
				points -= 1;
			}
		}
		if (points < 0)
			points = 0;

		return <div className='TestCaseTable'><table><tr><td>Total Points</td><td>{points.toFixed(1)}</td></tr><tr><td>Total Possible Points</td><td>{totalPossible.toFixed(1)}</td></tr><tr><td>Percentage Score</td><td>{((points.toFixed(1) / totalPossible.toFixed(1)) * 100).toFixed(2)}</td></tr></table></div>
	}

	render() {
		return (<div>
			<br/ >
			{this.showResponses()}
			<br />
			{this.showExamTotalPoints()}
			</div>
		)
	}
}


function WithNavigate(props) {
    let navigate = useNavigate();
    return <StudentLanding {...props} navigate={navigate} />
}
export default WithNavigate;
