exports.postUser = function (params, callback) {
	var that = this;

	async.waterfall([
		function (next) {
			// Check parrain
			if (!params.parrain)
				return next(null, null);
			that.database.getUser(params.parrain, next);
		},
		function (user, next) {
			// Update fields
			params.password = tools.password(params.password);
			params.emailToken = tools.generateToken();
			// Save in DB
			that.database.saveUser(params, next);
		},
		function (user, next) {
			// Return getUser
			that.getUser(user.id, next);
		}
	], callback);
};

exports.getUser = function (id, callback) {
	var that = this;

	async.waterfall([
		function (next) {
			that.database.getUser(id, next);
		}
	], callback);
};

exports.deleteUser = function (id, callback) {
	var that = this;

	async.waterfall([
		function (next) {
			that.database.deleteUser(id, next);
		},
		function (res, next) {
			// Add Character, etc...
			// this._deleteUserDependencies(user.id, next);
			next(null, res);
		}
	], callback);
};

// Default - optional: true
exports.sanitization = {
	postUser: {
		type: 'object',
		properties: {
			email: { type: 'string', optional: false, def: '', rules: ['trim', 'lower'] },
			password: { type: 'string', optional: false, def: '' },
			emailConfirmed: { type: 'boolean', optional: false, def: false },
			role: { type: 'string', optional: false, def: 'member' },
			parrain: { type: 'string', optional: false, def: '' },
			rubis: { type: 'integer', optional: false, def: 10 },
		}
	},
	getUser: sanitizationId,
	deleteUser: sanitizationId
};

// Default - optional: false
exports.validation = {
	postUser: {
		type: 'object',
		strict: true,
		properties: {
			email: { type: 'string', pattern: 'email' },
			password: { type: 'string', minLength: 6 },
			emailConfirmed: { type: 'boolean', eq: false },
			role: { type: 'string', eq: 'member' },
			parrain: validationIdOrEmpty, // userId
			rubis: { type: 'integer', eq: 10 },
		},
	},
	getUser: validationId,
	deleteUser: validationId
};

// Examples:
// execute('postUser', {}, tools.inspect);