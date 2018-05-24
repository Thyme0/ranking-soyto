module.exports = function(grunt) {
  'use strict';

  require('./app/assets/lib/javascript.extensions');
  require('load-grunt-tasks')(grunt);
  require('./nodeApp/blog.tasks.js')(grunt);
  require('./nodeApp/application.tasks.js')(grunt);
  require('./nodeApp/gameforge.server.tasks')(grunt);

  var $q = require('q');
  var request = require('request');
  var semver = require('semver');
  var sh = require('shelljs');
  var colors = require('colors');
  var config = require('./nodeApp/config.js');
  var $log = require('./nodeApp/log.js');

  var licenseTxt = grunt.file.read('LICENSE');

  var license = '/*\n * Soyto.github.io (<%= pkg.version %>)\n';
  licenseTxt.split('\n').forEach(function(line){
    license += ' * ' + line + '\n';
  });
  license += ' */\n';


  /* GRUNT CONFIG
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   */

  var gruntConfig = {};

  //PACKAGE
  gruntConfig.pkg = grunt.file.readJSON('package.json');

  //JSHINT
  gruntConfig.jshint = {
    options : {jshintrc: '.jshintrc', 'force': true},
    app: config.application['app-files'],
    'node-app': config.application['node-app-files']
  };

  //CONCAT
  gruntConfig.concat  = {
    options: { banner: license },
    app: {
      options: {separator: '\n\n' },
      src: config.application['app-files'],
      dest: config.application['concat-dest'],
      nonull: true
    }
  };

  //UGLIFY
  gruntConfig.uglify = {
    options: { banner: license },
    app: {
      src: [config.application['concat-dest']],
      dest: config.application['uglify-dest'],
    }
  };

  //WATCH
  gruntConfig.watch = {
    options: {
      debounceDelay: 250,
      dateFormat: function(time) {
        $log.debug('The watch finished in %s', colors.cyan(time));;
        $log.debug('Waiting for more changes');
      }
    },
    app: {
      files: config.application['app-files'],
      tasks: [
        'jshint:app',
        'concat:app',
        'uglify:app'
      ]
    }
  };

  grunt.initConfig(gruntConfig);


  /* GRUNT TASKS
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   */

  //Default task, just jshint , concat and iglify for the moment
  grunt.registerTask('default', function(){
    grunt.task.run('compile');
  });

  //Compiles application
  grunt.registerTask('compile', function(){
    grunt.task.run('generate-blog-files');
    grunt.task.run('jshint:app');
    grunt.task.run('concat:app');
    grunt.task.run('uglify:app');
  });
};
