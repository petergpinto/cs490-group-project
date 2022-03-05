import React, { Component } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import CreateQuestion from './CreateQuestion';
import ShowQuestionBank from './ShowQuestionBank';
import AutoGrader from './AutoGrader';
import ReviewExams from './ReviewExams';
import './TeacherLanding.css';

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
		this.state = {data: [{'':''}], showElement:{CreateQuestion:false, ShowCreateExam:false, ShowQuestionBank:true, ShowAutoGrader:false, ShowReviewExams:false}};
	}

	resetPage() {
		this.props.navigate('/TeacherLanding');
	}

	logout() {
		localStorage.removeItem('token');
		this.props.navigate('/login');
	}

	viewQuestionBank() {
		this.setState({showElement:{CreateQuestion:false, ShowCreateExam:false, ShowQuestionBank:true, ShowAutoGrader:false, ShowReviewExams:false}});
	}

	createQuestion() {
		this.setState({showElement:{CreateQuestion:true, ShowCreateExam:false, ShowQuestionBank:false, ShowAutoGrader:false, ShowReviewExams:false}});
	}

	createNewExam() {
		this.setState({showElement:{CreateQuestion:false, ShowCreateExam:true, ShowQuestionBank:false, ShowAutoGrader:false, ShowReviewExams:false}});
	}

	reviewExams() {
		this.setState({showElement:{CreateQuestion:false, ShowCreateExam:false, ShowQuestionBank:false, ShowAutoGrader:false, ShowReviewExams:true}});
	}

	showAutoGrader() {
		this.setState({showElement:{CreateQuestion:false, ShowCreateExam:false, ShowQuestionBank:false, ShowAutoGrader:true, ShowReviewExams:false}});
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
				<CreateQuestion showElement={this.state.showElement.CreateQuestion} />
				<ShowQuestionBank showElement={this.state.showElement.ShowQuestionBank} />
      			<ShowQuestionBank showElement={this.state.showElement.ShowCreateExam} buildForm='true' />
				<AutoGrader showElement={this.state.showElement.ShowAutoGrader} />
				<ReviewExams showElement={this.state.showElement.ShowReviewExams} />
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
