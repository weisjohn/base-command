
'use strict';

var async = require('async');
var express = require('express');

var app = module.exports = express();
app.set('port', process.env.PORT || 8000);


/*
 * lib dep injection
 */

var config = require('./lib/config')();
async.eachSeries([
    'logger',
    'mongo',
    'routes',
], function(name, cb) {

    // conditional configuration for test mode
    var _conf = config.get(name) || {};
    if (config.get('test')) _conf.test = true;

    // a child logger instance
    var logger = (name !== 'logger') ? require('./lib/logger')(name) : null;

    // dep injection
    require('./lib/' + name)(_conf, logger, app, cb);

}, function(err) {
    app.set('logger', require('./lib/logger')('server'));
    middleware();
    app.emit('start');
});

function middleware() {
    app.use(require('./lib/logger').middleware());
}
