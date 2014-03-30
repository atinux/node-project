var midd = require('./midd');
app.all('*', midd.request);

// Add API routes
require('./api');

// Add APP routes
require('./app');