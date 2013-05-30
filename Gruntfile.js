/**
 * Gruntfile to create the build (zip) of the chrome extension.
 */

var markdown = require('marked');
var semver = require('semver');

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('manifest.json'),
        bump: {
            options: {
                file: 'manifest.json'
            }
        },
        zip: {
            release: {
                src: [
                    '_locales/**',
                    'css/**',
                    'img/**',
                    'js/**',
                    'html/**',
                    'images/**',
                    'LICENCE',
                    'manifest.json'
                ],
                dest: 'target/pathmarks-' + grunt.file.readJSON('manifest.json').version + '.zip'
            }
        },
        clean: ["target"]
    });

    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', 'zip');
};