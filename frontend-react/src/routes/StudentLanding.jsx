import React, { Component, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import StudentExamList from './StudentExamList.jsx';
import './StudentLanding.css';

class StudentLanding extends Component {
	constructor(props) {
		super(props);
		this.logout = this.logout.bind(this);
		this.resetPage = this.resetPage.bind(this);
		this.refreshExamList = this.refreshExamList.bind(this);
		this.refreshScoresList = this.refreshScoresList.bind(this);
		this.takeExamButton = this.takeExamButton.bind(this);
		this.viewScoreButton = this.viewScoreButton.bind(this);
		this.state = {data: [{'':''}], activeComponent: {StudentExamList:true, TakeExam:false, ViewScore:false}, activeExam:-1};
	}

	refreshScoresList() {
		
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
			json.forEach(obj => {
				obj.takeExam='Take Exam Now';
				obj.viewScores='View Scores';
			});
			this.setState({data:json});
		});
	}

	resetPage() {
		this.setState({activeComponent: {TakeExam:false, StudentExamList:true, ViewScore:false}});
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
		this.setState({activeComponent: {TakeExam:true, StudentExamList:false, ViewScore:false}});
		this.setState({activeExam:event.target.value});
	}

	viewScoreButton(event) {
		event.preventDefault();
		this.setState({activeComponent: {TakeExam:false, StudentExamList:false, ViewScore:true}});
		this.setState({activeExam:event.target.value});
	}

	render() {
		console.log(this.state.data);
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
						<button onClick={this.refreshScoresList}>View Exam Scores</button>
						}
						<button onClick={this.logout}>Logout</button>
					</div>
					{ this.state.activeComponent.StudentExamList? <StudentExamList data={this.state.data} takeExam={this.takeExamButton} viewScore={this.viewScoreButton} /> : null }
					{ this.state.activeComponent.TakeExam? <TakeExam ExamId={this.state.activeExam} /> : null}
					{ this.state.activeComponent.ViewScore? <ViewScore ExamId={this.state.activeExam} /> :null }
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
		this.state = {data:[{'':''}], examSubmitted:false}
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
            console.log(json)
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
            console.log(json)
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

	renderQuestions() {
		let questions = this.state.data;
		return questions.map((row, index) => {
			return <div className="ExamQuestion"><h3>{row.QuestionText}</h3><h4>{row.PointValue} {row.PointValue>1? 'Points':'Point'}</h4><textarea questionid={row.QuestionId} onChange={this.debounce(this.handleQuestionChange, 1000)} onKeyDown={this.handleKeyDown} /></div>
		})
	}

	componentDidMount() {
		this.fetchExamQuestions();
	}

	render() {
		if(this.state.examSubmitted) {
			return (<p>Exam Submitted</p>);
		}

		return (
			<div className='TakeExam'>
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
	}

	render() {
		return ( 
			<p>VIEW SCORE</p>
		)
	}
}


function WithNavigate(props) {
    let navigate = useNavigate();
    return <StudentLanding {...props} navigate={navigate} />
}
export default WithNavigate;
