/*
** Database configuration
*/

var server = {
	host: 'localhost',
	port: 27017,
	username: '',
	password: '',
	dbName: 'boilerplate'
};

if (process.env.LOCAL) {
	server.host = 'localhost';
	server.port = 27017;
	server.username = server.password = '';
}

if (_TEST_) {
	server.host = 'localhost';
	server.port = 27017;
	server.username = server.password = '';
	server.dbName = 'boilerplate-tests';
}

if (_PRODUCTION_) {
	// server.host = '...';
	// server.username = '...';
	// server.password = '...';
}

exports.collections = [
	'User'
];

exports.indexes = {
	// Collection: [ fields ]
	'User': ['email'],
	// unique indexes
	uniques: {
		'User': ['email']
	}
};

exports.server = server;