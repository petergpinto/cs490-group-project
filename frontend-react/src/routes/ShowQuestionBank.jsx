import React, { Component, useState } from "react";

class ShowQuestionBank extends Component {

	constructor(props) {
		super(props);
		this.getQuestionData = this.getQuestionData.bind(this);
		this.state = {data: [{'':''}]};
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
				console.log(json)
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
        return items.map((row, index)=>{
            return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
        })
    }

	componentDidMount() {
		this.getQuestionData();
		this.interval = setInterval(this.getQuestionData, 3000);
	}

	componentDidUpdate() {
	
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		if (!this.props.showElement) {
			return <div></div>
		}

		return (
			<div className="ShowQuestionBank">
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
            return <td key={props.data[key]}>{props.data[key]}</td>
        })
    }

export default ShowQuestionBank
