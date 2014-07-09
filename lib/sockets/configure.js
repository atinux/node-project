global.io = require('socket.io')(server);

// var redis = require('socket.io-redis');
// io.adapter(redis(_config.session.server));
// Do things that don't scale (at first)

// Old version
// io.configure('production', function () {
// 	io.set('log level', 1);
// 	io.enable('browser client minification'); // send minified client
// 	io.enable('browser client etag'); // apply etag caching logic based on version number
// 	io.enable('browser client gzip'); 
// 	io.set('transports', [
// 		// 'websocket',
// 		// 'htmlfile',
// 		'xhr-polling',
// 		'jsonp-polling'
// 	]);
// 	// io.set('polling duration', 10);
// 	io.set('origins', _config.protocol + _config.host + ':*'); // Authorize only the website to connect to sockets
// });