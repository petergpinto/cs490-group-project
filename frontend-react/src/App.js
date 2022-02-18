import React, { Component, useState, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import Login from './Login';


class App extends Component {
	
	constructor(props) {
		super(props);
	}

  render() {

	if(this.props.token) {
		if(this.props.token.UserData.AccountType == 'S') {
			this.props.navigate('/StudentLanding', { state: this.props.token } );
		} else {
			this.props.navigate('/TeacherLanding');
		}
		return <p>Test</p>;	
	} else {
	
    return (
		<div className="App">
			<Link to="/TeacherLanding">Teacher</Link> |{" "}
        	<Link to="/StudentLanding">Student</Link>
      		<Login  setToken={this.props.setToken} />
		</div>
    );

	}
  }
}

function WithNavigate(props) {
    let navigate = useNavigate();
    const [token, setToken] = useState();
	return <App {...props} navigate={navigate} token={token} setToken={setToken} />
}

export default WithNavigate;
