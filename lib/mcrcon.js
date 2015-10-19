/**
 * Created by pim on 22/12/14.
 */

'use strict';

var debug = require('debug')('mcrcon:mcrcon');
var assert = require('chai').assert;
var net = require('net');

var packetUtils = require('./packet.js');

function MCrcon(passwd) {

    this.passwd = passwd;

    this.rconClient = null;
    this.responseHandlers = {};
}

MCrcon.prototype.connect = function(options, callback) {
    options = options || {};
    options.port = options.port || 25575;
    options.host = options.host || '127.0.0.1';

    assert.ok(this.rconClient === null, 'already connected rconClient');

    debug('connecting to: "%j"', options);
    this.rconClient = net.connect(options, (function() {
        assert.ok(this.rconClient !== null, 'not connected rconClient');
        debug('connection established');

        this.rconClient
            .once('data', (function(data) {
                debug('auth response');
                var response = packetUtils.response(data);

                if (response.type === packetUtils.type.SERVERDATA_AUTH_RESPONSE && response.id === 0) {

                    this.rconClient.on('data', (function(data) {
                        debug('response on command received');

                        var response = packetUtils.response(data);

                        if (this.responseHandlers.hasOwnProperty(response.id)) {
                            var handler = this.responseHandlers[response.id];
                            delete this.responseHandlers[response.id];

                            if (response.message.substr(0, 'Unknown command.'.length) === 'Unknown command.') {
                                return handler(new Error('Unknown command'));
                            } else {
                                return handler(null, response);
                            }

                        } else {
                            debug('no handler for id: %s', response.id);
                        }
                    }).bind(this));

                    this.rconClient.on('error', (function(err) {
                        debug('failure on command received');

                        for (var handler in this.responseHandlers) {
                            if (this.responseHandlers.hasOwnProperty(response.id)) {
                                return handler(err);
                            }
                        }
                        this.responseHandlers = {};

                    }).bind(this));

                    return callback();

                } else if (response.type === packetUtils.type.SERVERDATA_AUTH_RESPONSE && response.id === -1) {

                    this.close();
                    return callback(new Error('client auth failure'));

                } else {

                    this.close();
                    return callback(new Error('server auth failure'));

                }

            }).bind(this))
            .on('close', (function() {
                debug('connection closed by server');

                // 'this.rconClient' might be/equals 'null', i.e. connection closed by server,
                // If next connection setup immediately after a failed connection setup.
                if (this.rconClient !== null) {
                    this.rconClient.end();
                    this.rconClient = null;
                }
            }).bind(this));

        debug('send auth');
        this.rconClient.write(packetUtils.auth({ 'id': 0, 'passwd': this.passwd }));
    }).bind(this));
    this.rconClient.on('error', function(err){
        return callback(err);
    });
};

MCrcon.prototype.close = function() {
    //assert.ok(this.rconClient !== null, 'already closed rconClient');

    if (this.rconClient !== null) {
        this.rconClient.end();
        this.rconClient = null;
        debug('connection closed');
    } else {
        debug('connection already closed');
    }

};

MCrcon.prototype.command = function (packet, handler) {
    //assert.ok(this.rconClient !== null, 'closed rconClient');

    if (this.rconClient !== null) {
        this.responseHandlers[packet.id] = handler;
        this.rconClient.write(packetUtils.command(packet));
        debug('command send');
    } else {
        return handler(new Error('Not connected'));
    }
};


module.exports = MCrcon;

