/*
** Auth middleware
*/
exports.connected = function (req, res, next) {
	req.execute('isConnected', next);
};