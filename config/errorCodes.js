module.exports = function (error, sep) {
	var codes = [];
	if (typeof error !== 'object')
		codes = _.compact([ error ]);
	else if (Array.isArray(error.codes))
		codes = error.codes;
	else
		codes = error;
	sep = sep || '<br>';
	var text = [];
	codes.forEach(function (code) {
		text.push(_codes[code] || 'Code ['+code+'] non reconnu.');
	});
	return text.join(sep);
};

var _codes = {
	"email-format": "Le format de l'adresse email est invalide.",
	"email-taken": "Cette adresse email est déjà prise par un ninja de Todori.",
	"password-format": "Le format du mot de passe est invalide (6 caractères minimum).",
	"repassword-format": "Le format de la confirmation du mot de passe est invalide.",
	"passwords-different": "Le mot de passe et sa confirmation ne sont pas égaux.",
	"rules-false": "Vous devez accepter le règlement pour vous inscrire.",
	"login-fail": "Vos identifiants sont incorrects."
};