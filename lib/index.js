// Defaults globals
global._TEST_ = (global._TEST_ != null ? global._TEST_ : false);
global._INFO_ = (global._INFO_ != null ? global._INFO_ : true);
global._DEBUG_ = (global._DEBUG_ != null ? global._DEBUG_ : true);
global._PRODUCTION_ = (process.env.NODE_ENV === 'production');

// Globals configs
global._config = require('../config');

// Globals modules
var colors = require('colors');
require('../config/error');
global.async = require('async');
global.moment = require('moment-timezone');
moment.lang(_config.lang);
global._ = require('underscore');
global._s = require('underscore.string');
global.tools = require('./tools');
global.noop = function () {};
// SanitizationId
global.sanitizationId = { type: 'string', maxLength: 24 };
// Validation
global.validationId = { type: 'string', exactLength: 24, alias: 'Id', error: 'is not valid (must be 24 characters)' };
global.validationIdOrEmpty = { type: 'string', pattern: ['void', /^[a-f0-9]{24}$/], error: 'is not valid (must be 24 characters)' };
global.validationIdOptional = _.extend({ optional: true }, tools.clone(validationId));

// Context
var ctx = require('./features');
var modules = {
	database: require('./modules/database'),
	cache: require('./modules/cache'),
	// mail: require('./modules/mail')
};
// Add modules to Context
_.keys(modules).forEach(function (key) {
	ctx[key] = {};
	_.keys(modules[key]).forEach(function (methodName) {
		ctx[key][methodName] = modules[key][methodName].bind(ctx);
	});
});
// Flatten it!
var ctxFlatten = tools.flatten(ctx);

// Init all
exports.init = function (callback) {
	async.series([
		// Init DB
		ctx.database.init,
		// Init Cache (Redis)
		ctx.cache.init
	], callback);
};

// execute(session, methodName[, param1, param2, ...], callback);
var execute = function () {
	var args = Array.prototype.slice.call(arguments);
	var slice = 2;
	var session = args[0];
	var methodName = args[1];
	if (typeof session === 'string') {
		methodName = session;
		session = {};
		slice = 1;
	}
	if (!ctxFlatten[methodName])
		throw new Error('Method ['+methodName+'] does not exist.');
	// Init all
	_info('Call ['+methodName+']...');
	var context = tools.clone(ctx);
	context.dry = false;
	context.session = session;
	context.userId = session.userId || '';
	addSocketsModule(context, session);
	ctxFlatten[methodName].apply(context, args.slice(slice));
};

var dryExecute = function () {
	var args = Array.prototype.slice.call(arguments);
	var slice = 2;
	var session = args[0];
	var methodName = args[1];
	if (typeof session === 'string') {
		methodName = session;
		session = {};
		slice = 1;
	}
	if (!ctxFlatten[methodName])
		throw new Error('Method ['+methodName+'] does not exist.');
	// Init all
	_info('Call ['+methodName+']...');
	var context = tools.clone(ctx);
	context.dry = true;
	context.session = session;
	ctxFlatten[methodName].apply(context, args.slice(slice));
};

var addSocketsModule = function (context, session) {
	if (!_TEST_) {
		context.socket = io.user(session.userId);
		context.sockets = io; // Can do this.sockets.user('ID...').emit('XXX', data) or this.sockets.emit('YYY', data);
		return;
	}
	context.socket = { emit: noop };
	context.sockets = { emit: noop, user: function () { return context.socket; } };
};

global.execute = execute;
global.dryExecute = dryExecute;