var util = require('util'),
	raven = require('raven'),
	sentry = new raven.Client('https://f570a053480342a1852f416a1a6ca0e5:e642f678c05743e286f3c6024ffcacda@app.getsentry.com/21035');

var _status = {
	// OK
	ok: 200,
	// Client error
	badRequest: 400,
	unauthorized: 401,
	forbidden: 403,
	notFound: 404,
	// Server error
	error: 500,
	notImplemented: 501
};

var errors = {
	validation: {
		status: _status.badRequest,
		error: 'Validation failure'
	},
	notFound: {
		status: _status.notFound,
		error: 'Not found'
	},
	badRequest: {
		status: _status.badRequest,
		error: 'Bad request'
	},
	badAuth: {
		status: _status.unauthorized,
		error: 'Authentication error'
	},
	internalError: {
		status: _status.error,
		error: 'Internal error'
	}
};

function _Error(message, status, error, errors, code) {
	Error.captureStackTrace(this, arguments.callee);
	this.message = message || '';
	this.status = status;
	this.error = error;
	this.codes = _.compact([ code ]);
	if (errors) {
		this.errors = errors;
		this.codes = _.uniq(_.compact(this.codes.concat(_.pluck(errors, 'code'))));
	}
	if (status === _status.error) {
		_logError(this);
	}
}
util.inherits(_Error, Error);

// Transform to functions
var _errors = {};
Object.keys(errors).forEach(function (error) {
	var hash = errors[error];
	_errors[error] = function (err, code) {
		var message = (typeof err.format === 'function' ? err.format() : err);
		return new _Error(message, hash.status, hash.error, err.error, code);
	};
});

// Globals
global._status = _status;
global._errors = _errors;

global._info = function () {
	if (process.env.INFO || (typeof _INFO_ !== 'undefined' && _INFO_)) {
		var now = moment().format('YYYY-MM-DD HH:mm:ss');
		process.stderr.write('\033[36;1m> Info - ' + now);
		process.stderr.write(':\033[0m \033[36m');
		console.error.apply(null, Array.prototype.slice.call(arguments));
		process.stderr.write('\033[0m');
	}
};

global._debug = function () {
	if (process.env.DEBUG || (typeof _DEBUG_ !== 'undefined' && _DEBUG_)) {
		var now = moment().format('YYYY-MM-DD HH:mm:ss');
		process.stderr.write('\033[31;1m> Debug - ' + now);
		process.stderr.write(':\033[0m \033[31m');
		console.error.apply(null, Array.prototype.slice.call(arguments));
		process.stderr.write('\033[0m');
	}
};

global._codesToText = global._codeToText = require('./errorCodes');

// Handle Errors
// -> Send me an email when my app has an error please :)
global._logError = function (err, log) {
	if (!err)
		return;
	log = (typeof log === 'boolean' ? log : true);
	if (log)
		_debug(err.stack || err);
	if (!_PRODUCTION_)
		return err;
	sentry.captureError(new Error(err));
	return err;
};

process.on('uncaughtException', function (err) {
	err.message += ' [Uncaught Exception]';
	_logError(err);
});
