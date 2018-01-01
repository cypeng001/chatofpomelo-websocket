var chatRemote = require('../remote/chatRemote');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {
	console.log("chatHandler_handler.send1", msg);
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
		msg: msg.content,
		from: username,
		target: msg.target
	};
	console.log("chatHandler_handler.send2", param);
	channel = channelService.getChannel(rid, false);

	//the target is all users
	if(msg.target == '*') {
		console.log("chatHandler_handler.send3_1 pre channel.pushMessage");
		channel.pushMessage('onChat', param);
		console.log("chatHandler_handler.send3_2 post channel.pushMessage");
	}
	//the target is specific user
	else {
		var tuid = msg.target + '*' + rid;
		var tsid = channel.getMember(tuid)['sid'];
		console.log("chatHandler_handler.send4_1 pre channelService.pushMessageByUids");
		channelService.pushMessageByUids('onChat', param, [{
			uid: tuid,
			sid: tsid
		}]);
		console.log("chatHandler_handler.send4_2 post channelService.pushMessageByUids");
	}
	next(null, {
		route: msg.route
	});
};