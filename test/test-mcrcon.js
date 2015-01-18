var should = require('should');

var password = process.env.PASSWORD;
var mcrcon = require('../lib/mcrcon')({
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

    it('should fail with incorrect password', function(done) {
        mcrcon.connect('WRONG_PASSWD', function(err) {
            /*jshint -W030 */
            (err === undefined).should.be.false;
            /*jshint -W030 */

            done();
        });
    });

    it('should succeed with correct password', function(done) {
        mcrcon.connect(password, function(err) {
            /*jshint -W030 */
            (err === undefined).should.be.true;
            /*jshint -W030 */

            done();
        });
    });

    it('should close', function(done) {
        mcrcon.close();

        done();
    });

});

describe('command while not connected', function() {

    it('existing command should fail', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'list' }, function(err, response) {
            /*jshint -W030 */
            (err !== null).should.be.true;
            (response === undefined).should.be.true;
            /*jshint -W030 */

            done();
        });
    });

    it('invalid command should fail', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'invalid' }, function(err, response) {
            /*jshint -W030 */
            (err !== null).should.be.true;
            (response === undefined).should.be.true;
            /*jshint -W030 */

            done();
        });
    });

});

describe('invalid command', function() {

    before(function(done) {
        mcrcon.connect(password, function() {
            done();
        });
    });

    it('should fail for invalid command', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'invalid' }, function(err, response) {
            /*jshint -W030 */
            (err !== null).should.be.true;
            (response === undefined).should.be.true;
            /*jshint -W030 */

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
        mcrcon.connect(password, function() {
            done();
        });
    });

    it('support list command', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'list' }, function(err, response) {
            /*jshint -W030 */
            (err === null).should.be.true;
            /*jshint -W030 */
            response.should.have.properties({
                'id': 1,
                'type': 0
            });
            response.should.have.property('message');

            done();
        });
    });

    it('support whitelist list command', function(done) {
        mcrcon.command({ 'id': 2, 'message': 'whitelist list' }, function(err, response) {
            /*jshint -W030 */
            (err === null).should.be.true;
            /*jshint -W030 */
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

