import React, { Component, useState } from "react";
import './CreateQuestion.css';
import { Alert } from "react-alert";
import ShowQuestionBank from './ShowQuestionBank';

class CreateQuestion extends Component {

	constructor(props) {
		super(props);
		this.state = {
			displayCheckmark: false,
			inputLength: 2,
			questionText: "",
			functionName: "",
			difficulty: 0,
			category: "For Loops",
			constraint: "None",
			testCaseData: [{ input: "", inputType: "S", output: "", outputType: "S" }, { input: "", inputType: "S", output: "", outputType: "S" }]
		}
		this.showTestCaseInput = this.showTestCaseInput.bind(this);
		this.updateButton = this.updateButton.bind(this);
		this.submitQuestion = this.submitQuestion.bind(this);
		this.updateQuestionTextState = this.updateQuestionTextState.bind(this);
		this.updateFunctionNameState = this.updateFunctionNameState.bind(this);
		this.updateDifficultyState = this.updateDifficultyState.bind(this);
		this.updateCategoryState = this.updateCategoryState.bind(this);
		this.updateConstraintState = this.updateConstraintState.bind(this);
		this.updateTestCaseInputState = this.updateTestCaseInputState.bind(this);
		this.updateTestCaseInputTypeState = this.updateTestCaseInputTypeState.bind(this);
		this.updateTestCaseOutputState = this.updateTestCaseOutputState.bind(this);
		this.updateTestCaseOutputTypeState = this.updateTestCaseOutputTypeState.bind(this);

	}

