'use strict';

var debug = require('debug')('mcrcon:packet');

var type = {
    'SERVERDATA_AUTH': 3,
    'SERVERDATA_AUTH_RESPONSE': 2,
    'SERVERDATA_EXECCOMMAND': 2,
    'SERVERDATA_RESPONSE_VALUE': 0
};

var command = function(packet) {

    debug('rcon packet command: %j', packet);

    var dataSize =
        4 + // 32 bits LE integer for size of packet excl. size
        4 + // 32 bits LE integer for packet_id
        4 + // 32 bits LE integer for type field
        Buffer.byteLength(packet.message) +
        2;  // terminating 0x00

    var data = new Buffer(dataSize);

    data.fill(0x00);
    data.writeInt32LE(dataSize - 4, 0);
    data.writeInt32LE(packet.id, 4);
    data.writeInt32LE(packet.type || type.SERVERDATA_EXECCOMMAND, 8);
    data.write(packet.message, 12, dataSize - 12, 'ascii');

    debug('rcon data command: %j', data);

    return data;
};

var response = function(data) {

    debug('rcon data response: %j', data);

    var packet = {
        'id': data.readInt32LE(4),
        'type': data.readInt32LE(8),
        'message': data.toString('ascii', 12, data.length - 2)
    };

    debug('rcon packet response: %j', packet);

    return packet;
};

var auth = function(packet) {
    return command({
        'id': packet.id || 0,
        'type': type.SERVERDATA_AUTH,
        'message': packet.passwd
    });
};

module.exports.type = type;
module.exports.auth = auth;
module.exports.command = command;
module.exports.response = response;

