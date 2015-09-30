
'use strict';

var app = require('./index');
var server = module.exports = require('http').createServer(app);
server.app = app;

// only start listening if required
if (!module.parent) server.listen(app.get('port'), function() {
    console.log('listening', 8000);
});
