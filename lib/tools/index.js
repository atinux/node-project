var tools = {};

var _import = function (moduleName) {
	var module = require(moduleName);
	for (var methodName in module) {
		tools[methodName] = module[methodName];
	}
};

_import('./number');
_import('./object');
_import('./security');
_import('./string');
_import('./utils');

module.exports = tools;