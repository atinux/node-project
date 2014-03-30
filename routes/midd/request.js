module.exports = function (req, res, next) {
	// req.hash
	req.hash = req.query || {};
	for (var key in req.body) { req.hash[key] = req.body[key]; }
	for (var key in req.params) {
		if (parseInt(key, 10).toString() !== key) // is not a number
			req.hash[key] = req.params[key];
	}
	// Sessions
	req.session = req.session || {};
	// execute !
	req.execute = req.exec = execute.bind(null, req.session);
	// Asynchronous call to next()
	setImmediate(next);
};