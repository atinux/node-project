/*
** Global configuration
*/

var config = {
	name: 'Node Project',
	host: 'www.your-url.com',
	protocol: 'http',
	lang: 'fr', // Used for moment() and numeral()
	port: 2000
};

if (_PRODUCTION_) {
	config.port = 80;
	// config.protocol = 'https';
}

config.port = Number(process.env.PORT || config.port);
module.exports = config;