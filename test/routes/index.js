
'use strict';

var util = require('../util');
var request = require('supertest');

var agent;

before(function(done) {
    agent = request(util.server);
    done();
});

describe('/', function() {
    it('get', function(done) {
        agent.get('/index/')
            .expect(200)
            .expect({ hello : 'world' })
            .end(done);
    });
});
