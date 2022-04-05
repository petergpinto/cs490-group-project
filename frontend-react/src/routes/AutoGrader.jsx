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
		this.setState({ loading: true });
		setTimeout(() => {
			this.setState({ loading: false })
		}, 3000);
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
				{this.state.loading ? <div className="Loader"><Dimmer active inverted size="massive"><Loader inverted>Loading</Loader></Dimmer></div> : null}
			<h2>Select an Exam to Autograde</h2>
				<div className='AutoGraderButtons'>
					{ this.showExamButtons() }	
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

