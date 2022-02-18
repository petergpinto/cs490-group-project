import React, { Component } from 'react';
import './App.css';

class InvalidLogin extends React.Component{

  constructor(){
      super();
  }

  render(){
    return (
      <div className="InvalidLogin">
        <header className="InvalidLogin">
         	<h3>Invalid Username/Password</h3>
        </header>
      </div>
    );
  }
}


export default InvalidLogin
