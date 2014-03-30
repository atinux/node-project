// Sanitization - Validation
exports.baseSanitization = exports.baseValidation = function (args) {
	if (!_.isArray(args)) args = [ args ];
	return {
		type: 'array',
		minLength: args.length,
		items: args
	};
};

// Prototype on Object to clone object
var clone = function (obj) {
	var newObj = (obj instanceof Array) ? [] : {};
	for (var i in obj) {
		if (obj[i] && _.isObject(obj[i]) && !_.isFunction(obj[i]) && !_.isDate(obj[i]) && !(obj[i] instanceof RegExp)) {
			newObj[i] = clone(obj[i]);
		}
		else {
			newObj[i] = obj[i];
		}
	}
	return newObj;
};
exports.clone = clone;

// Flatten
var flatten = function (hash, newHash, keys) {
	newHash = newHash || {};
	keys = keys || [];
	for (var i in hash) {
		keys.push((Array.isArray(hash) ? '['+i+']' : i));
		if (Array.isArray(hash[i]) || (hash[i] != null && typeof hash[i] === 'object' && hash[i].constructor === Object))
			flatten(hash[i], newHash, keys);
		else
			newHash[keys.join('.').replace(/\.(\[\d+\])/g, '$1')] = hash[i];
		keys.pop();
	}
	return newHash;
};
exports.flatten = flatten;

// Inverse flatten (dont see the code, or you will kill yourself...)
exports.flattenToObj = function (flattened) {
	var obj = {}, regTab = /^([^\[\]]*)\[(\d+)\]/, tab, tmp, match, newMatch, last;
	for (var key in flattened) {
		tab = key.split(".");
		tmp = obj;
		for (var i = 0, l = tab.length; i < l; i++) {
			last = (i + 1) === l;
			match = regTab.exec(tab[i]);
			// If it's an array
			if (match) {
				tmp = tmp[match[1]] = tmp[match[1]] || [];
				do {
					newMatch = regTab.exec(match.input.slice(match[0].length));
					tmp = tmp[parseInt(match[2])] = tmp[parseInt(match[2])] || (last && !newMatch ? flattened[key] : (newMatch ? [] : {}));
					match = newMatch;
				} while (match)
			}
			else tmp = tmp[tab[i]] = (last && !tmp[tab[i]] ? flattened[key] : tmp[tab[i]] || {});
		}
	}
	return obj;
};

// Merge
var merge = function  (obj1, obj2) {
	obj2 = obj2 || {};
	var tmp,
		deleteIfNull = obj2._deleteIfNull || false;
	delete obj2._deleteIfNull;
	// We merge obj 2 in obj1
	for (var key in obj2) {
		tmp = obj2[key];
		// if (_.isObject(tmp) && obj1[key] instanceof Object && !_.isArray(tmp) && !_.isFunction(tmp) && !_.isDate(tmp)) {
		if (tmp != null && typeof tmp === 'object' && tmp.constructor === Object) {
			if (typeof obj1[key] === 'undefined') obj1[key] = {};
			merge(obj1[key], obj2[key]);
		}
		else {
			obj1[key] = obj2[key];
			if (deleteIfNull && obj1[key] === null) delete obj1[key];
		}
	}
	return obj1;
};
exports.merge = merge;

// Sanitize Hash
var sanitizeHash = function (params) {
	var key;
	for (key in params) {
		if (typeof params[key] === 'undefined') {
			delete params[key];
		}
		if (params[key] instanceof Object) {
			params[key] = sanitizeHash(params[key]);
		}
	}
	return params;
};
exports.sanitizeHash = sanitizeHash;

// Sanitize args
var sanitizeArgs = function (args) {
	args.forEach(function (hash, i) {
		if (args[i] instanceof Function) return;
		sanitizeHash(args[i]);
	});
	return args;
};
exports.sanitizeArgs = sanitizeArgs;

// Clean object, take off _keys (privates)
var cleanPrivatesKeys = function (obj, recursive) {
	recursive = (typeof recursive === 'boolean' ? recursive : true);
	for (var key in obj) {
		if (key.indexOf('_') === 0)
			delete obj[key];
		if (recursive && obj[key] && (obj[key].constructor === Object || Array.isArray(obj[key])))
			obj[key] = cleanPrivatesKeys(obj[key], recursive);
	}
	return obj;
};
exports.cleanPrivatesKeys = cleanPrivatesKeys;

// Remove given keys in object
var removeGivenKeys = function (obj, keys, recursive) {
	keys = keys || [];
	recursive = (typeof recursive === 'boolean' ? recursive : true);
	for (var key in obj) {
		if (keys.indexOf(key) !== -1)
			delete obj[key];
		if (recursive && obj[key] && (obj[key].constructor === Object || Array.isArray(obj[key])))
			obj[key] = removeGivenKeys(obj[key], keys, recursive);
	}
	return obj;
};
exports.removeGivenKeys = removeGivenKeys;

// sort([hash tab], 'key to sort', 'asc or desc')
exports.sort = function (tab, key, order) {
	tab = tab || [];
	key = key || 'unknown';
	order = (order === 'desc' ? 'desc' : 'asc');
	tab.sort(function (obj1, obj2) {
		var val1 = obj1[key],
			val2 = obj2[key],
			tmp;

		if (order === 'desc') {
			tmp = val1;
			val1 = val2;
			val2 = tmp;
		}
		if (val1 < val2)
			return -1;
		if (val1 > val2)
			return 1;
		return 0;
	});
	return tab;
};