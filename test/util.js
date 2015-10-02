
'use strict';

var util = module.exports = {};
var mongoose = require('mongoose');

// set test environment to test immediately
process.env.NODE_ENV = 'test';

// setup a server
var server = util.server = require('../server');

before(function(done) {
    server.app.on('start', function() {
        done();
    });
});

// handle close down events
after(function(done) {
    mongoose.disconnect();
    server.close();
    done();
});
