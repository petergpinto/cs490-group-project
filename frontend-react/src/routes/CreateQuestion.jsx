import React, { Component, useState } from "react";

class CreateQuestion extends Component {

	constructor(props) {
		super(props);
	}

	submitQuestion(questionData) {
		questionData.preventDefault();	
		var data = new URLSearchParams();
		data.append('QuestionText', questionData.target[0].value);
		data.append('FunctionName', questionData.target[1].value);
		data.append('DifficultyRating', questionData.target[2].value);
		questionData.target.reset();

		fetch('https://cs490backend.peterpinto.dev/insertQuestion', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Accept':'application/json',
				'content-type':'application/x-www-form-urlencoded'
			},
				body:data
			}).then(res => res.json())
	}

	render() {
		if (!this.props.showElement) {
			return <div></div>
		}

		return (
			<div className="CreateQuestion">
				<form onSubmit={this.submitQuestion}>
					<label>Question Text</label>
					<textarea type='text' size='100' id='QuestionText' key='QuestionText' />

					<label>Function Name</label>
					<input type='text' id='FunctionName' key='FunctionName' />

					<label>Difficulty Rating</label>
					<input type='number' id='DifficultyRating' key='DifficultyRating' />
					<input type="submit" />
				</form>
			</div>
		);
	}
}

export default CreateQuestion
