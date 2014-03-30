var inspector = require('schema-inspector');
var features = {};

// Import
_import('./auth');
_import('./user');
_import('./userCharacter');

// Method
function _import(moduleName) {
	var module = require(moduleName);
	_.each(_.keys(module), function (methodName) {
		if (methodName === 'sanitization' || methodName === 'validation')
			return;
		if (features[methodName])
			throw new Error('Feature ['+methodName+'] already exists.');
		features[methodName] = function () {
			// Arguments
			var args = Array.prototype.slice.call(arguments),
				dry = this.dry,
				that = this;

			var callback = _.last(args);
			async.waterfall([
				function (next) {
					// Sanitization
					if (!module || !module.sanitization || !module.sanitization[methodName])
						return next(null, null);
					_info('Sanitization %s...', methodName);
					var schemaSanitization = module.sanitization[methodName];
					inspector.sanitize(tools.baseSanitization(schemaSanitization), args, next);
				},
				function (res, next) {
					//if (res && res.reporting && res.reporting.length)
					//	_info(res.format());
					// Validation
					if (!module || !module.validation || !module.validation[methodName])
						return next(null, null);
					_info('Validation feature ['+methodName+']...');
					var schemaValidation = module.validation[methodName];
					inspector.validate(tools.baseValidation(schemaValidation), args, next);
				},
				function (res, next) {
					if (res && res.valid !== true) {
						// _debug('Error on validation [method '+methodName+']:', res.format());
						return next(_errors.validation(res));
					}
					if (dry)
						return next(null);
					// Replace callback by next() method
					args.pop();
					args.push(next);
					module[methodName].apply(that, args);
				}
			], function (err, res) {
				if (err)
					return callback(err);
				if (!err && res && module[methodName].socket == true && that.socket)
					that.socket.emit(methodName, res);
				callback(err, res);
			});
		};
	});
};

module.exports = features;