
'use strict';

var mongoose = require('mongoose');
var msf = require('mongoose-simple-fixtures');

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');

// generate connection string based on configuration
function conn_string(conf) {

    var conn = 'mongodb://';

    // optional authentication
    if (conf.user && conf.pass) conn += conf.user + ':' + conf.pass + '@';

    conn += conf.host + ':' + conf.port + '/' + conf.name;

    // optional test database name
    if (conf.test) conn += '-test';

    return conn;
}


module.exports = function (conf, logger, app, cb) {

    // handle default connection string details
    conf.connection = _.assign({
        user: false,
        pass: false,
        host: 'localhost',
        port: '27017',
    }, conf.connection);

    // configuration for connection string
    if (conf.test) conf.connection.test = true;
    mongoose.connect(conn_string(conf.connection));

    // logger integration
    var db = mongoose.connection;
    db.on('error', function(err) { logger.error(err); });

    db.once('open', function() {
        logger.info('open');
        on_connect(cb);
    });

    // what to do on a successfull connection
    function on_connect(cb) {

        var base = path.resolve(__dirname, '..');

        // register models
        var models = path.join(base, 'models');

        // load in the models
        async.each(fs.readdirSync(models), function (file, cb) {
            if (file === 'util.js') return cb();

            // dep injection for models
            var name = file.split('.')[0];
            var _logger = require('./logger')('model:' + name);
            var _conf = conf[name] || {};
            _conf.test = conf.test;
            var util = require('../models/util')(_conf, _logger);

            logger.info('register:' + name);

            require(path.join(models, file))(_conf, _logger, util);

            // if not testing, or if in production, bolt
            if (!conf.test || !/dev|test|loc/.test(process.env.NODE_ENV))
                return cb();

            // wipe out that collection
            mongoose.model(name).remove({}, cb);

        }, function(err) {
            if (err) logger.error(err);

            // init models with fixture data
            var fixture_path = path.resolve(path.join(base, 'fixtures'));

            msf(mongoose, fixture_path, false, function(err, results) {
                if (err) logger.error(err);
                _.each(results, function(result) {
                    if (result.added || result.failed)
                        logger.info( _.pick(result, 'name', 'added', 'failed', 'skipped') );
                });

                cb();
            });

        });

    }

};
