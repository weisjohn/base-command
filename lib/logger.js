
'use strict';

var bunyan = require('bunyan');
var be = require('bunyan-express');

var conf;

// dep injection
module.exports = function(_conf, noarg, app, cb) {
    if (_conf) conf = _conf;

    // support for other modules
    module.exports = logger;

    // kraken middleware support
    module.exports.middleware = function() {
        return be(logger('request'), {});
    };

    if (typeof cb === 'function') return cb();
    return logger;
};

// conditional stream configuration
function logger(name) {
    var log = !conf.test || process.env.LOG === 'true';
    return bunyan.createLogger({
        name: name,
        streams: (!log) ? [] : [{
            level: 'info',
            stream : process.stdout
        }]
    });
}
