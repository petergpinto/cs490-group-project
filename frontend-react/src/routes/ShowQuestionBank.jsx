import React, { Component, useState } from "react";
import { useNavigate } from "react-router-dom";
import NumericInput from 'react-numeric-input';
import './ShowQuestionBank.css';

function sortByProperty(property){
	return function(a,b){
	if(a[property] > b[property])
		return 1;
	else if(a[property] < b[property])
		return -1;

        return 0;
	}
}


class ShowQuestionBank extends Component {

	constructor(props) {
		super(props);
		this.defaultPointValue = 1;
		this.getQuestionData = this.getQuestionData.bind(this);
		this.getExamButtons = this.getExamButtons.bind(this);
		this.pointValueChange = this.pointValueChange.bind(this);
		this.refreshExamList = this.refreshExamList.bind(this);
		this.selectExam = this.selectExam.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.createNewExam = this.createNewExam.bind(this);
		this.getExamQuestions = this.getExamQuestions.bind(this);
		this.getPointValues = this.getPointValues.bind(this);
		this.updateCategoryFilter = this.updateCategoryFilter.bind(this);
		this.updateDifficultyFilter = this.updateDifficultyFilter.bind(this);
		this.updateConstraintFilter = this.updateConstraintFilter.bind(this);
		this.updateKeywordFilter = this.updateKeywordFilter.bind(this);
		this.getRowsData = this.getRowsData.bind(this);

		this.state = {
			data: [{ '': '' }],
			QuestionPointValues: [],
			examQuestions: [{ '': '' }],
			pointValue: {},
			checked: {},
			selectedExam: -1,
			examResult: "",
			categoryFilter: "",
			constraintFilter: "",
			difficultyFilter: 0,
			keywordFilter: ""
		};
	}

