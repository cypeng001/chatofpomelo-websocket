var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next stemp callback
 *
 */
handler.queryEntry = function(msg, session, next) {
	console.log("gateHandler_handler.queryEntry1 msg:", msg);
	var uid = msg.uid;
	if(!uid) {
		next(null, {
			code: 500
		});
		return;
	}

	console.log("gateHandler_handler.queryEntry2_1 pre this.app.getServersByType('connector')");
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	console.log("gateHandler_handler.queryEntry2_2 post this.app.getServersByType('connector')", connectors);
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500
		});
		return;
	}

	console.log("gateHandler_handler.queryEntry3_1 pre dispatcher.dispatch(uid, connectors)");
	// select connector
	var res = dispatcher.dispatch(uid, connectors);
	console.log("gateHandler_handler.queryEntry3_2 post dispatcher.dispatch(uid, connectors)", res);
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};
