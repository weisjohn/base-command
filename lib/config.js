
'use strict';

var path = require('path');
var nconf = require('nconf');

module.exports = function() {

    // find the environment based config files
    function conf_path(name) {
        return path.join(__dirname, '..', 'config', name + '.json');
    }
    var file, env = process.env.NODE_ENV;

    if (/^prod(uction)/.test(env)) file = 'production';
    if (/^dev(elopment)|local?/.test(env)) file = 'development';
    if (/^test(ing)?/.test(env)) file = 'test';

    // setup config
    return nconf.argv().env('_')
        .file('custom', conf_path(file) )
        .file({ file: conf_path('default') });
};
