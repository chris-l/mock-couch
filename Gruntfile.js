/* jslint node: true */
'use strict';
module.exports = function (grunt) {

  grunt.initConfig({
    pkg     : grunt.file.readJSON('package.json'),
    jshint  : {
      all     : [ 'package.json', 'Gruntfile.js', 'index.js', 'lib/**/*.js', 'test/**/*.js' ]
    },
    'jasmine-node' : {
      options : {
        coffee  : false,
        noStack : false
      },
      run     : {
        spec    : "test/"
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine-node');

  // Default task(s).
  grunt.registerTask('default', [
    'jshint',
    'jasmine-node'
  ]);

};

