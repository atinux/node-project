var CookieParser = require('cookie-parser'),
	cookieParser = CookieParser(_config.session.secret);

io.use(function (socket, next) {
	var handshakeData = socket.request;
	cookieParser(handshakeData, {}, function (err) {
		if (err)
			return next(new Error(err.message));
		var cookieId = (handshakeData.secureCookies && handshakeData.secureCookies[_config.session.key]) || (handshakeData.signedCookies && handshakeData.signedCookies[_config.session.key]) || (handshakeData.cookies && handshakeData.cookies[_config.session.key]);
		sessionStore.load(cookieId, function (err, session) {
			if (err || !session || !session.userId)
				return next(new Error('No session found or no session.userId.'));
			handshakeData.session = session;
			next();
		});
	});
});
