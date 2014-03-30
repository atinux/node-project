// Special API
module.exports = function (req, res, next) {
	req._api = true;
	var originalSend = res.send.bind(res);
	var i = 0;
	var _err,
		_result;
	var send = function (deletePrivatesKeys, err, result) {
		var args = Array.prototype.slice.call(arguments);
		if (typeof args[0] === 'string') // Special express utilisation
			return originalSend(args[0]);
		if (typeof deletePrivatesKeys !== 'boolean') {
			result = err;
			err = deletePrivatesKeys;
			deletePrivatesKeys = false;
		}
		if (err)
			return originalSend(err.status || 500, err);
		if (deletePrivatesKeys)
			result = tools.cleanPrivatesKeys(result);
		// Delete always "password", "token" and "dateToken" key
		result = tools.removeGivenKeys(result, ['password', 'token', 'dateToken']);
		if (req.query.callback)
			return res.jsonp(result);
		return originalSend(result);
	};
	res.send = send;
	res.sendText = function (err, result) {
		res.header('Content-Type', 'text/plain; charset=utf-8');
		send(err, result);
	};
	res.sendHTML = function (err, result) {
		res.header('Content-Type', 'text/html; charset=utf-8');
		send(err, result);
	};
	res.sendXML = function (err, result) {
		res.header('Content-Type', 'text/xml; charset=utf-8');
		send(err, result);
	}
	res.sendCSV = function (err, result) {
		res.header('Content-Type', 'text/csv; charset=utf-8');
		send(err, result);
	};
	next();
};