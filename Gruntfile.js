/*jslint node: true, indent: 2 */
'use strict';
module.exports = function (grunt) {

  grunt.initConfig({
    pkg     : grunt.file.readJSON('package.json'),
    jslint  : {
      all     : {
        src : [ 'package.json', 'Gruntfile.js', 'index.js', 'lib/**/*.js', 'test/**/*.js' ],
        directives : {
          indent : 2,
          node   : true,
          nomen  : true,
          regexp : true
        },
        options : {
          edition: 'es5'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-jasmine-nodejs');

  // Default task(s).
  grunt.registerTask('default', [
    'jslint'
  ]);

};

