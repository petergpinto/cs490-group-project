import React, { Component, useState } from "react";
import NumericInput from 'react-numeric-input';

class ShowQuestionBank extends Component {

	constructor(props) {
		super(props);
		this.getQuestionData = this.getQuestionData.bind(this);
		this.pointValueChange = this.pointValueChange.bind(this);
		this.getExamButtons = this.getExamButtons.bind(this);
		this.refreshExamList = this.refreshExamList.bind(this);
		this.selectExam = this.selectExam.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.state = {data: [{'':''}], pointValue:{}};
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
					<input type='checkbox' index={index} onChange={this.handleChange} />
					<NumericInput data-key={'PointValue'+index} key={'PointValue'+index} min={0} max={50} value={this.state.pointValue['PointValue'+index]? this.state.pointValue['PointValue'+index] : 1} onChange={this.pointValueChange} mobile />
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

	handleChange() {
		//
		this.setState(prevState => ({
			examQuestions: {
				...prevState.examQuestions
				
			}
		}));

	}

	selectExam(event) {
		this.setState({ExamId:event.target.getAttribute('examid')});
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
