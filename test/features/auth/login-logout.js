/*
** Functions tested
** - login(params, callback)
** - isConnected(callback)
** - isRole(role, callback)
** - logout(callback)
*/

var should = require('should');
var session = {};
var user = null;

suite('Dependencies', function () {
	test('Add user for this test', function (done) {
		var params = {
			email: 'atinux@gmail.com',
			password: '123456'
		};
		execute('postUser', params, function (err, res) {
			should.not.exist(err);
			user = res;
			done();
		});
	});
});

suite('login(params, callback', function () {
	suite('Validation', function (done) {
		test('Should return an error with no params', function (done) {
			dryExecute('login', {}, function (err) {
				should.exist(err);
				err.message.should.include('email');
				err.message.should.include('password');
				done();
			});
		});
		test('Should return an error with bad format email', function (done) {
			var params = { email: 'atinux' };
			dryExecute('login', params, function (err) {
				should.exist(err);
				err.message.should.include('email');
				err.message.should.include('password');
				done();
			});
		});
		test('Should return an error with password too short', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123'
			};
			dryExecute('login', params, function (err) {
				should.exist(err);
				err.message.should.not.include('email');
				err.message.should.include('password');
				done();
			});
		});
		test('Should works with good params', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456'
			};
			dryExecute('login', params, function (err) {
				should.not.exist(err);
				done();
			});
		});
	});

	suite('Execution', function () {
		test('Should return an error with unknown user', function (done) {
			var params = {
				email: 'todori@todori.fr',
				password: '123123123'
			};
			execute(session, 'login', params, function (err, res) {
				should.exist(err);
				err.status.should.be.equal(401);
				done();
			});
		});
		test('Should works with good user', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456'
			};
			execute(session, 'login', params, function (err, res) {
				should.not.exist(err);
				session.userId.should.be.equal(user.id);
				session.role.should.be.equal('member');
				done();
			});
		});
	});
});