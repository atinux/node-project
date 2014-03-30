var multipart = require('connect-multiparty');

module.exports = function (req, res, next) {
	multipart({
		maxFilesSize: 1024 * 1024 * 5, // 5 MB
	})(req, res, function (err) {
		if (err)
			return utils.send(req, res, _errors.badRequest('File too large.'));
		next();
	});
};
