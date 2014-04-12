/* jslint node: true */
'use strict';
module.exports = function (grunt) {

  grunt.initConfig({
    pkg     : grunt.file.readJSON('package.json'),
    jshint  : {
      all     : [ 'package.json', 'Gruntfile.js', 'index.js', 'lib/**/*.js' ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', [
      'jshint'
    ]
  );

};

