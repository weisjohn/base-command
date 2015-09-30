
'use strict';

// set test environment to test immediately
process.env.NODE_ENV = 'test';

// setup a server
var server = require('../server');

module.exports = {
    server: server,
    app: server.app,
};

