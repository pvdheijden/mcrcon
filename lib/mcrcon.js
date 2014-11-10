'use strict';

var net = require('net');

var packet_utils = require('./packet-utils.js');

module.exports = function(options) {

    var rcon_client;
    var response_handlers = {};

    var connect = function(passwd, callback) {
        rcon_client = net.connect(options, function() {

            console.error('connection established');

            rcon_client.on('close', function () {
                console.error('connection closed');
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
                            response_handlers[response.id](response);
                            delete response_handlers[response.id];
                        } else {
                            console.error('no handler for id: %s', response.id);
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
        response_handlers[packet.id] = handler;
        rcon_client.write(packet_utils.command(packet));
    };

    return {
        'connect': connect,
        'close': close,
        'command': command
    };
};
