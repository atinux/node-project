var numeral = require('numeral');

// Set languages
numeral.language('fr', {
	delimiters: {
		thousands: '.',
		decimal: ','
	},
	abbreviations: {
		thousand: 'k',
		million: 'm'
	},
	ordinal : function (number) {
		return number === 1 ? 'er' : 'ème';
	},
	currency: {
		symbol: '€'
	}
});

exports.numberFormat = function (number, decimal) {
	if (parseInt(number) === number && !decimal)
		return numeral.language(_config.lang)(number).format('0,0.[00]');
	if (decimal === 1)
		return numeral.language(_config.lang)(number).format('0,0.0');
	return numeral.language(_config.lang)(number).format('0,0.00');
};

var round = function (number, decimal) {
	return +((+number).toFixed(decimal || 0));
};
var ceil = function (number, decimal) {
	decimal = decimal || 0;
	var sum = Math.pow(10, decimal);
	return round(Math.ceil(+number * sum) / sum, decimal);
};
var floor = function (number, decimal) {
	decimal = decimal || 0;
	var sum = Math.pow(10, decimal);
	return this.round(Math.floor(+number * sum) / sum, decimal);
};
exports.round = round;
exports.ceil = ceil;
exports.floor = floor;

exports.random = function (from, to) {
	return Math.floor(Math.random()*(to-from+1)+from);
};