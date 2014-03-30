var should = require('should');

// Change globals
global._TEST_ = true;
// INFO/DEBUG
global._INFO_ = false;
global._DEBUG_ = true;

// Library
var lib = require('../lib');
var suiteList = require('./tests.js');

// Reset DB
suite('Initialisation...', function () {
	test('Init lib', function (done) {
		lib.init(done);
	});
	test('Reset DB', function (done) {
		execute('database.resetDatabase', function (err, res) {
			should.not.exist(err);
			res.should.be.true;
			done();
		});
	});
});

// Let's go
_.each(_.keys(suiteList), function (folderName) {
	var folder = suiteList[folderName];
	suite(_s.capitalize(folderName), function () {
		_.each(_.keys(folder), function (file) {
			if (folder[file] === true) {
				suite(_s.capitalize(file), function () {
					require('./'+folderName+'/'+file);
				});
			}
		});
	});
});
