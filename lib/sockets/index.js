/*
** Socket.IO system
*/
// Create io global variable
require('./configure');
// Check Session (from Express & Redis)
// Add socket.handshake.session
// Can update the session with socket.handshake.session.save();
require('./auth');

// Connected users (and dispatching with rooms)
require('./connection');