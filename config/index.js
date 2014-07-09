var config = require('./global');
config.database = require('./database');
config.session = require('./session');
config.basicAuth = require('./basicAuth');

module.exports = config;