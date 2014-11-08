'use strict';

var SERVERDATA_AUTH = 3;
var SERVERDATA_AUTH_RESPONSE = 2;
var SERVERDATA_EXECCOMMAND = 2;
var SERVERDATA_RESPONSE_VALUE = 0;

var command = function(packet) {

    var data_size =
        4 + // 32 bits LE integer for size of packet excl. size
        4 + // 32 bits LE integer for packet_id
        4 + // 32 bits LE integer for type field
        Buffer.byteLength(packet.message) +
        2;  // terminating 0x00

    var data = new Buffer(data_size);

    data.fill(0x00);
    data.writeInt32LE(data_size - 4, 0);
    data.writeInt32LE(packet.id, 4);
    data.writeInt32LE(packet.type || SERVERDATA_EXECCOMMAND, 8);
    data.write(packet.message, 12, data_size - 12, 'ascii');

    console.error('rcon command: ', data);

    return data;
};

var response = function(data) {

    console.error('rcon response: ', data);

    return {
        'id': data.readInt32LE(4),
        'type': data.readInt32LE(8),
        'message': data.toString('ascii', 12, data.length - 2)
    };

};

var auth = function(packet) {
    return command({
        'id': packet.id || 0,
        'type': SERVERDATA_AUTH,
        'message': packet.passwd
    });
};

module.exports = {
    'command': command,
    'response': response,
    'auth': auth
};

