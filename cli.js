#!/usr/bin/env node

'use strict';
var debug = require('debug')('mcrcon:cli');

var MCrcon = require('./lib/mcrcon');

var cli = function(argv) {

    argv = require('minimist')(argv.slice(2));
    debug('presented command-line parameters: %j', argv);

    var password = argv._[0];
    var host = argv.h || argv.host || process.env.HOST || '127.0.0.1';
    var port = parseInt(argv.p || argv.port || process.env.PORT || '25575');
    var message = argv.c || argv.command;

    debug('    password: %s', password);
    debug('    host: %s', host);
    debug('    port: %s', port);
    debug('    message: %s', message);

    if (!port || !host || !password) {
        console.log('usage: mcrcon <password> [-h <host>] [-p <port>] [-c <command>]');
        process.exit(0);
    }

    debug('connecting to minecraft server at %s:%d with password %s', host, port, password);
    var mcrcon = new MCrcon(password);
    mcrcon.connect({ port: port, host: host }, function (err) {
        if (err) {
            console.error('error connecting to %s:%d [%s]', host, port, err.message);
            process.exit(1);
        }

        if (message) {
            mcrcon.command({'id': 1, 'message': message.trim()}, function (err, response) {
                if (err) {
                    console.error('error sending command \'%s\' [%s]', message, err.message);
                } else {
                    console.log(response.message);
                }

                mcrcon.close();
                process.exit(0);
            });
        } else {

            var commands = require('./lib/commands.json');
            var completer = function() {
                var completions = [];
                for (var command in commands) {
                    if (commands.hasOwnProperty(command)) {
                        completions.push(command);
                    }
                }

                return function (partial) {
                    return [
                        completions.filter(function (completion) {
                            return completion.indexOf(partial) === 0;
                        }),
                        partial
                    ];
                };
            };

            var id = 1;

            var readline = require('readline').createInterface(process.stdin, process.stdout, completer());
            readline.setPrompt('MCrcon> ');
            readline.prompt();

            readline
                .on('line', function (message) {
                    readline.pause();

                    message = message.trim();
                    switch (message) {
                        case '.help':
                            console.log('<minecraft command> [args]');
                            console.log('.commands (or TAB) for list of commands');
                            console.log('.exit to exit the application.');
                            readline.prompt();
                            break;

                        case '.commands':
                            for (var command in commands) {
                                if (commands.hasOwnProperty(command)) {
                                    console.log(command + ': ' + commands[command]);
                                }
                            }
                            readline.prompt();
                            break;

                        case '.exit':
                            readline.question('Are you sure you want to exit? ', function (answer) {
                                if (answer.match(/^y(es)?$/i)) {
                                    readline.close();
                                }
                            });
                            break;

                        default:
                            if (message[0] === '.') {
                                console.log('unknown command');
                                readline.prompt();
                            } else if (message === 'stop') {
                                console.log('\'stop\' command is disabled');
                                readline.prompt();
                            } else {
                                mcrcon.command({'id': id, 'message': message.trim()}, function (err, response) {
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
                .on('close', function () {
                    mcrcon.close();
                    process.exit(0);
                });
        }

    });
};

cli(process.argv);
