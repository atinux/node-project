io.set('authorization', function (data, accept) {
	cookieParser(data, {}, function (err) {
		if (err)
			return accept(err, false);
		var cookieId = (data.secureCookies && data.secureCookies[_config.session.key]) || (data.signedCookies && data.signedCookies[_config.session.key]) || (data.cookies && data.cookies[_config.session.key]);
		sessionStore.load(cookieId, function (err, session) {
			if (err || !session || !session.userId)
				return accept(null, false);
			data.session = session;
			accept(null, true);
		});
	});
});