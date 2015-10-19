/* jshint -W030 */

var expect = require('chai').expect;

var MCrcon = require('../lib/mcrcon');
var host = process.env.HOST || 'minecraft-server.zifzaf.net';
var port = parseInt(process.env.PORT || 25575, 10);
var password = process.env.PASSWORD;

describe('mcrcon functions', function() {

    var mcrcon = null;
    before(function(done) {
        mcrcon = new MCrcon(host, port);
        done();
    });

    it('connect should be a function', function() {
        expect(mcrcon.connect).to.be.a('function');
    });

    it('close should be a function', function() {
        expect(mcrcon.close).to.be.a('function');
    });

    it('command should be a function', function() {
        expect(mcrcon.command).to.be.a('function');
    });

});

describe('connection', function() {

    it('should fail with incorrect password', function(done) {
        var mcrcon = new MCrcon('WRONG_PASSWD');
        mcrcon.connect({ port: port, host: host }, function(err) {
            expect(err === undefined).to.be.false;

            done();
        });
    });

    it('should succeed with correct password', function(done) {
        var mcrcon = new MCrcon(password);
        mcrcon.connect({ port: port, host: host }, function(err) {
            expect(err === undefined).to.be.true;

            mcrcon.close();
            done();
        });
    });
});

describe('command while not connected', function() {

    var mcrcon = null;
    before(function(done) {
        mcrcon = new MCrcon(host, port);
        done();
    });

    it('existing command should fail', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'list' }, function(err, response) {
            expect(err !== null).to.be.true;
            expect(response === undefined).to.be.true;

            done();
        });
    });

    it('invalid command should fail', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'invalid' }, function(err, response) {
            expect(err !== null).to.be.true;
            expect(response === undefined).to.be.true;

            done();
        });
    });

});

describe('invalid command', function() {

    var mcrcon = null;
    before(function(done) {
        mcrcon = new MCrcon(password);
        mcrcon.connect({ port: port, host: host }, function(err) {
            if (err) {
                return done(err);
            }

            done();
        });
    });

    after(function(done) {
        mcrcon.close();

        done();
    });

    it('should fail for invalid command', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'invalid' }, function(err, response) {
            expect(err !== null).to.be.true;
            expect(response === undefined).to.be.true;

            done();
        });
    });

});


describe('all commands', function() {

    var mcrcon = null;
    before(function(done) {
        mcrcon = new MCrcon(password);
        mcrcon.connect({ port: port, host: host }, function(err) {
            if (err) {
                return done(err);
            }

            done();
        });
    });

    it('support list command', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'list' }, function(err, response) {
            expect(err === null).to.be.true;
            expect(response).to.have.property('id', 1);
            expect(response).to.have.property('type', 0);
            expect(response).to.have.property('message');

            done();
        });
    });

    it('support whitelist list command', function(done) {
        mcrcon.command({ 'id': 2, 'message': 'whitelist list' }, function(err, response) {
            expect(err === null).to.be.true;
            expect(response).to.have.property('id', 2);
            expect(response).to.have.property('type', 0);
            expect(response).to.have.property('message');

            done();
        });
    });

    after(function(done) {
        mcrcon.close();

        done();
    });
});

/*jshint +W030 */
