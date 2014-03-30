exports.RegExpEscape = function (s) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
};

exports.phoneFormat = function (phone) {
	if (!phone || typeof phone !== 'string')
		return phone;
	if (phone.indexOf('+33') !== -1 || /^[0-9]{10}$/.test(phone)) {
		phone = phone.replace(/^\+33/, '0').replace(/^([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})$/, '$1 $2 $3 $4 $5');
	}
	return phone;
};