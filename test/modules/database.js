var should = require('should');

// Static
var _results = {};

var entity = _config.database.collections[0];

test('Check entity', function () {
	should.exist(entity, 'Please add a collection on condig/database.js');
});

if (!entity)
	return;

var methods = {
	save: 'database.save'+entity,
	get: 'database.get'+entity,
	find: 'database.find'+entity,
	delete: 'database.delete'+entity,
};


suite('Should POST entities', function () {
	test('Add a new doc ['+entity+'] and check returned keys', function (done) {
		var params = {
			email: String(+new Date),
			name: 'Henri',
			age: 19,
			competences: ['Node.js', 'Backbone.js']
		};
		execute(methods.save, params, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.name.should.be.equal(params.name);
			res.age.should.be.equal(params.age);
			res.competences.should.be.eql(params.competences);
			res.id.should.be.type('string').and.have.length(24);
			res.id.should.match(/^[a-f0-9]+$/);
			+res.dateCreation.should.be.above(0);
			+res.dateLastUpdate.should.be.above(0);
			_results.first = res;
			done();
		});
 	});
});

suite('Should GET entities', function () {
	test('Get first doc added on DB (must be equal at the doc originally added)', function (done) {
		execute(methods.get, _results.first.id, function (err, res) {
			should.not.exist(err);
			res.should.be.eql(_results.first);
			done();
		});
	});
});

suite('Should PUT entities', function () {
	test('Put first doc added on DB', function (done) {
		var params = {
			id: _results.first.id,
			age: 20
		};
		execute(methods.save, params, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			// Equal (not changed)
			res.id.should.be.equal(_results.first.id);
			res.name.should.be.equal(_results.first.name);
			res.competences.should.be.eql(_results.first.competences);
			res.dateCreation.should.be.eql(_results.first.dateCreation);
			// Changed
			res.age.should.be.not.equal(_results.first.age);
			res.age.should.be.equal(params.age);
			res.dateLastUpdate.should.be.not.eql(_results.first.dateLastUpdate);
			// Done
			done();
		});
	});
	test('Put doc (remove key `age`)', function (done) {
		var params = {
			id: _results.first.id,
			age: null,
			_deleteIfNull: true
		};
		execute(methods.save, params, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			// Equal (not changed)
			res.id.should.be.equal(_results.first.id);
			res.name.should.be.equal(_results.first.name);
			res.competences.should.be.eql(_results.first.competences);
			res.dateCreation.should.be.eql(_results.first.dateCreation);
			// Non-exist now
			should.not.exist(res.age);
			// Changed
			res.dateLastUpdate.should.be.not.eql(_results.first.dateLastUpdate);
			// Done
			done();
		});
	});
});

suite('Should FIND entities', function () {
	test('Find all docs for this entitiy ['+entity+']', function (done) {
		execute(methods.find, function (err, res) {
			should.not.exist(err);
			res.length.should.be.above(0);
			done();
		});
	});
	test('Post docs for specified searches', function (done) {
		var names = ['Henri', 'Nico', 'Sebastien', 'Atinux', 'Gaetan'];
		var i = 0;
		async.map(names, function (name, asyncCb) {
			var params = {
				name: name,
				email: String(+new Date) + i++,
				age: name.length * 2,
				test: {
					flatt: (name.length % 2 === 0),
					number: (name.length * 3 % 7)
				}
			};
			execute(methods.save, params, asyncCb);
		}, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.length.should.be.equal(names.length);
			done();
		});
	});
	test('Find all docs with name = atinux (non-match case)', function (done) {
		var params = {
			name: /atinux/i
		};
		execute(methods.find, params, function (err, res) {
			should.not.exist(err);
			res.length.should.be.equal(1);
			done();
		});
	});
	test('Find all docs with test.flatt=true', function (done) {
		var params = {
			test: {
				flatt: true
			}
		};
		execute(methods.find, params, function (err, res) {
			should.not.exist(err);
			res.length.should.be.equal(3);
			done();
		});
	});
	test('Find all docs with test.number >= 2 (use _flatten=false)', function (done) {
		var params = {
			'test.number': { $gte: 2 },
			_flatten: false
		};
		execute(methods.find, params, function (err, res) {
			should.not.exist(err);
			res.length.should.be.equal(4);
			done();
		});
	});

});

suite('Should DELETE entities', function () {
	test('Delete first doc added on DB and should not get this doc anymore', function (done) {
		execute(methods.delete, _results.first.id, function (err, res) {
			should.not.exist(err);
			should.exist(res);
			res.ok.should.be.true;
			execute(methods.get, _results.first.id, function (err, res) {
				should.exist(err);
				err.status.should.be.equal(404);
				err.error.should.be.equal('Not found');
				done();
			});
		});
	});
});

suite('Drop collections', function () {
	test('Drop it!', function (done) {
		execute('database.drop', function (err, res) {
			should.not.exist(err);
			res.should.be.true;
			done();
		});
	});
});