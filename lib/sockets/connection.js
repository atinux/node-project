io.on('connection', function (socket) {
	var session = socket.request.session;
	// You can update session like a hash (session.hello = 'World!';)
	// but you need to use session.save() to save it to RedisStore (and update req.session)

	// Add the user to a room
	var roomId = session.userId;
	socket.join(roomId);
	// Now, we can use in express routes: io.in(req.session.userId).emit('eventName', data);
	// To send to all users: io.emit('eventName', data)
	// List of users in a specific room: io.getUserSockets('roomId')
	// List of rooms used and sockets ids: io.getUserSockets()
});

io.getUserRoom = function (userId) {
	if (!userId)
		return null;
	return io.sockets.in(userId);
};
io.user = io.getUserRoom; // We can do io.user('userID') to use actual user connected sockets :)

io.getUserSockets = function (userId) {
	return _.compact(io.sockets.sockets.map(function (socket) {
		if (userId && socket.rooms.indexOf(userId) === -1)
			return null;
		return _(socket).pick('id', 'rooms');
	}));
};
