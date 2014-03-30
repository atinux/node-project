/*
** Functions tested
** - signup(params, callback)
*/

var should = require('should');
var session = {};
var user = null;

suite('signup(params, callback', function () {
	suite('Validation', function (done) {
		test('Should return an error with no params', function (done) {
			dryExecute('signup', {}, function (err) {
				should.exist(err);
				err.message.should.include('email');
				err.message.should.include('password');
				err.message.should.include('repassword');
				err.message.should.include('rules');
				done();
			});
		});
		test('Should return an error with bad format email', function (done) {
			var params = { email: 'atinux' };
			dryExecute('signup', params, function (err) {
				should.exist(err);
				err.message.should.include('email');
				err.message.should.include('password');
				err.message.should.include('repassword');
				err.message.should.include('rules');
				done();
			});
		});
		test('Should return an error with password too short', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123'
			};
			dryExecute('signup', params, function (err) {
				should.exist(err);
				err.message.should.not.include('email');
				err.message.should.include('password');
				err.message.should.include('repassword');
				err.message.should.include('rules');
				done();
			});
		});
		test('Should return an error with good email and password and no repassword', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456'
			};
			dryExecute('signup', params, function (err) {
				should.exist(err);
				err.message.should.not.include('email');
				err.message.should.include('password');
				err.message.should.include('repassword');
				err.message.should.include('rules');
				done();
			});
		});
		test('Should return an error with good email and password and different repassword', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456',
				repassword: '1234567'
			};
			dryExecute('signup', params, function (err) {
				should.exist(err);
				err.message.should.not.include('email');
				err.message.should.include('Password');
				err.message.should.not.include('repassword');
				err.message.should.include('rules');
				done();
			});
		});
		test('Should works with good params (+ rules to true)', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456',
				repassword: '123456',
				rules: true
			};
			dryExecute('signup', params, function (err) {
				should.not.exist(err);
				done();
			});
		});
	});

	suite('Execution', function () {
		test('Should create an user with good params (and fill session)', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456',
				repassword: '123456',
				rules: true
			};
			execute(session, 'signup', tools.clone(params), function (err, res) {
				should.not.exist(err);
				res.email.should.be.equal(params.email);
				res.password.should.be.equal(tools.password(params.password));
				should.not.exist(res.repassword);
				session.userId.should.be.equal(res.id);
				user = res;
				done();
			});
		});
		test('Should login with good user', function (done) {
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