/*
** Global configuration
*/

var config = {
	name: 'Basket Courts',
	host: 'www.basketcourts.com',
	protocol: 'http',
	lang: 'fr', // Used for moment() and numeral()
	port: 2000
};

if (_PRODUCTION_) {
	config.port = 80;
}

config.port = Number(process.env.PORT || config.port);
module.exports = config;