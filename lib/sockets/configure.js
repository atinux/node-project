global.io = require('socket.io').listen(server);
// Do things that don't scale (at first)
// Je l'ai désactivé, même si ça marche très bien, car socket.io v1 n'a plus Redis (à voir comment ils vont faire pour les multi instances)
// Le prolème de redis avec socket.io (version 0.9.X) est qu'il ne supprimme pas les pub_sub dans Redis et créer des memories leaks
// Il suffit d'activer ces lignes plus bas, de démarrer deux instances de node.js (node app.js et PORT=2001 node app.js)
// UPDATE: la V1 est sortie, à voir comment je peux l'implémenter, mais c'est bien parti !
// Aller sur http://localhost:2000 et http://localhost:2001 en se connectant, puis pour chaque serveur, d'aller sur /api/session/sockets
// Actualiser la page du jeu pour chaque serveur, et de voir qu'il y a des anciennes sessions qui restent stocké dans le tableau
// Pour voir les pub_sub sur Redis : redis-cli info | grep pubsub_channels | sed s/pubsub_channels://
// Lignes à reactiver si besoin de scaler :
// var RedisStore = require('socket.io/lib/stores/redis'),
// 	redis  = require('socket.io/node_modules/redis'),
// 	pub    = redis.createClient(_config.session.server.port, _config.session.server.host, _config.session.server),
// 	sub    = redis.createClient(_config.session.server.port, _config.session.server.host, _config.session.server),
// 	client = redis.createClient(_config.session.server.port, _config.session.server.host, _config.session.server);

// if (_config.session.server.pass) {
// 	pub.auth(_config.session.server.pass, function (err) { if (err) throw err; });
// 	sub.auth(_config.session.server.pass, function (err) { if (err) throw err; });
// 	client.auth(_config.session.server.pass, function (err) { if (err) throw err; });
// }
// io.set('store', new RedisStore({
// 	redis: redis,
// 	redisPub: pub,
// 	redisSub: sub,
// 	redisClient: client
// }));
io.configure('production', function () {
	io.set('log level', 1);
	io.enable('browser client minification'); // send minified client
	io.enable('browser client etag'); // apply etag caching logic based on version number
	io.enable('browser client gzip'); 
	io.set('transports', [
		// 'websocket',
		// 'htmlfile',
		'xhr-polling',
		'jsonp-polling'
	]);
	// io.set('polling duration', 10);
	io.set('origins', _config.protocol + _config.host + ':*'); // Authorize only the website to connect to sockets
});