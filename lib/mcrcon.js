/**
 * Created by pim on 22/12/14.
 */

'use strict';

var debug = require('debug')('mcrcon:mcrcon');
var assert = require('chai').assert;
var net = require('net');

var packet_utils = require('./packet.js');

module.exports = function(host, port) {
    assert.isString(host, 'host');
    assert.isNumber(port, 'port');

    this.host = host;
    this.port = port;

    this.rcon_client = null;
    this.response_handlers = {};

    this.connect = function(passwd, callback) {
        assert.ok(this.rcon_client === null, 'already connected rcon_client');

        debug('connecting to: "%s:%s"', this.host, this.port);
        this.rcon_client = net.connect({ 'host': this.host, 'port': this.port }, (function() {
            assert.ok(this.rcon_client !== null, 'not connected rcon_client');
            debug('connection established');

            this.rcon_client
                .once('data', (function(data) {
                    debug('auth response');
                    var response = packet_utils.response(data);

                    if (response.type === packet_utils.type.SERVERDATA_AUTH_RESPONSE && response.id === 0) {

                        this.rcon_client.on('data', (function(data) {
                            debug('response on command received');

                            var response = packet_utils.response(data);

                            if (this.response_handlers.hasOwnProperty(response.id)) {
                                var handler = this.response_handlers[response.id];
                                delete this.response_handlers[response.id];

                                if (response.message.substr(0, 'Unknown command.'.length) === 'Unknown command.') {
                                    return handler(new Error('Unknown command'));
                                } else {
                                    return handler(null, response);
                                }

                            } else {
                                debug('no handler for id: %s', response.id);
                            }
                        }).bind(this));

                        this.rcon_client.on('error', (function(err) {
                            debug('failure on command received');

                            for (var handler in this.response_handlers) {
                                if (this.response_handlers.hasOwnProperty(response.id)) {
                                    return handler(err);
                                }
                            }
                            this.response_handlers = {};
                        }).bind(this));

                        return callback();

                    } else if (response.type === packet_utils.type.SERVERDATA_AUTH_RESPONSE && response.id === -1) {
                        this.close();
                        return callback(new Error('client auth failure'));
                    } else {
                        this.close();
                        return callback(new Error('server auth failure'));
                    }
                }).bind(this))
                .on('close', (function() {
                    debug('connection closed by server');

                    // 'this.rcon_client' might be/equals 'null', i.e. connection closed by server,
                    // If next connection setup immediately after a failed connection setup.
                    if (this.rcon_client !== null) {
                        this.rcon_client.end();
                        this.rcon_client = null;
                    }
                }).bind(this));

            this.rcon_client.write(packet_utils.auth({ 'id': 0, 'passwd': passwd }));
            debug('send auth');
        }).bind(this));
        this.rcon_client.on('error', function(err){
            return callback(err);
        });
    };

    this.close = function() {
        //assert.ok(this.rcon_client !== null, 'already closed rcon_client');

        if (this.rcon_client !== null) {
            this.rcon_client.end();
            this.rcon_client = null;
            debug('connection closed');
        } else {
            debug('connection already closed');
        }

    };

    this.command = function (packet, handler) {
        //assert.ok(this.rcon_client !== null, 'closed rcon_client');

        if (this.rcon_client !== null) {
            this.response_handlers[packet.id] = handler;
            this.rcon_client.write(packet_utils.command(packet));
            debug('command send');
        } else {
            return handler(new Error('Not connected'));
        }
    };
};
