import React, { Component } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import CreateQuestion from './CreateQuestion';
import ShowQuestionBank from './ShowQuestionBank';
import AutoGrader from './AutoGrader';
import ReviewExams from './ReviewExams';
import './TeacherLanding.css';

const SHOW_CREATE_QUESTION = 'show_create_question';
const SHOW_CREATE_EXAM = 'show_create_exam';
const SHOW_QUESTION_BANK = 'show_question_bank';
const SHOW_AUTOGRADER = 'show_autograder';
const SHOW_REVIEW_EXAM = 'show_review_exam';

class TeacherLanding extends Component {

	constructor(props) {
		super(props);
		this.logout = this.logout.bind(this);
		this.resetPage = this.resetPage.bind(this);
		this.viewQuestionBank = this.viewQuestionBank.bind(this);
		this.createNewExam = this.createNewExam.bind(this);
		this.createQuestion = this.createQuestion.bind(this);
		this.reviewExams = this.reviewExams.bind(this);
		this.showAutoGrader = this.showAutoGrader.bind(this);
		this.state = { data: [{ '': '' }], showElement: SHOW_QUESTION_BANK };
	}

	resetPage() {
		this.props.navigate('/TeacherLanding');
	}

	logout() {
		localStorage.removeItem('token');
		this.props.navigate('/login');
	}

	viewQuestionBank() {
		this.setState({ showElement: SHOW_QUESTION_BANK });
	}

	createQuestion() {
		this.setState({ showElement:SHOW_CREATE_QUESTION });
	}

	createNewExam() {
		this.setState({ showElement:SHOW_CREATE_EXAM });
	}

	reviewExams() {
		this.setState({ showElement:SHOW_REVIEW_EXAM });
	}

	showAutoGrader() {
		this.setState({ showElement:SHOW_AUTOGRADER });
	}

	render() {
	
		let token = JSON.parse(localStorage.getItem('token'));
        if(!token || token.UserData.AccountType != 'T') {
            return ( <Navigate to="/login" /> );
        }

  		return (
			<div className="TeacherLanding">
    		<main className="Main">
				<div className="TopNavigationBar">
					<button onClick={this.resetPage}>Home</button>
					<button onClick={this.createNewExam}>Create Exam</button>
                    <button onClick={this.viewQuestionBank}>View Question Bank</button>
					<button onClick={this.createQuestion}>Add new Question</button>
					<button onClick={this.showAutoGrader}>Autograde Exams</button>
                    <button onClick={this.reviewExams}>Review Student Exams</button>
                    <button onClick={this.logout}>Logout</button>
				</div>
				<CreateQuestion showElement={this.state.showElement === SHOW_CREATE_QUESTION} />
				<ShowQuestionBank showElement={this.state.showElement === SHOW_QUESTION_BANK} />
      			<ShowQuestionBank showElement={this.state.showElement === SHOW_CREATE_EXAM} buildForm='true' />
				<AutoGrader showElement={this.state.showElement === SHOW_AUTOGRADER} />
				<ReviewExams showElement={this.state.showElement === SHOW_REVIEW_EXAM} />
				<h2>Teacher Landing Page</h2>
    		</main>
			</div>
  		);
  	}
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <TeacherLanding {...props} navigate={navigate} />
}
export default WithNavigate;
