module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	console.log("entryHandler_handler.enter1 msg:", msg, session);
	var self = this;
	var rid = msg.rid;
	var uid = msg.username + '*' + rid

	var sessionService = self.app.get('sessionService');
	var tmp = sessionService.getByUid(uid);
	console.log("entryHandler_handler.enter2 essionService.getByUid(uid)", tmp);

	//duplicate log in
	if( !! tmp) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onUserLeave.bind(null, self.app));

	var serverId = self.app.get('serverId');

	console.log("entryHandler_handler.enter3_1 pre self.app.rpc.chat.chatRemote.add", uid, serverId, rid, true); 
	//put user into channel
	self.app.rpc.chat.chatRemote.add(session, uid, serverId, rid, true, function(users){
		console.log("entryHandler_handler.enter self.app.rpc.chat.chatRemote.add callback users:", users); 
		next(null, {
			users:users
		});
	});
	console.log("entryHandler_handler.enter3_2 post self.app.rpc.chat.chatRemote.add"); 
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	console.log("entryHandler_onUserLeave1", session);
	if(!session || !session.uid) {
		return;
	}

	console.log("entryHandler_onUserLeave2_1 pre app.rpc.chat.chatRemote.kick", 
		session.uid, app.get('serverId'), session.get('rid'))
	app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
	console.log("entryHandler_onUserLeave2_2 post app.rpc.chat.chatRemote.kick"); 
};