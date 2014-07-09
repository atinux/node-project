var api_key = '';
var domain = 'basketcourts.com';
var mailgun = require('mailgun-js')(api_key, domain);

var data = {
	from: 'Sebastien <contact@basketcourts.com>',
	to: 'atinux@gmail.com',
	subject: 'Hello',
	html: 'Testing some Mailgun <b>awesomness</b>!'
};

mailgun.messages.send(data, function (error, response, body) {
	console.log(body);
});