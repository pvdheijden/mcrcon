var should = require('should');

var mcrcon = require('../index')({
    'port': process.env.PORT || 25575,
    'host': process.env.HOST || 'minecraft-server.zifzaf.net'
});

describe('mcrcon functions', function() {

    it('connect should exist', function () {
        should.exist(mcrcon.connect);
    });

    it('connect should be a function', function() {
        mcrcon.connect.should.be.an.instanceof(Function);
    });

    it('close should exist', function () {
        should.exist(mcrcon.close);
    });

    it('close should be a function', function() {
        mcrcon.close.should.be.an.instanceof(Function);
    });

    it('command should exist', function () {
        should.exist(mcrcon.command);
    });

    it('command should be a function', function() {
        mcrcon.command.should.be.an.instanceof(Function);
    });

});

describe('connection', function() {

    /*jshint -W030 */
    it('should fail with incorrect password', function(done) {
        mcrcon.connect('12Blieps25', function(err) {
            (err === undefined).should.be.false;

            done();
        });
    });

    it('should succeed with correct password', function(done) {
        mcrcon.connect('12Blieps24', function(err) {
            (err === undefined).should.be.true;

            done();
        });
    });
    /*jshint -W030 */

    it('should close', function(done) {
        mcrcon.close();

        done();
    });

});

describe('invalid command', function() {

    before(function(done) {
        mcrcon.connect('12Blieps24', function() {
            done();
        });
    });

    it('should fail for invalid command', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'invalid' }, function(response) {
            response.should.have.properties({
                'id': 1,
                'type': 0,
                'message': 'Unknown command. Try /help for a list of commands'
            });

            done();
        });
    });

    after(function(done) {
        mcrcon.close();

        done();
    });
});


describe('all commands', function() {

    before(function(done) {
        mcrcon.connect('12Blieps24', function() {
            done();
        });
    });

    it('support list command', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'list' }, function(response) {
            response.should.have.properties({
                'id': 1,
                'type': 0
            });
            response.should.have.property('message');

            done();
        });
    });

    it('support whitelist list command', function(done) {
        mcrcon.command({ 'id': 2, 'message': 'whitelist list' }, function(response) {
            response.should.have.properties({
                'id': 2,
                'type': 0
            });
            response.should.have.property('message');

            done();
        });
    });

    after(function(done) {
        mcrcon.close();

        done();
    });

});