	getQuestionData() {
		return fetch('https://cs490backend.peterpinto.dev/getAllQuestions', {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Accept':'application/json',
			}
			}).then(res => res.json())
			.then(json => {
				if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
				this.setState({data:json})
				});
	}

	createNewExam(event) {
		event.preventDefault();
		
		let data = new URLSearchParams();
		data.append('ExamFriendlyName', event.target[0].value);
		event.target.reset();
	
		return fetch('https://cs490backend.peterpinto.dev/createNewExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
            }, body:data
            }).then(res => res.json())
            .then(json => {
				if(json.Result && json.Result != 'Success')
					this.props.navigate('/login');
                this.setState({examResult:json})
				this.setState({ selectedExam: json.ExamId });
				this.setState({ pointValue: {} });
				this.setState({ QuestionPointValues: []})
				this.refreshExamList();
				this.getExamQuestions();
            });

	}

	getKeys() {
        return Object.keys(this.state.data[0]);
    }

	getHeader() {
        var keys = this.getKeys();
        return keys.map((key, index)=>{
			if(key == 'QuestionId')
				return null
			if(key == 'QuestionText')
				return <th key={key+index}>Question Text</th>
			if(key == 'FunctionName')
				return <th key={key+index}>Function Name</th>
			if(key == 'DifficultyRating')
				return <th key={key + index}>Difficulty</th>
			if (key == 'ConstraintType')
				return <th key={key+index}>Constraint</th>
            return <th key={key+index}>{key}</th>
        })
	}

	getHeaderNoQText() {
		var keys = this.getKeys();
		return keys.map((key, index) => {
			if (key == 'QuestionId')
				return null
			if (key == 'QuestionText')
				return null;
			if (key == 'FunctionName')
				return <th key={key + index}>Function Name</th>
			if (key == 'DifficultyRating')
				return <th key={key + index}>Difficulty</th>
			if (key == 'ConstraintType')
				return <th key={key + index}>Constraint</th>
			return <th key={key + index}>{key}</th>
		})
    }

	getRowsData() {
        var items = this.state.data;
		var keys = this.getKeys();

		let categoryFilter = this.state.categoryFilter;
		let constraintFilter = this.state.constraintFilter;
		let difficultyFilter = this.state.difficultyFilter;
		let keywordFilter = this.state.keywordFilter;

		items = items.filter(function (el) {
			if (el.Category) {
				return el.Category.includes(categoryFilter);
			} else
				return true;
		});

		items = items.filter(function (el) {
			if (el.ConstraintType) {
				return el.ConstraintType.includes(constraintFilter);
			} else
				return true;
		});

		
		items = items.filter(function (el) {
			if (el.DifficultyRating && difficultyFilter !== 0) {
				return el.DifficultyRating === difficultyFilter;
			} else
				return true;
		});

		items = items.filter(function (el) {
			if (el.QuestionText && el.FunctionName) {
				return el.QuestionText.toLowerCase().includes(keywordFilter.toLowerCase()) || el.FunctionName.toLowerCase().includes(keywordFilter.toLowerCase());
			} else
				return true;
		});

		if(this.props.buildForm) {
			return items.map((row, index) => {
				let whiteBackground = { 'background': 'white' };
				let coloredBackground = { 'background': 'lightgreen' };
				let activeBackground = whiteBackground;
				let html = <PlusButton style={{ 'width': '50px', 'height': 'auto', 'pointer-events': 'none' }} />
				for (let i = 0; i < this.state.examQuestions.length; i++) {
					if (this.state.examQuestions[i].QuestionId == row.QuestionId) {
						html = <Checkmark style={{ 'width': '50px', 'height': 'auto' }} />
						activeBackground = coloredBackground;
                    }
                }
				
            	return <tr key={index}>
					<td style={activeBackground}><button style={{ 'background': 'none', 'border': 'none' }} className="append" questionid={row.QuestionId} onClick={this.handleChange}>{html}</button></td>
					<RenderRow key={index} data={row} keys={keys} backgroundStyle={activeBackground} showquestiontext/>
					</tr>
        	})
		}
        return items.map((row, index)=>{
			return <tr key={index}><RenderRow key={index} data={row} keys={keys} showquestiontext/></tr>
        })
    }

	pointValueChange(valueAsNumber, valueAsString, input) {
		this.setState(prevState => ({
			pointValue: { 
				...prevState.pointValue,
				[input.getAttribute('data-key')] : valueAsNumber
			} 
		}));
		let data = new URLSearchParams();
		data.append("PointValue", valueAsNumber);
		data.append("QuestionId", input.getAttribute('questionid'));
		data.append("ExamId", this.state.selectedExam);

		return fetch('https://cs490backend.peterpinto.dev/updatePointValue', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
                body:data
            }).then(res => res.json());
        
	}

	handleChange(event) {
		this.setState({loading:true})
		let questionid = event.target.getAttribute('questionid');


		let questionData

		for (let i = 0; i < this.state.data.length; i++) {
			if (questionid == this.state.data[i].QuestionId) {
				questionData = this.state.data[i];
				break;
			}
        }
		let pointValue = this.defaultPointValue;
		//Add question to exam
	
		var data = new URLSearchParams();
    	data.append('ExamId', this.state.selectedExam);
		data.append('PointValue', pointValue);
	
		if(event.target.className==="append") {
		data.append('QuestionId',questionData.QuestionId);
		return fetch('https://cs490backend.peterpinto.dev/addQuestionToExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
				'content-type': 'application/x-www-form-urlencoded'
            },
				body:data
		}).then(res => {
			this.getExamQuestions();
			this.getPointValues();
			this.getQuestionData();
			this.setState({ loading: false })
			return res.json();
		});
		} 
		if(event.target.className==="delete"){
			data.append('QuestionId',event.target.getAttribute('questionid'));
			return fetch('https://cs490backend.peterpinto.dev/removeQuestionFromExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
                body:data
			}).then(res => {
				this.getExamQuestions();
				this.getPointValues();
				this.getQuestionData();
				this.setState({ loading: false })
				return res.json();
			});
		}
	}

	updateCategoryFilter(event) {
		this.setState({ categoryFilter:event.target.value })
	}

	updateConstraintFilter(event) {
		this.setState({ constraintFilter: event.target.value })
	}

	updateKeywordFilter(event) {
		this.setState({ keywordFilter: event.target.value })
	}

	updateDifficultyFilter(event) {
		this.setState({ difficultyFilter: parseInt(event.target.value) })
    }

	async selectExam(event) {
		await this.setState({selectedExam:event.target.getAttribute('examid')});
		this.setState({ pointValue: {} });
		this.setState({ QuestionPointValues: [] })
		this.getPointValues();
		this.getExamQuestions();
	}

	refreshExamList() {
		return fetch('https://cs490backend.peterpinto.dev/getAllExams', {
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

	getExamButtons() {

		function sortByProperty(property){  
   			return function(a,b){  
      			if(a[property] > b[property])  
         			return 1;  
      			else if(a[property] < b[property])  
         			return -1;  
  
      			return 0;  
   			}  
		}

		let items = this.state.exams;
		items.sort(sortByProperty("ExamFriendlyName"));	
		return (
			items.map((row, index) => {
				return <button className={this.state.selectedExam==row.ExamId? 'ExamButtonActive':'ExamButtonNonActive'} examid={row.ExamId} onClick={this.selectExam}>{row.ExamFriendlyName}</button>
			})
		);
	}

	getExamQuestions() {
		if(this.state.selectedExam == -1)
			return;
		let d = new URLSearchParams();
		d.append("ExamId", this.state.selectedExam);
     	return fetch('https://cs490backend.peterpinto.dev/getAllQuestionsOnExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
				'content-type': 'application/x-www-form-urlencoded'
            }, body:d
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
				this.setState({examQuestions:json})
            });


	}

	getPointValues() {
		
		let data = new URLSearchParams();
		data.append("ExamId", this.state.selectedExam);

		return fetch('https://cs490backend.peterpinto.dev/getPointValues', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            }, body:data
            }).then(res => res.json())
            .then(json => {
                if(json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                	this.setState({QuestionPointValues:json})
            });
	}

	renderExamQuestions() {
		let items = this.state.examQuestions;
		let keys = this.getKeys(items);
		return (  items.map((row, index) => {
					return (<tr>
						<td><button style={{ 'background': 'none', 'border': 'none' }} className="delete" index={index} questionid={row.QuestionId} onClick={this.handleChange}><MinusButton style={{ 'width': '20px', 'height': 'auto', 'pointer-events': 'none'}} /></button></td>
								<td><NumericInput questionid={row.QuestionId} data-key={'PointValue'+index} key={'PointValue'+index} min={0} value={this.state.pointValue['PointValue'+index]? this.state.pointValue['PointValue'+index] : this.state.QuestionPointValues[index] ? this.state.QuestionPointValues[index]["PointValue"]: 1} onChange={this.pointValueChange} size={5}/></td>
								<RenderRow key={index} data={row} keys={keys}/>
							</tr>
					)}
				)
		)
	}

	componentDidMount() {
		this.getQuestionData();
		this.refreshExamList();
		this.getExamQuestions();
		this.setState({ loading: false });
		this.interval = setInterval(this.getQuestionData, 5000);
		//this.interval2 = setInterval(this.refreshExamList, 3000);
		//this.interval3 = setInterval(this.getExamQuestions, 1000);
	}

	componentDidUpdate() {
	}

	componentWillUnmount() {
		clearInterval(this.interval);
		//clearInterval(this.interval2);
		//clearInterval(this.interval3);
	}

	render() {
		if (!this.props.showElement) {
			return <div></div>
		}

		return (
			<div className={this.props.buildForm ? "ShowQuestionBankForm" : "ShowQuestionBankList"} >
				{ !this.props.buildForm? null :
					<div className='leftSplitScreen'>
						<div className='ExamSelector'>
							<br /><br />
							<form onSubmit={this.createNewExam}>
								<input type='text' name='etext' id='etext' placeholder="Exam Name" />
								<button type='submit' name='Submit' id='Submit'>Create New Exam</button>
							</form>
							<h3>Select an Exam</h3>
							{this.getExamButtons()}
							<br/><br/>
						</div>
						<table>
						<thead><th></th><th>Point Value</th> {this.getHeaderNoQText()} </thead>
						<tbody>
						{ this.props.buildForm && this.state.selectedExam != -1? this.renderExamQuestions() : null }	
						</tbody>
						</table>
					</div>
				}
				<div className={this.props.buildForm? "rightSplitScreen" : "ShowQuestionBankList"}>
					<h2>Question Bank</h2>
					<div className="filteringOptions">
						<label>Category</label>
						<br/>
						<select onChange={this.updateCategoryFilter} name="categoryFilter">
							<option value="">All</option>
							<option value="For Loops">For Loops</option>
							<option value="While Loops">While Loops</option>
							<option value="Basic Math">Basic Math</option>
							<option value="Recursion">Recursion</option>
							<option value="Conditionals">Conditionals</option>
							<option value="Strings">Strings</option>
							<option value="Advanced Math">Advanced Math</option>
						</select>
						<label>Constraint</label>
						<br/><br/>
						<select onChange={this.updateConstraintFilter} name="constraintFilter">
							<option value="">All</option>
							<option value="None">None</option>
							<option value="For">For</option>
							<option value="While">While</option>
							<option value="Recursion">Recursion</option>
						</select>
						<label>Difficulty</label>
						<br/>
						<select onChange={this.updateDifficultyFilter} name="difficultyFilter">
							<option value='0'>All</option>
							<option value='1'>Easy</option>
							<option value='2'>Medium</option>
							<option value='3'>Hard</option>
						</select>
						<label>Keyword</label><input type="text" onChange={this.updateKeywordFilter} />
					</div>
					<table>
                    	<thead>
                    	    <tr>{this.props.buildForm? <th>Add</th>:null}{this.getHeader()}</tr>
                    	</thead>
						
                    	<tbody>
                        	{this.getRowsData()}
						</tbody> 
               		</table>
				</div>
			</div>

		);
	}
}


