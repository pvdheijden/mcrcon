module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        'jshint': {
            'lint': {
                'options': {
                    'jshintrc': '.jshintrc',
                    'reporter': require('jshint-stylish')
                },
                'src': [
                    'index.js',
                    'lib/**/*.js',
                    'test/**/*.js'
                ]
            }
        },

        'mocha_istanbul': {
            'coverage': {
                'src': 'test',
                'options': {
                    'print': 'detail',
                    'reporter': 'spec'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-npm-install');
    grunt.registerTask('install', ['npm-install']);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.registerTask('test', ['jshint', 'mocha_istanbul']);

    // Default task(s).
    grunt.registerTask('all', ['npm-install', 'jshint', 'mocha_istanbul']);

};