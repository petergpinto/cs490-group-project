import sys
import json
import ast
import mysql.connector
if(len(sys.argv) != 2):
	print("FILE NOT PROVIDED")
	exit()

json_file = ""
with open(sys.argv[1]) as file:
	json_file = json.loads(file.read())
# TODO Add RECURSION/WHILE/FOR USECASE
test_results = []
function_results = []
constraint_results = []
for i in range(len(json_file)):
	answer = json_file[i]
	user_id = answer["UserId"]
	exam_id = answer["ExamId"]
	case_id = answer["TestCaseId"]
	q_id = answer["QuestionId"]
	response = answer["StudentResponse"]
	test_case = answer["FunctionName"]
	test_input = answer["TestCaseInput"]
	test_output = answer["TestCaseOutput"]
	constraint = answer["ConstraintType"]
	if(constraint == "Recursion"):
		constraint_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"ConstraintFollowed":0})
	elif(constraint == "While"):
		constraint_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"ConstraintFollowed":0})
	elif(constraint == "For"):
		constraint_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"ConstraintFollowed":0})
	#String Search
	tmp = response.split("\n")[0]
	is_def = tmp.find("def")
	if(is_def != 0):
		test_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"TestCaseId":case_id,"AutoGraderScore":0,"AutoGraderOutput":"Syntax Error"})
		function_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"CorrectFunctionName":0,"ProvidedFunctionName":"NONE"})
		continue;
	is_func = tmp.split("(")[0][4:]
	if(is_func == test_case):
		function_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"CorrectFunctionName":1,"ProvidedFunctionName":is_func})
	elif(len(is_func) == 0):
		function_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"CorrectFunctionName":0,"ProvidedFunctionName":is_func})
		test_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"TestCaseId":case_id,"AutoGraderScore":0,"AutoGraderOutput":"No Function Name"})
		continue	
	else:
		function_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"CorrectFunctionName":0,"ProvidedFunctionName":is_func})
		response = response.replace(is_func,test_case)
	if(answer["TestCaseInputType"] == "S"):
		test_input = str(test_input)
	elif(answer["TestCaseInputType"] == "I"):
		test_input = int(test_input)
	elif(answer["TestCaseInputType"] == "F"):
		test_input = float(test_input)
	elif(answer["TestCaseInputType"] == "L"):
		test_input = ast.literal_eval(test_input)
	if(constraint == "Recursion"):
		constraint_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"ConstraintFollowed":response.count(test_case) > 1})
	elif(constraint == "While"):
		constraint_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"ConstraintFollowed":response.find("while") != -1})
	elif(constraint == "For"):
		constraint_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"ConstraintFollowed":response.find("for") != -1})
	if answer["TestCaseInputType"] == "L" and type(test_input) != type([1,2,3]):
		tobexeced = response + "\noutput=" + test_case + "(" + "*test_input" + ")"
	else:
		tobexeced = response + "\noutput=" + test_case + "(" + "test_input" + ")"
	try:
		exec(tobexeced)
	except:
		test_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"TestCaseId":case_id,"AutoGraderScore":0,"AutoGraderOutput":"Runtime Error"})
		continue
	if(answer["TestCaseOutputType"] == "S"):
		test_output = str(test_output)
		if(type(output) == type("")):
			if(test_output == output):
				test_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"TestCaseId":case_id,"AutoGraderScore":1,"AutoGraderOutput":output})
				continue
	
	elif(answer["TestCaseOutputType"] == "I"):
		test_output = int(test_output)
		if(type(output) == type(3)):
			if(test_output == output):
				test_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"TestCaseId":case_id,"AutoGraderScore":1,"AutoGraderOutput":output})
				continue
	else:
		test_output = float(test_output)
		if(type(output) == type(3.1)):
			if(test_output == output):
				test_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"TestCaseId":case_id,"AutoGraderScore":1,"AutoGraderOutput":output})
				continue
	test_results.append({"UserId":user_id,"ExamId":exam_id,"QuestionId":q_id,"TestCaseId":case_id,"AutoGraderScore":0,"AutoGraderOutput":output})
	


#Input Stuff

db = mysql.connector.connect(
	host="localhost",
	user="cs490AutoGrader",
	password="Prone-Undergo-Eccentric4",
	database="cs490"
)
cursor = db.cursor()
sql = "REPLACE INTO Scores (UserId,ExamId,TestCaseId,AutoGraderScore,AutoGraderOutput) VALUES (%s,%s,%s,%s,%s)"
prepared_tests = []
for item in test_results:
	prepared_tests.append((item["UserId"],item["ExamId"],item["TestCaseId"],item["AutoGraderScore"],item["AutoGraderOutput"]))	
prepared_funcs = []
for item in function_results:
	prepared_funcs.append((item["UserId"],item["ExamId"],item["QuestionId"],item["CorrectFunctionName"],item["ProvidedFunctionName"]))
prepared_constraints = []
for item in constraint_results:
	prepared_constraints.append((item["UserId"],item["ExamId"],item["QuestionId"],item["ConstraintFollowed"]))
print(constraint_results)
try:
	cursor.executemany(sql,prepared_tests)
	db.commit()
	sql = "REPLACE INTO FunctionNameScores (UserId,ExamId,QuestionId,CorrectFunctionName,ProvidedFunctionName) VALUES (%s,%s,%s,%s,%s)"
	cursor.executemany(sql,prepared_funcs)
	db.commit()
	sql = "REPLACE INTO ConstraintScores (UserId,ExamId,QuestionId,ConstraintFollowed) VALUES (%s,%s,%s,%s)"
	cursor.executemany(sql,prepared_constraints)
	db.commit()
except:
	sql = "REPLACE INTO FunctionNameScores (UserId,ExamId,QuestionId,CorrectFunctionName) VALUES (%s,%s,%s,%s)"
	cursor.executemany(sql,prepared_funcs)
	db.commit()	
	sql = "REPLACE INTO ConstraintScores (UserId,ExamId,QuestionId,ConstraintFollowed) VALUES (%s,%s,%s,%s)"
	cursor.executemany(sql,prepared_constraints)
	db.commit()
	
