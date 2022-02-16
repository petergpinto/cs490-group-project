/* Session Helper functions */
module.exports = async function () {

async function isUserLoggedIn(session, pool) {
	if(!session.loggedin) return false;
	let checkToken = await checkSessionToken(session.UserData.UserId, session.UserData.SessionToken.Token, pool);
	if(checkToken.Result != "Success") {
		return false;
	} else {
		return true;
	}
}

function checkUserRole(session, role) {

}


/* Database functions */

async function getSessionToken(UserId, pool) {
	replaceTokenPromise = () => {
		return new Promise((resolve, reject)=>{
			pool.query("REPLACE INTO SessionToken (UserId, Token, InvalidAfter) SELECT ?, SHA2(RAND(), 256), DATE_ADD(NOW(), INTERVAL 15 MINUTE)", [UserId],
				(error, elements) => {
					if(error) return reject(error);
					return resolve(elements);
				});
		});
	}
	await replaceTokenPromise();
	
	/*
	connection.query("REPLACE INTO SessionToken (UserId, Token, InvalidAfter) SELECT ?, SHA2(RAND(), 256), DATE_ADD(NOW(), INTERVAL 15 MINUTE)", [UserId], 
		function(error, result, fields) {
			if (error) throw error;
		});
	*/

	return new Promise((resolve, reject)=>{
		pool.query("SELECT Token, InvalidAfter FROM SessionToken WHERE UserId=? and InvalidAfter > NOW()", [UserId], 
			async (error, elements) => {
				if(error) {
					return reject(error);
				}
				return resolve(elements[0]);
			});
		});
}

async function checkSessionToken(UserId, SessionToken, pool) {
	return new Promise((resolve, reject)=>{
		pool.query("SELECT UserId, Token, InvalidAfter FROM SessionToken WHERE UserId=? and Token=? and InvalidAfter > NOW()", [UserId, SessionToken],
			async (error, elements) => {
				if(error) return reject(error);
				if(elements.length == 0) return resolve({"Result":"Error"});
				await refreshSessionToken(UserId);
				return resolve({"Result":"Success", SessionToken:elements[0]});
			});
	});
}

async function refreshSessionToken(UserId, pool) {
	return new Promise((resolve, reject)=>{
		pool.query("UPDATE SessionToken SET InvalidAfter=DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE UserId=?", [UserId],
			async (error, elements) => {
				if(error) return reject(error);
				return resolve("Success");
			});
	});
}

}
