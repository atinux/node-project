/*
** Middlewares
*/

// Activate upload system (can use req.files)
var upload = require('./upload');
exports.upload = upload;

// Add req.hash (fusion of req.params, req.query and req.body)
var request = require('./request');
exports.request = request;

// Check if the user is connected
var auth = require('./auth');
exports.auth = auth;

// Add req.hash (fusion of req.params, req.query and req.body)
var acl = require('./acl');
exports.acl = auth;

// Add req._api & extend res.send, add res.sendTXT, etc
var api = require('./api');
exports.api = api;

// All persons middleware (visitors + members)
exports.all = function (req, res, next) {
	async.series([
		request.bind(null, req, res)
	], next);
};

// Members (+ moderators and admin)
exports.member = function (req, res, next) {
	async.series([
		request.bind(null, req, res),
		auth.connected.bind(null, req, res),
		acl.bind(null, req, res, 'member')
	], function (err) {
		if (err && req._api)
			return res.send(err);
		else if (err)
			return res.redirect('/');
		next();
	});
};

// Moderators (+ admins)
exports.moderator = function (req, res, next) {
	async.series([
		request.bind(null, req, res),
		auth.connected.bind(null, req, res),
		acl.bind(null, req, res, 'moderator')
	], function (err) {
		if (err && req._api)
			return res.send(err);
		else if (err)
			return res.redirect('/moderator/');
		next();
	});
};

// Admins
exports.admin = function (req, res, next) {
	async.series([
		request.bind(null, req, res),
		auth.connected.bind(null, req, res),
		acl.bind(null, req, res, 'admin')
	], function (err) {
		if (err && req._api)
			return res.send(err);
		else if (err)
			return res.redirect('/admin/');
		next();
	});
};