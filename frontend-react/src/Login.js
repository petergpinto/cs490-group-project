import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import InvalidLogin from './InvalidLogin';
import './Login.css';

async function loginUser(credentials) {
	
	var data = new URLSearchParams();
    data.append('username', credentials.username);
    data.append('password', credentials.password);

 	return fetch('https://cs490backend.peterpinto.dev/login', {
   		method: 'POST',
		credentials: 'include',
   		headers: {
			 'Accept':'application/json',
			 'content-type': 'application/x-www-form-urlencoded'
   		},
   			body: data
 		}).then(data => data.json())
}

export default function Login({ setToken }) {

	const [username, setUserName] = useState();
	const [password, setPassword] = useState();
	const [invalid, setInvalid] = useState(false);
	
	const handleSubmit = async e => {
    	e.preventDefault();
    	const token = await loginUser({
      		username,
      		password
    	});
		if(token.Result == 'Success') {
			localStorage.setItem('token', JSON.stringify(token));
    		setToken(token);
		} else {
			//Invalid username or password
			localStorage.removeItem('token');
			setInvalid(true);
		}
  	}

	return ( 
		<div className="login">
               	{ invalid? <InvalidLogin /> : null }
				<form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label>Username</label>
                        <input type='text' name='username' id='username' onChange={e => setUserName(e.target.value)} required />
                    </div>
                    <div className="input-container">
                        <label>Password</label>
                        <input type='password' name='password' id='password' onChange={e => setPassword(e.target.value)}  required />
                    </div>
                    <br/><br/>
                    <div className="button-container">
                        <input type="submit" />
                    </div>
                </form>
        </div>
	);
}	

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};
