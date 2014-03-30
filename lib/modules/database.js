var mongodb = require('mongodb')
	MongoClient = mongodb.MongoClient,
	Server = mongodb.Server,
	ObjectID = mongodb.ObjectID;

// Format outId
var outId = function (res) {
	if (!res) return res;
	if (res instanceof ObjectID) return res.toString();
	if (typeof res === 'string') return res;
	if (!res._id && res.id) return res;
	res.id = res._id.toString();
	delete res._id;
	return res;
};
var modifMongoError = function (error, msg) {
	if (error && error.err && error.err.indexOf('duplicate key error') !== -1) {
		var key = /\.\$([a-z_]{1}[A-z]+)_1?/.exec(error.err)[1].replace('_id', 'Id');
		var value = /\{ ?: ?(.+)\}/.exec(error.err)[1].trim().replace(/ObjectId\('(.+)'\)/, '$1');
		error = _errors.badRequest(_s.capitalize(key) + ' ['+value+'] already taken.', key+'-taken');
		return error;
	}
	return _errors.internalError(msg);
};

var Mongo = function (options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {
			server: {},
			collections: [],
			indexes: {
				uniques: {}
			}
		};
	}

	this.config = {
		host: options.server.host || 'localhost',
		port: options.server.port || 27017,
		username: options.server.username || '',
		password: options.server.password || '',
		dbName: options.server.dbName || 'test'
	};
	this.collections = {};
	this.indexes = options.indexes || {};
	this.exports = {};
	var that = this;
	// Generate all methods
	if (options.collections) {
		options.collections.forEach(function (entity) {
			that.exports['save'+entity] = that.save.bind(that, entity);
			that.exports['get'+entity] = that.get.bind(that, entity);
			that.exports['find'+entity] = that.find.bind(that, entity);
			that.exports['count'+entity] = that.count.bind(that, entity);
			that.exports['delete'+entity] = that.delete.bind(that, entity);
		});
	}
	this._inited = false;
	// Export !
	// Init method
	this.exports.init = function (callback) {
		if (that._inited)
			return callback(null, that.db);
		_info('Connecting to Mongo ['+that.config.host +':'+that.config.port+']...');
		var uri = that.getMongoURI();
		MongoClient.connect(uri, function (err, db) {
			if (err)
				return callback(err);
			that._inited = true;
			that.db = db;
			callback(null, that.db);
		});
	};
	// Drop collection
	var drop = function (collectionName, callback) {
		if (!that._inited)
			return callback(_errors.internalError('Please init MongoDB before calling methods.'));
		if (typeof collectionName === 'function') {
			callback = collectionName;
			collectionName = null;
		}
		if (collectionName && !that.collections[collectionName])
			return callback(null, false);
		if (collectionName && that.collections[collectionName]) {
			var collection = that.collections[collectionName];
			delete that.collections[collectionName];
			return collection.drop(callback);
		}
		async.each(_.keys(that.collections), function (name, next) {
			drop(name, next);
		}, function (err) {
			if (err)
				return callback(err);
			callback(null, true);
		});
	};
	this.exports.drop = drop;
	// Reset DB
	this.exports.resetDatabase = function (callback) {
		if (!that._inited)
			return callback(_errors.internalError('Please init MongoDB before calling methods.'));
		that.collections = {};
		that.db.dropDatabase(callback);
	};
};

/*
** PROTO
*/
Mongo.prototype.getMongoURI = function () {
	var uri = 'mongodb://';
	if (this.config.username && this.config.password)
		uri += this.config.username + ':' + this.config.password + '@';
	uri += this.config.host + ':' + this.config.port + '/' + this.config.dbName;
	return uri;
};

Mongo.prototype.createCollection = function (collectionName, callback) {
	if (!this._inited)
		return callback(_errors.internalError('Please init MongoDB before calling methods.'));
	if (this.collections[collectionName])
		return callback(null, this.collections[collectionName]);
	var that = this,
		_collection = that.db.collection(collectionName);

	that.collections[collectionName] = _collection;
	// Add indexed
	async.forEach(that.indexes[collectionName] || [], function (index, next) {
		var options = {};
		if (that.indexes.uniques[_collection.collectionName] && _(that.indexes.uniques[_collection.collectionName]).include(index))
			options.unique = true;
		_collection.ensureIndex(index, options, function (err) {
			if (err)
				_debug(err);
			next(null)
		});
	}, function (err) {
		if (err)
			return callback(err);
		callback(null, _collection);
	});
};

