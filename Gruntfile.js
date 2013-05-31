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

    grunt.registerTask('changeToProdIcon', 'Change the icon in the manifest file', function() {
        var manifest = grunt.file.readJSON('manifest.json');
        manifest.browser_action.default_icon['19'] = 'images/icon19.png';
        manifest.browser_action.default_icon['38'] = 'images/icon38.png';
        manifest.icons['16'] = 'images/icon16.png';
        manifest.icons['48'] = 'images/icon48.png';
        manifest.icons['128'] = 'images/icon128.png';
        grunt.file.write('manifest.json', JSON.stringify(manifest, null, '  ') + '\n');
    });

    grunt.registerTask('changeToDevIcon', 'Change the icon in the manifest file', function() {
        var manifest = grunt.file.readJSON('manifest.json');
        manifest.browser_action.default_icon['19'] = 'images/icon-dev19.png';
        manifest.browser_action.default_icon['38'] = 'images/icon-dev38.png';
        manifest.icons['16'] = 'images/icon-dev16.png';
        manifest.icons['48'] = 'images/icon-dev48.png';
        manifest.icons['128'] = 'images/icon-dev128.png';
        grunt.file.write('manifest.json', JSON.stringify(manifest, null, '  ') + '\n');
    });

    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['changeToProdIcon', 'zip', 'changeToDevIcon']);
};