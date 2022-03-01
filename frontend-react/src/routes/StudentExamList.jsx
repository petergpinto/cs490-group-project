import React, { Component, useState } from "react";
import './StudentExamList.css';

class StudentExamList extends Component {

	constructor(props) {
		super(props);
		this.getHeader = this.getHeader.bind(this);
      	this.getRowsData = this.getRowsData.bind(this);
      	this.getKeys = this.getKeys.bind(this);
	}

	getKeys() {
		return Object.keys(this.props.data[0]);
	}

	getHeader() {
		var keys = this.getKeys();
 		return keys.map((key, index)=>{
			if(key == 'ExamId') {
				return <th key={key}>Exam Id</th>
			} 
			if(key == 'ExamScoresReleased') {
				return (
					<th key={key}>Exam Scores Released</th>
				)
			}
			if(key == 'takeExam') {
				return <th key={key}>Take Exam</th>
			}
			if(key == 'viewScores') {
				return null 
			}
 			return <th key={key}>{key.toUpperCase()}</th>
 		})
	}

	getRowsData() {
		var items = this.props.data;
 		var keys = this.getKeys();
 		return items.map((row, index)=>{
 			return <tr key={index}><RenderRow key={index} data={row} keys={keys} viewScore={this.props.viewScore} takeExam={this.props.takeExam} /></tr>
	 	})
	}


	render() {
		return (
			<div className="StudentExamList">
				<table>
					<thead>
						<tr>{this.getHeader()}</tr>
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
			if(key == 'takeExam') {
				if(props.data['ExamScoresReleased'] == 1)
					return <td key='viewScores'><button value={props.data['ExamId']} onClick={props.viewScore} >View Score</button></td>
				else
					return <td key='takeExam'><button value={props.data['ExamId']} onClick={props.takeExam} >Take Exam Now</button></td>
			}
			if(key == 'ExamScoresReleased') {
				if(props.data[key] == 0) {
					return <td key={props.data[key]}>No</td>
				} else {
					return <td key={props.data[key]}>Yes</td>
				}
			}

			if(key == 'viewScores') {
				return null 
			}
 			return <td key={props.data[key]}>{props.data[key]}</td>
 		})
	}	



export default StudentExamList 
