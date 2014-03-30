var redis = require("redis");

// Check Redis connection
exports.init = function (callback) {
	_info('Connecting to Redis ['+_config.session.server.host +':'+_config.session.server.port+']...');
	var client = redis.createClient(_config.session.server.port, _config.session.server.host);
	async.waterfall([
		function (next) {
			if (!_config.session.server.pass)
				return next(null);
			client.auth(_config.session.server.pass, next);
		},
		function (next) {
			client.once('ready', function () {
				client.removeListener('error', callback);
				client.once('error', function (err) {
					_logError(err);
					client.on('error', noop);
					setTimeout(function() {
						process.exit(1);
					}, 3000);
				});
				// client.select(_config.session.server.db, function (err, res) {
				// 	if (_config.session.flush === true)
				// 		return client.flushdb(callback);
					callback(null);
				// });
			})
			.once('error', callback);
		}
	], callback);
};