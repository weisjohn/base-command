
'use strict';

var path = require('path');
var fs = require('fs');

var express = require('express');
var mongoose = require('mongoose');

// dep injection for routes
module.exports = function(conf, logger, app, cb) {

    var routes = path.join(__dirname, '..', 'routes');
    fs.readdirSync(routes).forEach(function (file) {
        if (file === 'util.js') return;

        var name = file.split('.')[0];
        if (!name) return;

        var model;
        try { model = mongoose.model(name); } catch(e) {}
        var _logger = require('./logger')('route:' + name);

        logger.info('register:' + name);

        // dep inject
        var router = express.Router();
        require(path.join(routes, file))(model, _logger, router);

        // allow index to bind to /
        if (name === 'index') name = '';

        // generic router path
        app.use('/' + name, router);
    });

    logger.info('registered');

    cb();
};
