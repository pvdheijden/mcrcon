'use strict';

var debug = require('debug')('mcrcon');
var net = require('net');

var packet_utils = require('./packet-utils.js');

module.exports = function(options) {

    var rcon_client;
    var response_handlers = {};

    var connect = function(passwd, callback) {
        rcon_client = net.connect(options, function() {

            debug('connection established');

            rcon_client.on('close', function () {
                debug('connection closed');
            });

            rcon_client.once('data', function(data) {
                var response = packet_utils.response(data);

                if (response.id === -1) {
                    close();
                    return callback(new Error('auth failure'));
                } else {

                    rcon_client.on('data', function(data) {
                        var response = packet_utils.response(data);

                        if (response_handlers.hasOwnProperty(response.id)) {
                            var handler = response_handlers[response.id];
                            delete response_handlers[response.id];

                            if (response.message.substr(0, 'Unknown command.'.length) === 'Unknown command.') {
                                return handler(new Error('Unknown command'));
                            } else {
                                return handler(null, response);
                            }

                        } else {
                            debug('no handler for id: %s', response.id);
                        }
                    });

                    return callback();
                }
            });
            rcon_client.write(packet_utils.auth({ 'id': 0, 'passwd': passwd }));
        });
    };

    var close = function() {
        rcon_client.end();
    };

    var command = function (packet, handler) {
        try {
            response_handlers[packet.id] = handler;
            rcon_client.write(packet_utils.command(packet));
        } catch(err) {
            delete response_handlers[packet.id];
            return handler(err);
        }
    };

    return {
        'connect': connect,
        'close': close,
        'command': command
    };
};
