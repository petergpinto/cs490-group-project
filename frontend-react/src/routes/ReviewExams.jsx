import React, { Component, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ReviewExams.css';


class ReviewExams extends Component {

    constructor(props) {
        super(props);

        this.refreshExams = this.refreshExams.bind(this);
        this.selectExam = this.selectExam.bind(this);
        this.showExamButtons = this.showExamButtons.bind(this);
        this.refreshStudents = this.refreshStudents.bind(this);
        this.refreshStudentResponses = this.refreshStudentResponses.bind(this);
        this.showTestCases = this.showTestCases.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.refreshFunctionNameScores = this.refreshFunctionNameScores.bind(this);
        this.refreshConstraintScores = this.refreshConstraintScores.bind(this);
        this.showExamTotalPoints = this.showExamTotalPoints.bind(this);
        this.overrideScore = this.overrideScore.bind(this);
        this.releaseScores = this.releaseScores.bind(this);
        this.overrideConstraintScore = this.overrideConstraintScore.bind(this);

        this.state = { exams: [], students: [], responses: [], selectedExam: -1, selectedUser: -1, points: 0 };
    }

    refreshExams() {
        fetch('https://cs490backend.peterpinto.dev/getAllExams', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({ exams: json })
            });
    }

    refreshStudents(examid) {
        let data = new URLSearchParams();
        data.append("ExamId", examid);
        return fetch('https://cs490backend.peterpinto.dev/getStudentsByExam', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({ students: json });
            });
    }

    refreshStudentResponses(examid) {
        let data = new URLSearchParams();
        data.append("ExamId", examid);

        return fetch('https://cs490backend.peterpinto.dev/getStudentResponsesAndScores', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({ responses: json });
            });

    }

    refreshFunctionNameScores(examid) {
        let data = new URLSearchParams();
        data.append("ExamId", examid);

        return fetch('https://cs490backend.peterpinto.dev/getFunctionNameScores', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({ functions: json });
            });
    }

    refreshConstraintScores(examid) {
        let data = new URLSearchParams();
        data.append("ExamId", examid);

        return fetch('https://cs490backend.peterpinto.dev/getConstraintScores', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({ constraints: json });
            });
    }

    overrideScore(event) {
        event.preventDefault();

        let data = new URLSearchParams();
        data.append("UserId", event.target.getAttribute('userid'));
        data.append("ExamId", event.target.getAttribute('examid'));
        data.append("TestCaseId", event.target.getAttribute('testcaseid'));
        data.append("InstructorOverrideScore", event.target.value);

        return fetch('https://cs490backend.peterpinto.dev/overrideScore', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.refreshStudentResponses(this.state.selectedExam);
            });
    }

    addComment(event) {
        event.preventDefault();
        console.log(event);
        let data = new URLSearchParams();
        data.append("UserId", event.target.getAttribute('userid'));
        data.append("ExamId", event.target.getAttribute('examid'));
        data.append("TestCaseId", event.target.getAttribute('testcaseid'));
        data.append("InstructorComment", event.target.value);

        return fetch('https://cs490backend.peterpinto.dev/addComment', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
            });
    }

    releaseScores(event) {
        let data = new URLSearchParams();
        data.append("ExamId", event.target.value);

        return fetch('https://cs490backend.peterpinto.dev/releaseExamScore', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.setState({ displayCheckmark: true });
                setTimeout(() => {
                    this.setState({ displayCheckmark: false });
                }, 1500);
            });

    }

    selectExam(event) {
        this.setState({ selectedExam: event.target.value });
        this.setState({ selectedUser: -1 });
        this.setState({ points: 0 });
        this.refreshStudents(event.target.value);
        this.refreshStudentResponses(event.target.value);
        this.refreshFunctionNameScores(event.target.value);
        this.refreshConstraintScores(event.target.value);
    }

    showExamButtons() {
        let items = this.state.exams;

        return items.map((row, index) => {
            return <button onClick={this.selectExam} value={row.ExamId} className={this.state.selectedExam == parseInt(row.ExamId) ? "ActiveExam" : "NotActiveExam"} >{row.ExamFriendlyName}</button>
            //return <button name = 'ExamButtons' id = 'ExamButtons' onClick={this.selectExam} value={row.ExamId}>{row.ExamFriendlyName}</button>
        })
    }

    selectUser(event) {
        //Weird
        this.setState({ selectedUser: event.target.value });
    }

    showStudentButtons() {
        let items = this.state.students;
        return items.map((row, index) => {
            return <button onClick={this.selectUser} value={row.UserId} className={this.state.selectedUser == parseInt(row.UserId) ? "ActiveStudent" : "NotActiveStudent"}>{row.Username}</button>
            //return <button name = 'StudentButtons' id = 'StudentButtons' onClick={this.selectUser} value={row.UserId}>{row.Username}</button>
        })
    }

    showResponses() {
        let items = this.state.responses;
        let questionIds = [];

        return items.map((row, index) => {
            if (questionIds.indexOf(row.QuestionId) >= 0 || row.UserId != this.state.selectedUser)
                return null
            questionIds.push(row.QuestionId);
            if (this.state.selectedUser == -1)
                return null
            return <div className="ShowResponses">
                <h2>{row.FunctionName}</h2>
                <h3>{row.QuestionText}</h3>
                <div className="StudentResponse">{row.StudentResponse}</div>
                <br /><div className="TestCaseTable">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Input</th>
                                <th>Expected Output</th>
                                <th>AutoGrader Output</th>
                                <th>Points Possible</th>
                                <th>Points Awarded</th>
                                <th>Override Score</th>
                                <th>Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.showTestCases(row.QuestionId, this.state.selectedUser)}
                            {this.showFunctionName(row.QuestionId, this.state.selectedUser)}
                            {this.showConstraint(row.QuestionId, this.state.selectedUser)}
                            {this.showTotalPoints(row.QuestionId, this.state.selectedUser)}
                        </tbody>
                    </table>
                </div>
            </div>
        })
    }

    showTotalPoints(questionId, userId) {
        let points = 0;
        let totalPoints = 0;
        let responses = this.state.responses;

        for (let i in responses) {

            if (responses[i].UserId == userId && responses[i].QuestionId == questionId && (responses[i].InstructorOverrideScore || responses[i].InstructorOverrideScore === 0)) {
                points += responses[i].InstructorOverrideScore;
                totalPoints += responses[i].TestCasePointValue;
            }
            else if (responses[i].UserId == userId && responses[i].QuestionId == questionId && responses[i].AutoGraderScore == 1) {
                points += responses[i].TestCasePointValue;
                totalPoints += responses[i].TestCasePointValue;
            } else if (responses[i].UserId == userId && responses[i].QuestionId == questionId && responses[i].AutoGraderScore == 0) {
                totalPoints += responses[i].TestCasePointValue;
            }
        }
        let items2 = this.state.functions;
        for (let i in items2) {
            if (items2[i].QuestionId == questionId && items2[i].ExamId == this.state.selectedExam && items2[i].UserId == userId && items2[i].CorrectFunctionName == 0) {
                points -= 1;
            }
        }

        let items3 = this.state.constraints;
        for (let i in items3) {
            if (items3[i].QuestionId == questionId && items3[i].ExamId == this.state.selectedExam && items3[i].UserId == userId && items3[i].ConstraintFollowed == 0) {
                if (items3[i].OverrideScore || items3[i].OverrideScore === 0) {
                    points += items3[i].OverrideScore
                } else {
                    points -= 1;
                }
            }
        }
        if (points < 0)
            points = 0;

        return <tr>
            <td>Total Points</td><td style={{ border: 'none', 'background': 'inherit' }}></td>
            <td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td>
            <td>{totalPoints.toFixed(1)}</td><td>{points.toFixed(1)}</td>
        </tr>
    }

    showExamTotalPoints(userId) {
        let points = 0;
        let totalPossible = 0;
        let responses = this.state.responses;
        let small_map = {};

        //console.info(responses);
        if (this.state.selectedExam == -1 || this.state.selectedUser == -1)
            return;

        for (let i in responses) {
            if (responses[i].UserId == userId) {
                if (responses[i].InstructorOverrideScore || responses[i].InstructorOverrideScore === 0) {
                    points += responses[i].InstructorOverrideScore;
                }
                else if (responses[i].AutoGraderScore == 1) {
                    points += responses[i].TestCasePointValue;
                }
                else {
                    if (responses[i].QuestionId in small_map) {
                        small_map[responses[i].QuestionId] += 1
                    }
                    else {
                        small_map[responses[i].QuestionId] = 1
                    }
                }
                totalPossible += responses[i].TestCasePointValue;
            }
        }
        console.info(small_map);
        for (var key in small_map) {
            if (small_map[key] < 2) {
                delete small_map[key];
            }
        }
        let items2 = this.state.functions;
        for (let i in items2) {
            if (items2[i].UserId == userId && items2[i].ExamId == this.state.selectedExam && items2[i].CorrectFunctionName == 0 && !(items2[i].QuestionId in small_map)) {
                points -= 1;
            }
        }

        let items3 = this.state.constraints;
        for (let i in items3) {
            if (items3[i].UserId == userId && items3[i].ExamId == this.state.selectedExam && items3[i].ConstraintFollowed == 0 && !(items3[i].QuestionId in small_map)) {
                if (items3[i].OverrideScore || items3[i].OverrideScore === 0) {
                    points += items3[i].OverrideScore
                } else {
                    points -= 1;
                }
            }
        }
        if (points < 0)
            points = 0;

        return <div className='TestCaseTable'><h3>Final Score</h3><table><tr><td>Total Points</td><td>{points.toFixed(1)}</td></tr><tr><td>Total Possible Points</td><td>{totalPossible.toFixed(1)}</td></tr><tr><td>Percentage Score</td><td>{((points.toFixed(1) / totalPossible.toFixed(1)) * 100).toFixed(2)}</td></tr></table></div>
    }

    showFunctionName(questionId, userId) {
        let items = this.state.functions;
        for (let i in items) {
            if (items[i].UserId == userId && items[i].QuestionId == questionId && items[i].ExamId == this.state.selectedExam) {
                return <tr>
                    <td>Function Name</td><td style={{ border: 'none', 'background': 'inherit' }}></td>
                    <td>{items[i].FunctionName}</td><td>{items[i].ProvidedFunctionName}</td><td>0</td><td>{items[i].CorrectFunctionName == 1 ? 0 : -1}</td>
                    <td style={{ border: 'none', 'background': 'inherit' }}></td><td style={{ border: 'none', 'background': 'inherit' }}></td>
                </tr>
            }
        }
    }

    showConstraint(questionId, userId) {
        let items = this.state.constraints;
        for (let i in items) {
            if (items[i].UserId == userId && items[i].QuestionId == questionId && items[i].ExamId == this.state.selectedExam) {
                return <tr>
                    <td>Constraint Followed</td>
                    <td style={{ border: 'none', 'background': 'inherit' }}></td>
                    <td>{items[i].ConstraintType}</td><td>{items[i].ConstraintFollowed == 1 ? "Followed" : "Not Followed"}</td>
                    <td>0</td>
                    <td>{items[i].ConstraintFollowed == 1 ? (items[i].OverrideScore || items[i].OverrideScore === 0 ? items[i].OverrideScore : 0) : ( items[i].OverrideScore || items[i].OverrideScore === 0 ? items[i].OverrideScore : -1 )}</td>
                    <td><input examid={items[i].ExamId} userid={items[i].UserId} questionid={items[i].QuestionId} type="number" step="0.1" onChange={this.overrideConstraintScore} placeholder={items[i].OverrideScore || items[i].OverrideScore === 0 ? items[i].OverrideScore : null} /></td>
                    <td style={{ border: 'none', 'background': 'inherit' }}></td>
                </tr>
            }
        }
    }

    overrideConstraintScore(event) {
        event.preventDefault();

        let data = new URLSearchParams();
        data.append("UserId", event.target.getAttribute('userid'));
        data.append("ExamId", event.target.getAttribute('examid'));
        data.append("QuestionId", event.target.getAttribute('questionid'));
        data.append("OverrideScore", event.target.value);

        return fetch('https://cs490backend.peterpinto.dev/overrideConstraintScore', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }, body: data
        }).then(res => res.json())
            .then(json => {
                if (json.Result && json.Result != 'Success')
                    this.props.navigate('/login');
                this.refreshConstraintScores(this.state.selectedExam);
            });
    }

    showTestCases(questionId, userId) {
        let items = this.state.responses;
        let i = 1;
        return items.map((row, index) => {
            if (row.QuestionId != questionId || row.UserId != userId)
                return null
            return <tr>
                <td>Test Case {i++}: {row.AutoGraderScore == 1 ? 'Passed' : 'Failed'}</td>
                <td>{row.TestCaseInput}</td>
                <td>{row.TestCaseOutput}</td>
                <td>{row.AutoGraderOutput}</td>
                <td>{row.TestCasePointValue}</td>
                <td>{row.AutoGraderScore == 1 ? row.TestCasePointValue : 0}</td>
                <td><input placeholder={row.InstructorOverrideScore || row.InstructorOverrideScore === 0 ? row.InstructorOverrideScore : null} examid={row.ExamId} userid={row.UserId} testcaseid={row.TestCaseId} onChange={this.overrideScore} type='number' step="0.1" /></td>
                <td><input value={row.InstructorComment ? row.InstructorComment : null} examid={row.ExamId} userid={row.UserId} testcaseid={row.TestCaseId} onChange={this.addComment} type='text' /></td></tr>
        });
    }

    componentDidMount() {
        this.refreshExams();
        this.interval = setInterval(this.refreshExams, 3000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    render() {
        if (!this.props.showElement) {
            return <div></div>
        }
        return (
            <div className='ReviewExams'>
                <h2>Review Student Exam Responses</h2>
                <div className="ReviewExamButtons">{this.showExamButtons()}</div>
                <br />
                {this.state.selectedExam !== -1 ? <h4 style={{ "text-align": "center" }}>Click here to release the currently selected exam's score to students</h4> : null}
                {this.state.selectedExam !== -1 ? <button name='release' id='release' onClick={this.releaseScores} value={this.state.selectedExam}>Release Score</button> : null}
                {this.state.displayCheckmark ? <Icon /> : null}
                <br /><br />
                {this.state.selectedExam !== -1 ? <h4 style={{ "text-align": "center" }}>Click on the buttons below to select a student's exam for review</h4> : null}
                <div className="ReviewExamStudentButtons">{this.showStudentButtons()}</div>
                <br />
                <div className="display-linebreak">
                    {this.showResponses()}
                    <br />
                    {this.showExamTotalPoints(this.state.selectedUser)}
                </div>
                <br />
            </div>
        )
    }
}

function WithNavigate(props) {
    let navigate = useNavigate();
    return <ReviewExams {...props} navigate={navigate} />
}
export default WithNavigate


function Icon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 755 607">
            <path
                fill="#21b04b"
                d="M225.38 585.25L198.611 550l-43.89-50.323-50.221-40.088-56.75-35.996L23 410.596l15.5-74.595L54 258.836l1.51-2.835 20.25 9.423 18.74 9.424 58.221 58.653 13.215 21.25L179.871 376l97.457-102 121.17-114.48 89-69.957 114.97-79.37 57.071 71.308 64.611 81.838 8.814 12-62.25 36.093-62.22 34.93-65.5 45.958-164.23 127.86-44.732 40.325-37.601 42.5-52.767 63.226-16.175 20.75z"
            ></path>
        </svg>
    );
}