	updateButton(){
		this.setState(prevState => ({
				inputLength: prevState.inputLength+1
		}));
	}
	async submitQuestion(questionData) {
		questionData.preventDefault();	
		var data = new URLSearchParams();
		data.append('QuestionText', questionData.target[0].value);
		data.append('FunctionName', questionData.target[1].value);
		data.append('DifficultyRating', questionData.target[2].value);
		data.append('Category', questionData.target[3].value);
		data.append('ConstraintType', questionData.target[4].value);
		
		const response = await fetch('https://cs490backend.peterpinto.dev/insertQuestion', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Accept':'application/json',
				'content-type':'application/x-www-form-urlencoded'
			},
				body:data
		}).then(res => {
			this.setState({ displayCheckmark: true });
			setTimeout(() => {
				this.setState({ displayCheckmark: false });
			}, 1500);
			return res.json()
		});
		console.log(response);
		for(let i = 5; i+4<questionData.target.length;i+=4)
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
		//clear form at end
		questionData.target.reset();
		this.setState({ questionText: "" });
		this.setState({ functionName: "" });
		this.setState({ difficulty: 0 });
		this.setState({ category: "For Loops" });
		this.setState({ constraint: "None" });
		this.setState({ testCaseData: [{ input: "", inputType: "S", output: "", outputType: "S" }, { input: "", inputType: "S", output: "", outputType: "S" }]})
		this.setState({ inputLength: 2 });
	}

	updateQuestionTextState(event) {
		this.setState({ questionText: event.target.value });
	}

	updateFunctionNameState(event) {
		this.setState({ functionName: event.target.value });
	}

	updateDifficultyState(event) {
		this.setState({ difficulty: event.target.value });
	}

	updateCategoryState(event) {
		this.setState({ category: event.target.value });
	}

	updateConstraintState(event) {
		this.setState({ constraint: event.target.value });
    }

	updateTestCaseInputState(event) {

	}

	updateTestCaseInputTypeState(event) {

	}

	updateTestCaseOutputState(event) {

	}

	updateTestCaseOutputTypeState(event) {

    }

	showTestCaseInput() {
		let arr = [];
		for(let i=0; i < this.state.inputLength; i++) {
			arr.push(i);
		}
		return ( arr.map((row, index)=> {
<<<<<<< HEAD
			return <div>
				<br/>
				<label>Test Case {index+1}:</label>
				<br/><br/>
				<input type='text' placeholder='Input'/> 
				<select name='TestCaseInputType' id='TestCaseInputType'>
    				<option value='S'>String</option>
    				<option value='I'>Integer</option>
					<option value='F'>Floating Point</option>
					<option value='L'>List</option>
				</select>
				<br/><br/>
				<input type='text' placeholder='Output'/>
				<select name='TestCaseOutputType' id='TestCaseOutputType'>
    				<option value='S'>String</option>
    				<option value='I'>Integer</option>
					<option value='F'>Floating Point</option>
					<option value='L'>List</option>
				</select>
=======
			return <div className="TestCaseFormPart">
				
				<label>Test Case {index + 1}:</label>
				<div>
					<input type='text' placeholder='Input'/> 
					<select name='TestCaseInputType' id='TestCaseInputType'>
    					<option value='S'>String</option>
    					<option value='I'>Integer</option>
						<option value='F'>Floating Point</option>
						<option value='L'>List</option>
					</select>
				</div>
				<div>
					<input type='text' placeholder='Output'/>
					<select name='TestCaseOutputType' id='TestCaseOutputType'>
    					<option value='S'>String</option>
    					<option value='I'>Integer</option>
						<option value='F'>Floating Point</option>
						<option value='L'>List</option>
					</select>
				</div>
>>>>>>> 6611da3c1183da57b669c4bb9b78af72418ba9fe
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
<<<<<<< HEAD
				<form onSubmit={this.submitQuestion}>
					<br/>
					<label>Question Text</label>
					<br/>
					<textarea type='text' size='1500' id='QuestionText' key='QuestionText' onChange={this.updateQuestionTextState} value={ this.state.questionText }/>
					<br/><br/>
					<label>Function Name</label>
					<br/>
					<input type='text' id='FunctionName' key='FunctionName' onChange={this.updateFunctionNameState} value={this.state.functionName}/>
					<br/><br/>
					<label>Difficulty Rating </label>
					<select name='DifficultyRating' onChange={this.updateDifficultyState} value={this.state.difficulty}>
						<option value='1'>Easy</option>
						<option value='2'>Medium</option>
						<option value='3'>Hard</option>
					</select>
					<br/><br/>
					<label>Category</label>
					<select name="Category" onChange={this.updateCategoryState} value={this.state.category}>
						<option value="For Loops">For Loops</option>
						<option value="While Loops">While Loops</option>
						<option value="Basic Math">Basic Math</option>
						<option value="Recursion">Recursion</option>
						<option value="Conditionals">Conditionals</option>
						<option value="Strings">Strings</option>
						<option value="Advanced Math">Advanced Math</option>
					</select>
					<br/><br/>
					<label>Constraint Type</label>
					<select name="ConstraintType" onChange={this.updateConstraintState} value={this.state.constraint}>
						<option value="None">None</option>
						<option value="For">For</option>
						<option value="While">While</option>
						<option value="Recursion">Recursion</option>
					</select>
					{ this.showTestCaseInput() }
					<br />
					<button onClick={this.updateButton} type="button"> Add Test Case</button>
					<input type= 'submit' name = 'Submit2' id = 'Submit2' value = 'Add Question' />
				</form>
				{this.state.displayCheckmark ? <Icon /> : null}
=======
				<div style={{ 'display': 'flex', 'flex-direction': 'column' }}>
					<div className="CreateQuestionForm">
						<h2>Add a new Question</h2>
						<form onSubmit={this.submitQuestion}>
							<br/>
							<label>Question Text</label>
							<br/>
							<textarea type='text' size='1500' id='QuestionText' key='QuestionText' onChange={this.updateQuestionTextState} value={ this.state.questionText }/>
							<br/><br/>
							<label>Function Name</label>
							<br/>
							<input type='text' id='FunctionName' key='FunctionName' onChange={this.updateFunctionNameState} value={this.state.functionName}/>
							<br/><br/>
							<label>Difficulty Rating </label>
							<select name='DifficultyRating' onChange={this.updateDifficultyState} value={this.state.difficulty}>
								<option value='1'>Easy</option>
								<option value='2'>Medium</option>
								<option value='3'>Hard</option>
							</select>
							<label>Category</label>
							<select name="Category" onChange={this.updateCategoryState} value={this.state.category}>
								<option value="For Loops">For Loops</option>
								<option value="While Loops">While Loops</option>
								<option value="Basic Math">Basic Math</option>
								<option value="Recursion">Recursion</option>
								<option value="Conditionals">Conditionals</option>
								<option value="Strings">Strings</option>
								<option value="Advanced Math">Advanced Math</option>
							</select>
							<label>Constraint Type</label>
							<select name="ConstraintType" onChange={this.updateConstraintState} value={this.state.constraint}>
								<option value="None">None</option>
								<option value="For">For</option>
								<option value="While">While</option>
								<option value="Recursion">Recursion</option>
							</select>
							{ this.showTestCaseInput() }
							<br />
							<button onClick={this.updateButton} type="button"> Add Test Case</button>
							<input type='submit' name='Submit2' id='Submit2' value='Add Question' />
							</form>
						</div>
					{this.state.displayCheckmark ? <Icon /> : null}
				</div>
>>>>>>> 6611da3c1183da57b669c4bb9b78af72418ba9fe
				<ShowQuestionBank showElement={true} />
			</div>
		);
	}
}




export default CreateQuestion

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
