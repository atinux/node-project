var express = require('express'),
	compress = require('compression'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	serveStatic = require('serve-static'),
	errorhandler = require('errorhandler'),
	logger = require('morgan'),
	vhost = require('vhost'),
	auth = require('basic-auth'),
	RedisStore = require('connect-redis')(session);

// Globals
global.app = express();
global._INFO_ = process.env.INFO || true;
global._DEBUG_ = process.env.DEBUG || true;
global._PRODUCTION_ = (process.env.NODE_ENV === 'production');

// Include lib (add `execute` to globals)
var lib = require('./lib');

// Basic auth
if (_config.basicAuth.active) {
	app.use(function (req, res, next) {
		var user = auth(req);
		if (user && user.name === _config.basicAuth.username && user.pass === _config.basicAuth.password)
			return next();
		res.setHeader('WWW-Authenticate', 'Basic realm="'+_config.basicAuth.realm+'"');
		res.send(401, 'Unauthorized');
	});
}

// Configuration
app.use(logger({
	format: (_PRODUCTION_ ? 'default' : 'dev'),
	skip: function (req, res){ return res.statusCode === 304; }
}));

// Body parser
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
// For multiparty (upload files), we use connect-multiparty (see middleware in routes/api/index.js)

// Sessions with Redis
global.sessionStore = new RedisStore(_config.session.server);
app.use(session({
	name: _config.session.key,
	resave: true, // Don't save session if unmodified
	saveUninitialized: true, // Create session each time
	store: sessionStore,
	secret: _config.session.secret,
	cookie: {
		secure: (_config.protocol === 'https' ? true : false)
	}
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