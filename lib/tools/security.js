var crypto = require('crypto');

// Method to cryptage
exports.password = function (password) {
	var nb = password.length * 247945 % 143 * 14;
	return this.md5(this.sha512('todori' + password.slice(0, 3) + nb + password.slice(3) + 'A&S'));
};
exports.md5 = function (str) {
	return crypto.createHash('md5').update(str).digest("hex").toString();
};
exports.sha1 = function (str) {
	return crypto.createHash('sha1').update(str).digest("hex").toString();
};
exports.sha256 = function (str) {
	return crypto.createHash('sha256').update(str).digest("hex").toString();
};
exports.sha512 = function (str) {
	return crypto.createHash('sha512').update(str).digest("hex").toString();
};
exports.generatePassword = function (specialChars, length) {
	length = length || 8;
	specialChars = specialChars || false;
	
	var sPassword = "", num;
	for (var i = 0; i < length; i++) {
		num = Math.floor(Math.random() * 1000) % 94 + 33;
			if (!specialChars)
				while ((num >= 33 && num <= 47) || (num >= 58 && num <= 64) || (num >= 91 && num <= 96) || (num >= 123 && num <= 126))
					num = Math.floor(Math.random() * 1000) % 94 + 33;
			sPassword += String.fromCharCode(num);
	}
	return sPassword;
};
exports.generateToken = function () {
	return this.md5('Limitless' + this.generatePassword(true, 25) + +new Date);
};
