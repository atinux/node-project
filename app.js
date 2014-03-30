var express = require('express'),
	RedisStore = require('connect-redis')(express);

// Globals
global.app = express();
global._INFO_ = process.env.INFO || true;
global._DEBUG_ = process.env.DEBUG || true;
global._PRODUCTION_ = (process.env.NODE_ENV === 'production');

// Include lib (add `execute` to globals)
var lib = require('./lib');

// app.use(express.basicAuth('todori', 'anasnl65'));

// Configuration
app.configure(function () {
	// Body parser and url parser
	app.use(express.urlencoded());
	app.use(express.json());
	// For multiparty (upload files), we use connect-multiparty (see middleware in routes/api/index.js)
	// Sessions with Redis
	global.sessionStore = new RedisStore(_config.session.server);
	global.cookieParser = express.cookieParser(_config.session.secret);
	app.use(cookieParser);
	app.use(express.session({
		store: sessionStore,
		key: _config.session.key
	}));
	// Templating
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');
	// Static folder
	app.use(express.static(__dirname + '/public'));
	// Compress response data with gzip / deflate
	app.use(express.compress());
});

// Development configuration
app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); // throw error on development
});

// Production configuration
app.configure('production', function() {
	app.use(express.errorHandler()); // Don't throw error (don't kill app in production)
	// Redirect all on host
	app.use(function (req, res, next) {
		if (req.header('host') !== _config.host || req.protocol !== _config.protocol)
			return res.redirect(301, _config.protocol + '://' + _config.host + req.url);
		next();
	});
	_INFO_ = false;
});

// Use defined routes after static files and middlewares
app.use(app.router);

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