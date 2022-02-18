import React, { Component } from "react";
import { BrowserRouter, Routes, Route, Redirecti, useNavigate, Navigate } from "react-router-dom";

class TeacherLanding extends Component {

	constructor(props) {
		super(props);
	}

	render() {
	
		let token = JSON.parse(localStorage.getItem('token'));
        if(!token || token.UserData.AccountType != 'T') {
            return ( <Navigate to="/login" /> );
        }

  		return (
    		<main style={{ padding: "1rem 0" }}>
      			<h2>Teacher Landing Page</h2>
    		</main>
  		);
  	}
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <TeacherLanding {...props} navigate={navigate} />
}
export default WithNavigate;
