var should = require('should');

require('./login-logout');

suite('Drop collections', function () {
	test('Drop it!', function (done) {
		execute('database.drop', function (err, res) {
			should.not.exist(err);
			res.should.be.true;
			done();
		});
	});
});

require('./signup');

suite('Drop collections', function () {
	test('Drop it!', function (done) {
		execute('database.drop', function (err, res) {
			should.not.exist(err);
			res.should.be.true;
			done();
		});
	});
});
