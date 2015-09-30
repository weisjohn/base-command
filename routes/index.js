
'use strict';

module.exports = function(conf, logger, router) {

    router.get('/', function(req, res) {
        return res.send({ 'hello': 'world' });
    });

}