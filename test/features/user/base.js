var should = require('should');

suite('postUser(params, callback)', function () {
	suite('Validation', function () {
		test('Should return an error with no params', function (done) {
			dryExecute('postUser', {}, function (err) {
				should.exist(err);
				err.message.should.include('email');
				err.message.should.include('password');
				done();
			});
		});
		test('Should return an error with bad email format', function (done) {
			dryExecute('postUser', { email: 'coucou' }, function (err) {
				should.exist(err);
				err.message.should.include('email');
				err.message.should.include('password');
				done();
			});
		});
		test('Should return an error with password.length < 6', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: 'test'
			};
			dryExecute('postUser', params, function (err) {
				should.exist(err);
				err.message.should.not.include('email');
				err.message.should.include('password');
				done();
			});
		});
		test('Should return an error with too much params', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456',
				other: true
			};
			dryExecute('postUser', params, function (err) {
				should.exist(err);
				err.message.should.include('other');
				done();
			});
		});
		test('Should works with good params', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456'
			};
			dryExecute('postUser', params, function (err, res) {
				should.not.exist(err);
				done();
			});
		});
	});

	suite('Execution', function () {
		var _user;
		test('Should create user with good params', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456'
			};
			execute('postUser', tools.clone(params), function (err, res) {
				should.not.exist(err);
				should.exist(res.id);
				res.email.should.be.equal(params.email);
				res.password.should.not.be.equal(params.password);
				res.password.should.be.equal(tools.password(params.password));
				res.role.should.be.equal('member');
				res.emailConfirmed.should.be.false;
				res.parrain.should.be.equal('');
				res.rubis.should.be.equal(10);
				should.exist(res.emailToken);
				should.exist(res.dateCreation);
				should.exist(res.dateLastUpdate);
				_user = res;
				done();
			});
		});
		test('Should not create user with the same email', function (done) {
			var params = {
				email: 'atinux@gmail.com',
				password: '123456'
			};
			execute('postUser', tools.clone(params), function (err, res) {
				should.exist(err);
				err.message.should.include('already taken');
				done();
			});
		});
		test('Should not create user with unknown parrain', function (done) {
			var params = {
				email: 'atinux2@gmail.com',
				password: '123456',
				parrain: '012345678901234567891234'
			};
			execute('postUser', tools.clone(params), function (err, res) {
				should.exist(err);
				err.message.should.include('not found');
				done();
			});
		});
		test('Should not create user with unknown parrain', function (done) {
			var params = {
				email: 'atinux2@gmail.com',
				password: '123456',
				parrain: _user.id
			};
			execute('postUser', tools.clone(params), function (err, res) {
				should.not.exist(err);
				res.parrain.should.be.equal(_user.id);
				done();
			});
		});
	});
});