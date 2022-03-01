import React, { Component, useState } from "react";
import './CreateExam.css';

class CreateExam extends Component {

	constructor(props) {
		super(props);
	}

	createExam(e) {
		e.preventDefault();
		return fetch('https://cs490backend.peterpinto.dev/createNewExam', {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Accept':'application/json',
			}
			}).then(res => res.json())
	}

	render() {
		if (!this.props.showElement) {
			return <div></div>
		}

		return (
			<div className="CreateQuestion">
				
			</div>
		);
	}
}

export default CreateQuestion
