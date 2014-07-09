exports.ok = function (req, res) {
	res.send(null, { connected: true });
};

exports.sockets = function (req, res) {
	res.send(null, io.getUserSockets(req.session.userId));
};

exports.login = function (req, res) {
	req.execute('login', req.hash, res.send);
};

exports.logout = function (req, res) {
	req.execute('logout', res.send);
};

exports.signup = function (req, res) {
	req.execute('signup', req.hash, res.send.bind(null, true));
};