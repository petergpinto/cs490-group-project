import React, { Component, useState } from "react";
import './CreateQuestion.css';

class CreateQuestion extends Component {

	constructor(props) {
		super(props);
		this.state = {inputLength:2}
		this.showTestCaseInput = this.showTestCaseInput.bind(this);
		this.updateButton = this.updateButton.bind(this);
	}
	updateButton(){
		this.setState(prevState => ({
				inputLength: prevState.inputLength+1
		}));
	}
	async submitQuestion(questionData) {
		questionData.preventDefault();	
		console.log(questionData.target);
		var data = new URLSearchParams();
		data.append('QuestionText', questionData.target[0].value);
		data.append('FunctionName', questionData.target[1].value);
		data.append('DifficultyRating', questionData.target[2].value);
		data.append('Category', questionData.target[3].value);
		data.append('Constraint', questionData.target[4].value);
		
		const response = await fetch('https://cs490backend.peterpinto.dev/insertQuestion', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Accept':'application/json',
				'content-type':'application/x-www-form-urlencoded'
			},
				body:data
			}).then(res => res.json());
		for(let i = 3; i+4<questionData.target.length;i+=4)
		{
				let test1data = new URLSearchParams();
				test1data.append('QuestionId', response[0].QuestionId);
				test1data.append('TestCaseInput', questionData.target[i].value);
				test1data.append('TestCaseInputType', questionData.target[i+1].value);
				test1data.append('TestCaseOutput', questionData.target[i+2].value);
                test1data.append('TestCaseOutputType', questionData.target[i+3].value);
				fetch('https://cs490backend.peterpinto.dev/insertTestCase', {
            		method: 'POST',
            		credentials: 'include',
           	 		headers: {
                		'Accept':'application/json',
                		'content-type':'application/x-www-form-urlencoded'
            		},
                		body:test1data
            	});
		}	
			/*.then(res => res.json())
			.then(json => {
				console.log(json);
				let test1data = new URLSearchParams();
				test1data.append('QuestionId', json[0].QuestionId);
				test1data.append('TestCaseInput', questionData.target[3].value);
				test1data.append('TestCaseInputType', questionData.target[4].value);
				test1data.append('TestCaseOutput', questionData.target[5].value);
                test1data.append('TestCaseOutputType', questionData.target[6].value);
				fetch('https://cs490backend.peterpinto.dev/insertTestCase', {
            		method: 'POST',
            		credentials: 'include',
           	 		headers: {
                		'Accept':'application/json',
                		'content-type':'application/x-www-form-urlencoded'
            		},
                		body:test1data
            	}).then(res => res.json());

				let test2data = new URLSearchParams();
				test2data.append('QuestionId', json[0].QuestionId);
                test2data.append('TestCaseInput', questionData.target[7].value);
                test2data.append('TestCaseInputType', questionData.target[8].value);
                test2data.append('TestCaseOutput', questionData.target[9].value);
                test2data.append('TestCaseOutputType', questionData.target[10].value);
				questionData.target.reset();
                fetch('https://cs490backend.peterpinto.dev/insertTestCase', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept':'application/json',
                        'content-type':'application/x-www-form-urlencoded'
                    },
                        body:test2data
                }).then(res => res.json());
			})
			*/
	}

	showTestCaseInput() {
		let arr = [];
		for(let i=0; i < this.state.inputLength; i++) {
			arr.push(i);
		}
		return ( arr.map((row, index)=> {
			return <div>
				<br/>
				<label>Test Case {index+1} </label>
				<input type='text' placeholder='Input'/> 
				<select name='TestCaseInputType' id='TestCaseInputType'>
    				<option value='S'>String</option>
    				<option value='I'>Integer</option>
    				<option value='F'>Floating Point</option>
				</select>
				<input type='text' placeholder='Output'/>
				<select name='TestCaseOutputType' id='TestCaseOutputType'>
    				<option value='S'>String</option>
    				<option value='I'>Integer</option>
    				<option value='F'>Floating Point</option>
				</select>
				</div>
			})
		)

		
	}


	render() {
		if (!this.props.showElement) {
			return <div></div>
		}

		return (
			<div className="CreateQuestion">
				<form onSubmit={this.submitQuestion}>
					<label>Question Text</label>
					<br/>
					<textarea type='text' size='200' id='QuestionText' key='QuestionText' />
					<br/><br/>
					<label>Function Name</label>
					<br/>
					<input type='text' id='FunctionName' key='FunctionName' />
					<br/><br/>
					<label>Difficulty Rating </label>
					<select name='DifficultyRating'>
						<option value='1'>Easy</option>
						<option value='2'>Medium</option>
						<option value='3'>Hard</option>
					</select>
					<label>Category</label>
					<select name="Category">
						<option value="For Loops">For Loops</option>
						<option value="While Loops">While Loops</option>
						<option value="Basic Math">Basic Math</option>
						<option value="Recursion">Recursion</option>
						<option value="Conditionals">Conditionals</option>
						<option value="Advanced Math">Advanced Math</option>
					</select>
					<label>Constraint Type</label>
					<select name="ConstraintType">
						<option value="None">None</option>
						<option value="For">For</option>
						<option value="While">While</option>
						<option value="Recursion">Recursion</option>
					</select>
					{ this.showTestCaseInput() }
					<br/>
					<input type= 'submit' name = 'Submit2' id = 'Submit2' value = 'Add Question' />
				</form>
					<button onClick={this.updateButton}> Add Test Case</button>
			</div>
		);
	}
}




export default CreateQuestion
