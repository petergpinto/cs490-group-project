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
		this.state = {data: [{'':''}]};
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
		this.props.navigate('/StudentLanding');
	}

	logout() {
		localStorage.removeItem('token');
		this.props.navigate('/login');
	}

	componentDidMount() {
		this.refreshExamList();
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
						<button onClick={this.refreshExamList}>Take Exam</button>
						<button onClick={this.refreshScoresList}>View Exam Scores</button>
						<button onClick={this.logout}>Logout</button>
					</div>
					<StudentExamList data={this.state.data} />
					<div className="ScoresList">
					</div>
      				<h2>Student Landing Page</h2>
				</main>
			</div>
  		);
	}
}


function WithNavigate(props) {
    let navigate = useNavigate();
    return <StudentLanding {...props} navigate={navigate} />
}
export default WithNavigate;
