var express = require('express'),
	compress = require('compression'),
	session = require('express-session'),
	CookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	serveStatic = require('serve-static'),
	errorhandler = require('errorhandler'),
	logger = require('morgan'),
	vhost = require('vhost'),
	RedisStore = require('connect-redis')(session);

// Globals
global.app = express();
global._INFO_ = process.env.INFO || true;
global._DEBUG_ = process.env.DEBUG || true;
global._PRODUCTION_ = (process.env.NODE_ENV === 'production');

// Include lib (add `execute` to globals)
var lib = require('./lib');

// app.use(express.basicAuth('todori', 'anasnl65'));

// Configuration
app.use(logger({
	format: (_PRODUCTION_ ? 'default' : 'dev'),
	skip: function (req, res){ return res.statusCode === 304; }
}));
app.use(bodyParser());
// For multiparty (upload files), we use connect-multiparty (see middleware in routes/api/index.js)
// Sessions with Redis
global.sessionStore = new RedisStore(_config.session.server);
global.cookieParser = CookieParser(_config.session.secret);
app.use(cookieParser);
app.use(session({
	store: sessionStore,
	key: _config.session.key
}));
// Templating
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// Static folder
app.use(serveStatic(__dirname + '/public'));
// Compress response data with gzip / deflate
app.use(compress());

// Development configuration
if (!_PRODUCTION_) {
	app.use(errorhandler({ dumpExceptions: true, showStack: true })); // throw error on development
}
// Production configuration
if (_PRODUCTION_) {
	// Redirect all on host
	app.use(function (req, res, next) {
		if (req.header('host') !== _config.host || req.protocol !== _config.protocol)
			return res.redirect(301, _config.protocol + '://' + _config.host + req.url);
		next();
	});
	_INFO_ = false;
}

// Routes
require('./routes');

// Initialize (MongoDB connection, Redis, etc.)
lib.init(function (err) {
	if (err) {
		_logError(err);
		process.exit(1);
		return;
	}
	global.server = app.listen(_config.port);
	console.log((_config.name + ' is working on port ' + _config.port).green);

	// Socket.io
	require('./lib/sockets');
});