import React, { Component, useState } from "react";
import { useNavigate } from "react-router-dom";
//import './CreateQuestion.css';

class ReviewExams extends Component {

	constructor(props) {
        super(props);
			
		this.refreshExams = this.refreshExams.bind(this);
		this.selectExam = this.selectExam.bind(this);
		this.showExamButtons = this.showExamButtons.bind(this);
		this.state = {exams:[], selectedExam:-1};
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

	selectExam(event) {
		this.setState({selectedExam:event.target.value});
	}

	showExamButtons() {
        let items = this.state.exams;

        return items.map((row, index) => {
            return <button onClick={this.selectExam} value={row.ExamId}>{row.ExamFriendlyName}</button>
        })
    }

	componentDidMount() {
		this.refreshExams();
		this.interval = setInterval(this.refreshExams, 3000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		if (!this.props.showElement) {
            return <div></div>
        }

		return (
			<div className='ReviewExams'>
			<h2>Review Student Exam Responses</h2>
			{ this.showExamButtons() }
			</div>
		)
	}
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <ReviewExams {...props} navigate={navigate} />
}
export default WithNavigate