const RenderRow = (props) => {		
        return props.keys.map((key, index)=>{
           if(key == 'QuestionId')
		   		return null
		   if(key == 'DifficultyRating') {
			   if (props.data[key] == 1)
				   return <td style={props.backgroundStyle} key = { index+ key + props.data[key]}>Easy</td>
				if(props.data[key] == 2)
					return <td style={props.backgroundStyle} key={index+key+props.data[key]}>Medium</td>
				if(props.data[key] == 3)
					return <td style={props.backgroundStyle} key={index+key+props.data[key]}>Hard</td>
		   }
			if (key == 'QuestionText')
				if (props.showquestiontext)
					return <td style={props.backgroundStyle} key={index + key + props.data[key]}>{props.data[key]}</td>
				else
					return null
				//return <td key={index+key+props.data[key]} title={props.data[key]}>(Hover to reveal)</td>
			return <td style={props.backgroundStyle} key={index+key+props.data[key]}>{props.data[key]}</td>
        })
    }




function WithNavigate(props) {
    let navigate = useNavigate();
    return <ShowQuestionBank {...props} navigate={navigate} />
}
export default WithNavigate


const PlusButton = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 317.752 317.752"
		style={{
			enableBackground: "new 0 0 317.752 317.752",
		}}
		xmlSpace="preserve"
		{...props}
	>
		<path d="M178.876 138.876V90.287c0-11.046-8.954-20-20-20s-20 8.954-20 20v48.589H90.287c-11.046 0-20 8.954-20 20s8.954 20 20 20h48.589v48.59c0 11.046 8.954 20 20 20s20-8.954 20-20v-48.59h48.59c11.046 0 20-8.954 20-20s-8.954-20-20-20h-48.59z" />
		<path d="M286.527 0H31.225C18.685 0 8.519 10.166 8.519 22.707v272.339c0 12.54 10.166 22.707 22.707 22.707h255.301c12.54 0 22.707-10.166 22.707-22.707V22.707C309.233 10.166 299.067 0 286.527 0zM158.876 274.646c-63.985 0-115.77-51.778-115.77-115.77 0-63.985 51.778-115.77 115.77-115.77 63.986 0 115.77 51.779 115.77 115.77 0 63.986-51.779 115.77-115.77 115.77z" />
	</svg>
)

