import React, { Component, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dimmer, Loader } from "semantic-ui-react";
import './AutoGrader.css';

class AutoGrader extends Component {

	constructor(props) {
        super(props);

		this.showExamButtons = this.showExamButtons.bind(this);
		this.refreshExamButtons = this.refreshExamButtons.bind(this);
		this.triggerAutoGrader = this.triggerAutoGrader.bind(this);
		this.state = {exams:[], loading:false};
	}

	triggerAutoGrader(event) {
		alert("Exam Graded");
		let data = new URLSearchParams();
		data.append("ExamId", event.target.value);
		return fetch('https://cs490backend.peterpinto.dev/triggerAutoGrader', {
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

	refreshExamButtons() {
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

	showExamButtons() {
		let items = this.state.exams;

		return items.map((row, index) => {
			return <button name = 'ExamButton' id = 'ExamButton' onClick={this.triggerAutoGrader} value={row.ExamId}>{row.ExamFriendlyName}</button>	
		})
	}

	componentDidMount() {
		this.showExamButtons();
		this.interval = setInterval(this.refreshExamButtons, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}


	render() {
		if (!this.props.showElement) {
            return <div></div>
        }

		return (
			<div className='AutoGrader'>
				{false ? <div className="Loader"><Dimmer active inverted size="massive"><Loader inverted>Loading</Loader></Dimmer></div> : null}
			<h2>Select an Exam to Autograde</h2>
				<div className='AutoGraderButtons'>
					{this.showExamButtons()}
					<Icon />
				</div>
			</div>
		)
	}
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <AutoGrader {...props} navigate={navigate} />
}
export default WithNavigate

function Icon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 755 607">
			<path
				fill="#21b04b"
				d="M225.38 585.25L198.611 550l-43.89-50.323-50.221-40.088-56.75-35.996L23 410.596l15.5-74.595L54 258.836l1.51-2.835 20.25 9.423 18.74 9.424 58.221 58.653 13.215 21.25L179.871 376l97.457-102 121.17-114.48 89-69.957 114.97-79.37 57.071 71.308 64.611 81.838 8.814 12-62.25 36.093-62.22 34.93-65.5 45.958-164.23 127.86-44.732 40.325-37.601 42.5-52.767 63.226-16.175 20.75z"
			></path>
		</svg>
	);
}