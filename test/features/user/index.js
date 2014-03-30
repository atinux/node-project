/*
** Functions tested
** - postUser(params, callback)
** - getUser(id, callback)
** - putUser(params, callback)
** - deleteUser(id, callback)
*/

var should = require('should');

require('./base');

suite('Drop collections', function () {
	test('Drop it!', function (done) {
		execute('database.drop', function (err, res) {
			should.not.exist(err);
			res.should.be.true;
			done();
		});
	});
});