const MinusButton = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 311.539 311.539"
		style={{
			enableBackground: "new 0 0 311.539 311.539",
		}}
		xmlSpace="preserve"
		{...props}
	>
		<path d="M214.603 135.77H96.937c-11.046 0-20 8.954-20 20s8.954 20 20 20h117.666c11.046 0 20-8.954 20-20s-8.954-20-20-20z" />
		<path d="M155.77 0C69.74 0 0 69.74 0 155.77s69.74 155.77 155.77 155.77 155.77-69.74 155.77-155.77S241.799 0 155.77 0zm0 271.539C91.784 271.539 40 219.761 40 155.77 40 91.784 91.778 40 155.77 40c63.986 0 115.77 51.778 115.77 115.77-.001 63.985-51.779 115.769-115.77 115.769z" />
	</svg>
)

function Checkmark() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 755 607">
			<path
				fill="#21b04b"
				d="M225.38 585.25L198.611 550l-43.89-50.323-50.221-40.088-56.75-35.996L23 410.596l15.5-74.595L54 258.836l1.51-2.835 20.25 9.423 18.74 9.424 58.221 58.653 13.215 21.25L179.871 376l97.457-102 121.17-114.48 89-69.957 114.97-79.37 57.071 71.308 64.611 81.838 8.814 12-62.25 36.093-62.22 34.93-65.5 45.958-164.23 127.86-44.732 40.325-37.601 42.5-52.767 63.226-16.175 20.75z"
			></path>
		</svg>
	);
}