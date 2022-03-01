import React, { Component, useState } from "react";
import NumericInput from 'react-numeric-input';
//import './ShowQuestionBank.css';

class ShowQuestionBank extends Component {

	constructor(props) {
		super(props);
		this.defaultPointValue = 1;
		this.getQuestionData = this.getQuestionData.bind(this);
		this.pointValueChange = this.pointValueChange.bind(this);
		this.getExamButtons = this.getExamButtons.bind(this);
		this.refreshExamList = this.refreshExamList.bind(this);
		this.selectExam = this.selectExam.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.state = {data: [{'':''}], pointValue:{}, checked:{}, selectedExam:12};
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
				this.setState({data:json})
				});
	}

	getKeys() {
        return Object.keys(this.state.data[0]);
    }

	getHeader() {
        var keys = this.getKeys();
        return keys.map((key, index)=>{
            return <th key={key+index}>{key}</th>
        })
    }

	getRowsData() {
        var items = this.state.data;
        var keys = this.getKeys();
		if(this.props.buildForm) {
			return items.map((row, index)=>{
            	return <tr key={index}>
					<input type='checkbox' index={index} onChange={this.handleChange} value={this.state.checked[index]} />
					<NumericInput data-key={'PointValue'+index} key={'PointValue'+index} min={0} max={50} value={this.state.pointValue['PointValue'+index]? this.state.pointValue['PointValue'+index] : this.defaultPointValue} onChange={this.pointValueChange} mobile />
					<RenderRow key={index} data={row} keys={keys}/>
					</tr>
        	})
		}
        return items.map((row, index)=>{
            return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
        })
    }

	pointValueChange(valueAsNumber, valueAsString, input) {
		this.setState(prevState => ({
			pointValue: { 
				...prevState.pointValue,
				[input.getAttribute('data-key')] : valueAsNumber
			} 
		}));
	}

	handleChange(event) {
		let index = event.target.getAttribute('index');
		this.setState(prevState => ({
			checked: {
				...prevState.checked,
				[index]:!prevState.checked[index]
			}
		}));

		let questionData = this.state.data[index];
		let pointValue = this.state.pointValue['PointValue'+index]? this.state.pointValue['PointValue'+index] : this.defaultPointValue
		//Add question to exam
	
		var data = new URLSearchParams();
    	data.append('QuestionId', questionData.QuestionId);
    	data.append('ExamId', this.state.selectedExam);
		data.append('PointValue', pointValue);
	
		if(!this.state.checked[index]) {
		return fetch('https://cs490backend.peterpinto.dev/addQuestionToExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
				'content-type': 'application/x-www-form-urlencoded'
            },
				body:data
            }).then(res => res.json());
		} else {
			return fetch('https://cs490backend.peterpinto.dev/removeQuestionFromExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept':'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
                body:data
            }).then(res => res.json());
		}
	}

	selectExam(event) {
		this.setState({selectedExam:event.target.getAttribute('examid')});
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
                this.setState({exams:json})
        	});
	}

	getExamButtons() {
		let items = this.state.exams;
		return (
			items.map((row, index) => {
				return <button examid={row.ExamId} onClick={this.selectExam}>{row.ExamId}</button>
			})
		);
	}

	componentDidMount() {
		this.getQuestionData();
		this.refreshExamList();
		this.interval = setInterval(this.getQuestionData, 3000);
		this.interval2 = setInterval(this.refreshExamList, 3000);
	}

	componentDidUpdate() {
	
	}

	componentWillUnmount() {
		clearInterval(this.interval);
		clearInterval(this.interval2);
	}

	render() {
		if (!this.props.showElement) {
			return <div></div>
		}

		return (
			<div className="ShowQuestionBank">
				{ !this.props.buildForm? null : 
				 	<div className='ExamSelector'><h3>Select an Exam</h3>{this.getExamButtons()}<br/><br/></div> 
				}
				<table>
                    <thead>
                        <tr>{this.props.buildForm? <th>Point Value</th>:null}{this.getHeader()}</tr>
                    </thead>
                    <tbody>
                        {this.getRowsData()}
                    </tbody>
                </table>
			</div>
		);
	}
}


const RenderRow = (props) =>{
        return props.keys.map((key, index)=>{
            return <td key={index+key+props.data[key]}>{props.data[key]}</td>
        })
    }

export default ShowQuestionBank
