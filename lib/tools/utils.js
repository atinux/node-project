var util = require('util');

exports.inspect = function () {
	var args = Array.prototype.slice.call(arguments);
	args.forEach(function (arg) {
		console.log(util.inspect(arg, true, null, true));
	});
};

// Globals
global._inspect = exports.inspect;
