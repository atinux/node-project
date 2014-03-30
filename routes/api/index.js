// Base API
var baseAPI = '/api';
var r = function (route) { return baseAPI + route; };

// Middleware
var midd = require('../midd');
// Middleware API, add req._api = true
app.all(r('/*'), midd.api);

// Session
var auth = require('./auth');
app.get(r('/session'), midd.member, auth.ok);
app.get(r('/session/sockets'), midd.member, auth.sockets);
app.post(r('/session'), midd.all, auth.login);
app.delete(r('/session'), midd.member, auth.logout);

// Users
var users = require('./users');
app.post(r('/users'), midd.all, auth.signup);
app.get(r('/user'), midd.member, users.getSessionUser); // Get its own user