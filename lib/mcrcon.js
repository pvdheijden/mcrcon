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
        this.rcon_client = net.connect({ 'host': this.host, 'port': this.port }, (function() {
            debug('connection established');

            this.rcon_client
                .once('data', (function(data) {
                    debug('auth response');
                    var response = packet_utils.response(data);

                    if (response.id === -1) {
                        this.close();
                        return callback(new Error('auth failure'));
                    } else {

                        this.rcon_client.on('data', (function(data) {
                            debug('response received');

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

                        return callback();
                    }
                }).bind(this))
                .on('close', (function() {
                    this.rcon_client.end();
                    debug('connection closed');
                }).bind(this));

            this.rcon_client.write(packet_utils.auth({ 'id': 0, 'passwd': passwd }));
            debug('send auth');
        }).bind(this));
        this.rcon_client.on('error', function(err){
            return callback(err);
        });
    };

    this.close = function() {
        this.rcon_client.end();
        debug('connection closed');
    };

    this.command = function (packet, handler) {
        this.response_handlers[packet.id] = handler;
        try {
            this.rcon_client.write(packet_utils.command(packet));
            debug('command send');
        } catch(err) {
            debug('command send failed');
            delete this.response_handlers[packet.id];
            return handler(err);
        }
    };
};