Mongo.prototype.save = function (collectionName, doc, callback) {
	var that = this;
	async.waterfall([
		function (next) {
			that.createCollection(collectionName, next);
		},
		function (collection, next) {
			// POST or PUT ?
			if (!doc.id && !doc._id) {
				doc.dateLastUpdate = doc.dateCreation = new Date();
				collection.insert(doc, function (err, docs) {
					if (err || !docs || !docs.length)
						return next(modifMongoError(err, 'Error on POST ['+collectionName+'], please try again later.'));
					next(null, outId(docs[0]));
				});
				return;
			}
			that._put(collectionName, doc, next);
		}
	], callback);
};

Mongo.prototype._put = function (collectionName, doc, callback) {
	if (typeof doc.id === 'string' || typeof doc._id === 'string')
		doc._id = mongodb.ObjectID.createFromHexString(doc.id || doc._id);
	else
		doc._id = doc._id || doc.id;
	var that = this,
		id = doc._id,
		newDoc;

	async.waterfall([
		function (next) {
			that.get(collectionName, id, next);
		},
		function (getResult, next) {
			newDoc = tools.merge(getResult, doc);
			delete newDoc.id;
			newDoc.dateLastUpdate = new Date();
			that.collections[collectionName].update({ _id: id }, newDoc, next);
		},
		function (updated, obj, next) {
			if (!updated)
				return next(_errors.internalError('Error on PUT ['+collectionName+']['+id+'], please try again later.'));
			next(null, outId(newDoc));
		}
	], function (err, res) {
		if (err)
			return next(modifMongoError(err, 'Error on PUT ['+collectionName+']['+id+'], please try again later.'));
		callback(null, res);
	});
};

Mongo.prototype.get = function (collectionName, id, callback) {
	if (typeof id === 'string')
		id = mongodb.ObjectID.createFromHexString(id);
	var that = this;

	async.waterfall([
		function (next) {
			that.createCollection(collectionName, next);
		},
		function (collection, next) {
			collection.findOne({ _id: id }, function (err, res) {
				if (!res) return next(_errors.notFound('Id ['+id+'] not found on entity ['+collectionName+'].'));
				return next(err, outId(res));
			});
		}
	], callback);
};

Mongo.prototype.find = function (collectionName, params, options, callback) {
	if (!options && !callback) {
		callback = params;
		params = {};
		options = {};
	}
	else if (options && !callback) {
		callback = options;
		options = {};
	}
	if (typeof params._flatten !== 'boolean')
		params._flatten = true;
	var that = this;
	async.waterfall([
		function (next) {
			that.createCollection(collectionName, next);
		},
		function (collection, next) {
			if (params._flatten)
				params = tools.flatten(params);
			delete params._flatten;
			collection.find(params, options).toArray(function (err, res) {
				if (err) return next(err);
				res.map(outId);
				return next(err, res);
			});
		}
	], callback);
};

Mongo.prototype.count = function (collectionName, params, options, callback) {
	if (!options && !callback) {
		callback = params;
		params = {};
		options = {};
	}
	else if (options && !callback) {
		callback = options;
		options = {};
	}
	if (typeof params._flatten !== 'boolean')
		params._flatten = true;
	var that = this;
	async.waterfall([
		function (next) {
			that.createCollection(collectionName, next);
		},
		function (collection, next) {
			if (params._flatten)
				params = tools.flatten(params);
			delete params._flatten;
			collection.count(params, options, callback)
		}
	], callback);
};

Mongo.prototype.delete = function (collectionName, id, callback) {
	if (typeof id === 'string')
		id = mongodb.ObjectID.createFromHexString(id);
	var that = this;

	async.waterfall([
		function (next) {
			that.createCollection(collectionName, next);
		},
		function (collection, next) {
			collection.remove({ _id: id }, { safe: true }, function (err, removed) {
				if (err) return callback(modifMongoError(err, 'Erro on DELETE ['+collectionName+']['+id+'], please try again later.'));
				if (!removed) return next(_errors.notFound('Id ['+id+'] not found on entity ['+collectionName+'].'));
				next(null, { ok: true });
			});
		}
	], callback);
};

// Export instance of Mongo
module.exports = new Mongo(_config.database).exports;