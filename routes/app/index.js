var midd = require('../midd');

// Application routes
app.get('/', function (req, res) {
	res.render('home');
});

// app.get('/logout', function (req, res) {
// 	req.execute('logout', function (err) {
// 		res.redirect('/');
// 	});
// });

// app.all('/connexion', function (req, res) {
// 	var _err = null;
// 	var render = function () {
// 		res.render('home/login', {
// 			type: 'login',
// 			err: _err,
// 			hash: req.hash
// 		})
// 	};
// 	if (req.method === 'POST') {
// 		req.execute('login', tools.clone(req.hash), function (err, result) {
// 			if (result)
// 				return res.redirect('/jeu');
// 			_err = _codesToText(err) || err.message;
// 			render();
// 		});
// 		return;
// 	}
// 	render();
// });

// app.all('/inscription', function (req, res) {
// 	var _err = null;
// 	var render = function () {
// 		res.render('home/signup', {
// 			type: 'signup',
// 			err: _err,
// 			hash: req.hash
// 		})
// 	};
// 	if (req.method === 'POST') {
// 		req.execute('signup', tools.clone(req.hash), function (err, result) {
// 			if (result)
// 				return res.redirect('/jeu');
// 			_err = _codesToText(err) || err.message;
// 			render();
// 		});
// 		return;
// 	}
// 	render();
// });

// app.all('/motdepasseperdu', function (req, res) {
// 	var _err = null;
// 	var render = function () {
// 		res.render('home/lostpwd', {
// 			type: 'lostpwd',
// 			err: _err
// 		})
// 	};
// 	// A FAIRE
// 	/*if (req.method === 'POST') {
// 		req.execute('lostpwd', req.hash, function (err, result) {
// 			if (result)
// 				return res.redirect('/jeu');
// 			_err = _codesToText(err) || err.message;
// 			render();
// 		});
// 		return;
// 	}*/
// 	render();
// });

// app.get('/jeu', midd.member, function (req, res) {
// 	// Tester si le caracter a été créer sinon renvoyé sur la module de création 'begin'
// 	res.render('game', {type: 'jeu'});
// });
// app.get('/avatar', midd.member, function (req, res) {
// 	res.render('avatar', {type: 'avatar'});
// });
// app.get('/perso', midd.member, function (req, res) {
// 	res.render('perso', {type: 'perso'});
// });
// app.get('/clan', midd.member, function (req, res) {
// 	res.render('team', {type: 'clan'});
// });
// app.get('/bonus', midd.member, function (req, res) {
// 	res.render('bonus', {type: 'bonus'});
// });
// app.get('/community', midd.member, function (req, res) {
// 	res.render('community', {type: 'community'});
// });
// app.get('/options', midd.member, function (req, res) {
// 	res.render('options', {type: 'options'});
// });
// app.get('/admin', midd.member, function (req, res) {
// 	res.render('admin', {type: 'accueil'});
// });