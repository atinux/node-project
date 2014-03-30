io.sockets.on('connection', function (socket) {
	var session = socket.handshake.session;
	// You can update session like a hash (session.hello = 'World!';)
	// but you need to use session.save() to save it to RedisStore (and update req.session)

	// Add the user to a room
	var roomId = session.userId;
	socket.join(roomId);
	// Now, we can use in express routes: io.sockets.in(req.session.userId).emit('eventName', data);
	// To send to all users: io.sockets.emit('eventName', data)
	// List of users in a specific room: io.sockets.clients('roomId')
	// List of rooms used and sockets ids: io.sockets.manager.rooms
});

io.getUserSocketIds = function (userId) {
	return _.pluck(io.sockets.clients(userId) || [], 'id');
};
io.getUserRoom = function (userId) {
	if (!userId)
		return null;
	return io.sockets.in(userId);
};
io.getUsersSockets = function () {
	return io.sockets;
};
io.sockets.user = io.getUserRoom; // We can do io.sockets.user('userID') to use user actual connected sockets :)