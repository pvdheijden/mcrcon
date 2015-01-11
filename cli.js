#!/usr/bin/env node

'use strict';
var debug = require('debug')('mcrcon:cli');

var argv = require('minimist')(process.argv.slice(2));

var host, port;
if (argv._[0]) {
    host = argv._[0].split(':')[0];
    port = argv._[0].split(':')[1];
}
if (!host) {  host = process.env.HOST || '127.0.0.1'; }
if (!port) {  port = process.env.PORT || 25575; }

var password = argv.p || argv.password;

debug('connecting to minecraft server at %s:%d with password %s', host, port, password);

if (!port || !host || !password) {
    console.log('usage: mcrcon -p<password>  <host:port>');
    process.exit(0);
}

var mcrcon = require('./lib/mcrcon')({ 'port': port, 'host': host });
mcrcon.connect(password, function(err) {
    if(err) {
        console.error('error connecting to %s:%d [%s]', host, port, err.message);
        process.exit(1);
    }

    var mc_commands = {
        'achievement    ': 'Gives a player an achievement.',
        'ban            ': 'Adds player to banlist.',
        'ban-ip         ': 'Adds IP address to banlist.',
        'banlist        ': 'Displays banlist.',
        'blockdata      ': 'Modifies the data tag of a block.',
        'clear          ': 'Clears items from player inventory.',
        'clone          ': 'Copies blocks from one place to another.',
        'debug          ': 'Starts or stops a debugging session.',
        'defaultgamemode': 'Sets the default game mode.',
        'deop           ': 'Revoke operator status from a player.',
        'difficulty     ': 'Sets the difficulty level.',
        'effect         ': 'Add or remove status effects.',
        'enchant        ': 'Enchants a player item.',
        'entitydata     ': 'Modifies the data tag of an entity.',
        'execute        ': 'Executes another command.',
        'fill           ': 'Fills a region with a specific block.',
        'gamemode       ': 'Sets a player\'s game mode.',
        'gamerule       ': 'Sets or queries a game rule value.',
        'give           ': 'Gives an item to a player.',
        'help           ': 'Provides help for commands.',
        'kick           ': 'Kicks a player off a server.',
        'kill           ': 'Kills entities (players, mobs, items, etc.).',
        'list           ': 'Lists players on the server.',
        'me             ': 'Displays a message about yourself.',
        'op             ': 'Grants operator status to a player.',
        'pardon         ': 'Removes entries from the banlist.',
        'particle       ': 'Creates particles.',
        'playsound      ': 'Plays a sound.',
        'publish        ': 'Opens single-player world to local network.',
        'replaceitem    ': 'Replaces items in inventories.',
        'save-all       ': 'Saves the server to disk.',
        'save-off       ': 'Disables automatic server saves.',
        'save-on        ': 'Enables automatic server saves.',
        'say            ': 'Displays a message to multiple players.',
        'scoreboard     ': 'Manages objectives, players, and teams.',
        'seed           ': 'Displays the world seed.',
        'setblock       ': 'Changes a block to another block.',
        'setidletimeout ': 'Sets the time before idle players are kicked.',
        'setworldspawn  ': 'Sets the world spawn.',
        'spawnpoint     ': 'Sets the spawn point for a player.',
        'spreadplayers  ': 'Teleports entities to random locations.',
        'stats          ': 'Update objectives from command results.',
        'stop           ': 'Stops a server.',
        'summon         ': 'Summons an entity.',
        'tell           ': 'Displays a private message to other players.',
        'tellraw        ': 'Displays a JSON message to players.',
        'testfor        ': 'Counts entities matching specified conditions.',
        'testforblock   ': 'Tests whether a block is in a location.',
        'testforblocks  ': 'Tests whether the blocks in two regions match.',
        'time           ': 'Changes or queries the world\'s game time.',
        'title          ': 'Manages screen titles.',
        'toggledownfall ': 'Toggles the weather.',
        'tp             ': 'Teleports entities.',
        'trigger        ': 'Sets a trigger to be activated.',
        'weather        ': 'Sets the weather.',
        'whitelist      ': 'Manages server whitelist.',
        'worldborder    ': 'Manages the world border.',
        'xp             ': 'Adds or removes player experience.'
    };

    var completions = [];
    for (var command in mc_commands) {
        if (mc_commands.hasOwnProperty(command)) {
            completions.push(command);
        }
    }

    function completer(message_partial) {
        return [
            completions.filter(function(completion) { return completion.indexOf(message_partial) === 0; }),
            message_partial
        ];
    }

    var id = 1;

    var readline = require('readline').createInterface(process.stdin, process.stdout, completer);
    readline.setPrompt('MCrcon> ');
    readline.prompt();

    readline
        .on('line', function(message) {
            readline.pause();

            message = message.trim();
            switch(message) {
                case '.help':
                    console.log('<minecraft command> [args]');
                    console.log('.commands (or TAB) for list of commands');
                    console.log('.exit to exit the application.');
                    readline.prompt();
                    break;

                case '.commands':
                    for (var command in mc_commands) {
                        if (mc_commands.hasOwnProperty(command)) {
                            console.log(command + ': ' + mc_commands[command]);
                        }
                    }
                    readline.prompt();
                    break;

                case '.exit':
                    readline.question('Are you sure you want to exit? ', function(answer) {
                        if (answer.match(/^y(es)?$/i)) {
                            readline.close();
                        }
                    });
                    break;

                default:
                    if (message[0] === '.') {
                        console.log('unknown command');
                        readline.prompt();
                    } else {
                        mcrcon.command({ 'id': id, 'message': message.trim() }, function(err, response) {
                            if (err) {
                                console.error('error sending command \'%s\' [%s]', message, err.message);
                            } else {
                                console.log(response.message);
                            }
                            id++;

                            readline.prompt();
                        });
                    }
                    break;
            }
        })
        .on('close', function() {
            mcrcon.close();
            process.exit(0);
        });
});
