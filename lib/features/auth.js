/*
** Auth features
*/
var rolesHierarchy = ['member', 'moderator', 'admin'];

exports.isConnected = function (callback) {
	if (!this.session.userId)
		return callback(_errors.badAuth("Vous n'êtes pas connecté."));
	callback(null, { connected: true });
};

exports.isRole = function (role, callback) {
	if (rolesHierarchy.indexOf(this.session.role) < rolesHierarchy.indexOf(role))
		return callback(_errors.badAuth("Vous n'avez pas accès à cette partie."));
	callback(null, { ok: true });
};

exports.login = function (params, callback) {
	var that = this;

	params.password = tools.password(params.password);
	this.database.findUser({
		email: params.email,
		password: params.password
	}, function (err, users) {
		if (err)
			return callback(err);
		if (!users.length)
			return callback(_errors.badAuth('Identifiants incorrect.', 'login-fail'))
		var user = users[0];
		that._fillSession(user.id, callback);
		// that.sockets.user(user.id).emit('message', 'You are connected on another browser!');
		that.sockets.emit('message', user.email + ' is connected.');
	});
};

exports.logout = function (callback) {
	this._resetSession(callback);
};

exports.signup = function (params, callback) {
	var that = this;

	async.waterfall([
		function (next) {
			// Remove repassword key (not used for postUser feature)
			delete params.repassword;
			delete params.rules;
			// Post User!
			that.postUser(params, next);
		},
		function (user, next) {
			that._fillSession(user.id, next);
		}
	], callback);
};

// Privates methods
exports._fillSession = function (userId, callback) {
	var that = this;

	async.waterfall([
		function (next) {
			that.getUser(userId, next);
		},
		function (user, next) {
			// Get Character, etc
			// Todo...
			// Fill session
			that.session.userId = userId;
			that.session.role = user.role;
			next(null, user);
		}
	], callback);
};
exports._resetSession = function (callback) {
	// Reset session
	this.session.userId = null;
	this.session.role = null;
	//  Callback
	callback(null, { ok: true });
};

// Sanitization - optional: true
exports.sanitization = {
	login: {
		type: 'object',
		properties: {
			email: { type: 'string', optional: false, def: '', rules: ['trim', 'lower'] },
			password: { type: 'string', optional: false, def: '' }
		}
	},
	signup: {
		type: 'object',
		properties: {
			email: { type: 'string', optional: false, def: '', rules: ['trim', 'lower'] },
			password: { type: 'string', optional: false, def: '' },
			repassword: { type: 'string', optional: false, def: '' },
			parrain: { type: 'string', optional: false, def: '' },
			rules: { type: 'boolean', optional: false, def: false }
		}
	}
};

// Validation - optional: false
exports.validation = {
	isRole: {
		type: 'string',
		eq: rolesHierarchy
	},
	login: {
		type: 'object',
		properties: {
			email: { type: 'string', pattern: 'email', code: 'email-format' },
			password: { type: 'string', minLength: 6, code: 'password-format' },
		}
	},
	signup: {
		type: 'object',
		strict: true,
		properties: {
			email: { type: 'string', pattern: 'email', code: 'email-format' },
			password: { type: 'string', minLength: 6, code: 'password-format' },
			repassword: { type: 'string', minLength: 6, code: 'repassword-format' },
			parrain: { type: 'string' },
			rules: { type: 'boolean', eq: true, code: 'rules-false' }
		},
		exec: function (schema, post) {
			if (post.password !== post.repassword)
				this.report('Password is different of its confirmation.', 'passwords-different');
		}
	}
};