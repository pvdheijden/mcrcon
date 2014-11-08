'use strict';

var net = require('net');

var packet_utils = require('./packet-utils.js');

var rcon_client;
var response_handlers = {};

var connect = function(options, passwd, callback) {

    rcon_client = net.connect(options, function() {

        console.error('connection established');

        rcon_client.on('data', function(data) {
            var response = packet_utils.response(data);

            if (response.id === -1) {
                return callback(new Error('command failure'));
            } else {
                if (response_handlers.hasOwnProperty(response.id)) {
                    response_handlers[response.id](response);
                    delete response_handlers[response.id];
                } else {
                    console.log('no next for id: %s', response.id);
                }
            }
        });

        rcon_client.on('end', function () {
            console.error('connection ended');
        });

        response_handlers[0] = function(response) {
            return callback();
        };
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

connect({
    'port': process.env.PORT || 25575,
    'host': process.env.HOST || 'minecraft-server.zifzaf.net'
}, process.env.PASSWD || '', function(err) {

    if (err) {
        console.log('authentication failure');

        close();
    } else {

        command({ 'id': 14, 'message': 'list' }, function(response) {
            console.dir(response);
        });
        command({ 'id': 12, 'message': 'whitelist list' }, function(response) {
            console.dir(response);
        });

        close();
    }
});
