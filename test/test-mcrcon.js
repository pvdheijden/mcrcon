var expect = require('chai').expect;

var password = process.env.PASSWORD;
var mcrcon = require('../lib/mcrcon')({
    'port': process.env.PORT || 25575,
    'host': process.env.HOST || 'minecraft-server.zifzaf.net'
});

describe('mcrcon functions', function() {

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
        mcrcon.connect('WRONG_PASSWD', function(err) {
            /*jshint -W030 */
            expect(err === undefined).to.be.false;
            /*jshint +W030 */

            done();
        });
    });

    it('should succeed with correct password', function(done) {
        mcrcon.connect(password, function(err) {
            /*jshint -W030 */
            expect(err === undefined).to.be.true;
            /*jshint +W030 */

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
            expect(err !== null).to.be.true;
            expect(response === undefined).to.be.true;
            /*jshint +W030 */

            done();
        });
    });

    it('invalid command should fail', function(done) {
        mcrcon.command({ 'id': 1, 'message': 'invalid' }, function(err, response) {
            /*jshint -W030 */
            expect(err !== null).to.be.true;
            expect(response === undefined).to.be.true;
            /*jshint +W030 */

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
            expect(err !== null).to.be.true;
            expect(response === undefined).to.be.true;
            /*jshint +W030 */

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
            expect(err === null).to.be.true;
            /*jshint +W030 */
            expect(response).to.have.property('id', 1);
            expect(response).to.have.property('type', 0);
            expect(response).to.have.property('message');

            done();
        });
    });

    it('support whitelist list command', function(done) {
        mcrcon.command({ 'id': 2, 'message': 'whitelist list' }, function(err, response) {
            /*jshint -W030 */
            expect(err === null).to.be.true;
            /*jshint +W030 */
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

