import React from 'react';
import ReactDOM from 'react-dom';
import { render } from "react-dom";
import { BrowserRouter, Routes, Route, Redirect } from "react-router-dom";
import './index.css';
import App from './App';
import StudentLanding from './routes/StudentLanding';
import TeacherLanding from './routes/TeacherLanding';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
  	<Routes>
    	<Route path="login" element={<App />} />
		<Route path="StudentLanding" element={<StudentLanding />} />
		<Route path="TeacherLanding" element={<TeacherLanding />} />
	</Routes>
  </BrowserRouter>,
  rootElement
);

/*
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
*/

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
