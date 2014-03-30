var should = require('should');

suite('tools.merge(obj1, obj2)', function () {
	test('Merge different keys', function () {
		var obj1 = {
			name: 'Henri'
		};
		var obj2 = {
			age: 21
		};
		// Call it baby
		tools.merge(obj1, obj2);
		// Check
		obj1.should.be.eql({
			name: 'Henri',
			age: 21
		});
	});
	test('Merge sames keys (string vs string)', function () {
		var obj1 = {
			name: 'Henri'
		};
		var obj2 = {
			name: 'Paul'
		};
		// Call it baby
		tools.merge(obj1, obj2);
		// Check
		obj1.should.be.eql({
			name: 'Paul'
		});
	});
	test('Merge sub-levels', function () {
		var obj1 = {
			you: {
				cant: {
					beat: 'me'
				}
			}
		};
		var obj2 = {
			you: {
				cant: {
					sing: {
						Adele: true
					}
				}
			}
		};
		tools.merge(obj1, obj2);
		obj1.should.be.eql({
			you: {
				cant: {
					beat: 'me',
					sing: {
						Adele: true
					}
				}
			}
		});
	});
	test('Remove keys = null with ._deleteIfNull = true', function () {
		var obj1 = {
			coucou: 'test',
			key: true
		};
		var obj2 = {
			key: null,
			_deleteIfNull: true
		};
		tools.merge(obj1, obj2);
		obj1.should.be.eql({
			coucou: 'test'
		});
	});
	test('Remove keys = null with ._deleteIfNull = true (only in the level where is the key)', function () {
		var obj1 = {
			coucou: 'test',
			key: true,
			subLevel: {
				brand: 'Apple'
			}
		};
		var obj2 = {
			key: null,
			subLevel: {
				brand: null,
				key: null,
				_deleteIfNull: true
			}
		};
		tools.merge(obj1, obj2);
		obj1.should.be.eql({
			coucou: 'test',
			key: null,
			subLevel: {}
		});
	});
});