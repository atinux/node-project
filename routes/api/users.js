exports.getSessionUser = function (req, res) {
	req.execute('getUser', req.session.userId, res.send);
};