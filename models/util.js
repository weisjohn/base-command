
'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');

module.exports = function(conf, logger) {

    var util = {};

    util.plugins = {

        deleted : require('mongoose-deleted'),
        hash: require('mongoose-bcrypt-simple'),
        history : require('mongoose-history-log'),
        references : require('mongoose-reference-validator'),
        csv : require('mongoose-csv'),

        persist : function(schema) {

            schema.on('error', function(err) { logger.error(err); });

            // wrap mongoose-supplied save method to bind to our loggers
            schema.methods.persist = function(fn) {
                var doc = this;
                doc.save(function(err, results) {
                    if (err) {
                        // clean up errors from mongoose validation
                        _.each(_.keys(err.errors), function(key) {
                            err.errors[key] = err.errors[key].message;
                        });

                        // if there's a validation error, remove the stack trace
                        if (err.name === 'ValidationError') delete err.stack;

                        logger.error({ err: err, doc : doc });
                    }
                    fn(err, results);
                });
            };

        },

    };

    // handle mongoose schema integration
    util.register = function(schema, name) {

        // if the model is already registered, delete it
        if (mongoose.models[name]) {
            delete mongoose.models[name];
            delete mongoose.modelSchemas[name];
        }

        // extend every schema with a persist, history object, soft-delete
        schema.plugin(util.plugins.persist);
        schema.plugin(util.plugins.history, { history : true });
        schema.plugin(util.plugins.deleted);
        schema.plugin(util.plugins.csv, name);

        return mongoose.model(name, schema);
    };

    return util;
};
