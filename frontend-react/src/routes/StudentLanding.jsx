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
						<button onClick={this.refreshExamList}>Take Exam</button>
						}
						{ true? null:
						<button >View Exam Scores</button>
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
		this.setState({ activeQuestion: event.target.value });
		console.log(event.target.value);
	}

	renderQuestions() {
		let questions = this.state.data;
		return questions.map((row, index) => {
			return <div className="ExamQuestion"><h3>{row.QuestionText}</h3><h4>{row.PointValue} {row.PointValue>1? 'Points':'Point'}</h4><textarea questionid={row.QuestionId} onChange={this.debounce(this.handleQuestionChange, 1000)} onKeyDown={this.handleKeyDown} /></div>
		})
	}

	renderQuestionMinimap() {
		let questions = this.state.data;
		return questions.map((row, index) => {
			return <button value={index} onClick={this.setActiveQuestion}></button>
        })
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
				{ this.renderQuestionMinimap() }
			{ this.renderQuestions() }
			<div className='ExamSubmitButton'>
			<button onClick={this.submitExam}>Submit Exam for Grading</button>
			</div>
			</div>
		)
	}
}



class ViewScore extends Component {
	constructor(props) {
        super(props);
		this.getScore = this.getScore.bind(this);
		this.renderScores = this.renderScores.bind(this);
		this.getFunctionNameScores = this.getFunctionNameScores.bind(this);
		this.showTotalPoints = this.showTotalPoints.bind(this);
		this.showExamTotalPoints = this.showExamTotalPoints.bind(this);
		this.state = {data:[], functions:[]};
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

	componentDidMount() {
		this.getScore(this.props.ExamId);
		this.getFunctionNameScores(this.props.ExamId);
	}

	showTotalPoints(questionId) {
        let points = 0;
        let responses = this.state.data;

        for(let i in responses) {

            if(responses[i].QuestionId==questionId && responses[i].InstructorOverrideScore) {
                points += responses[i].InstructorOverrideScore;
            }
            else if(responses[i].QuestionId==questionId && responses[i].AutoGraderScore == 1) {
                points += responses[i].TestCasePointValue;
            }
        }
        let items2 = this.state.functions;
        for (let i in items2) {
            if(items2[i].QuestionId==questionId && items2[i].CorrectFunctionName == 0) {
                points -= 1;
            }
        }
        if(points < 0)
            points = 0;

        return <tr><td>Total Points</td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td><td style={{border: 'none'}}></td><td>{points}</td></tr>
    }

	showExamTotalPoints(userId) {
        let points = 0;
        let totalPossible = 0;
        let responses = this.state.data;
        let small_map = {};

        if(this.state.selectedExam == -1 || this.state.selectedUser == -1)
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
                <td>Test Case {i++}: {row.AutoGraderScore == 1? 'Passed': 'Failed'}</td>
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
                		<td>Function Name</td><td style={{border:'none'}}></td><td style={{border:"none"}}></td><td>{items[i].CorrectFunctionName == 1? "Correct":"Incorrect"}</td><td>{items[i].CorrectFunctionName == 1? 0 : -1}</td>
            		</tr>
				)
		}
	}

	renderScores() {
		let items = this.state.data;
		let questionIds = [];

		return items.map((row, index) => {
			if(questionIds.indexOf(row.QuestionId) >= 0 )
                return null
            questionIds.push(row.QuestionId);

			return (<div><div className="StudentTestCaseTable" >
					<br/>
					<h3 style={{'textAlign':'center'}}>{row.FunctionName}</h3>
					<table>
					<thead>
						<tr>
							<th></th><th>Input</th><th>Expected Output</th><th>AutoGrader Output</th><th>Score</th><th>Instructor Comment</th>
						</tr>
					</thead>
					{ this.renderQuestion(row.QuestionId) }
					{ this.renderFunctionName(row.QuestionId) }
					{ this.showTotalPoints(row.QuestionId) }
					</table>
				</div></div>
			)
		})
	}

	render() {
		return ( <div>
			{ this.renderScores() }
			<br/>
			{ this.showExamTotalPoints() }
			</div>
		)
	}
}


function WithNavigate(props) {
    let navigate = useNavigate();
    return <StudentLanding {...props} navigate={navigate} />
}
export default WithNavigate;
