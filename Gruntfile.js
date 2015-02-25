module.exports = function (grunt) {
  // Dev Assets Path
  var assetDevRootPath = 'app/assets/';
  var jsDevPath = assetDevRootPath + 'javascripts';
  var stylesDevPath = assetDevRootPath + 'stylesheets'
  
  // Production Assets Path
  var assetDistRootPath = 'public/assets/';
  var jsDistPath = assetDistRootPath + 'js';
  var stylesDistPath = assetDistRootPath + 'styles';
  var fontsDistPath = assetDistRootPath + 'fonts';
  
  var LIVERELOAD_PORT = 8000;
  
  // Load the tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-broccoli-fc');

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    /*********************************************
     * Front-end work flow tasks
     *  - clean
     *  - bower copy
     ********************************************/
    clean: {
      build: {
        src: [assetDistRootPath]
      }
    },
    
    /**
     * Bowercopy: copy the required assets to proper directories
     **/
    bowercopy: {
      options: {
        destPrefix: 'vendor/assets',
        clean: false
      },
      stylesheets_js: {
        files: {
          // Bootstrap
          'stylesheets/bootstrap': 'bootstrap-sass-official/assets/stylesheets/_bootstrap.scss',
          'stylesheets/bootstrap/bootstrap': 'bootstrap-sass-official/assets/stylesheets/bootstrap',
          'javascripts/bootstrap-min.js': 'bootstrap-sass-official/assets/javascripts/bootstrap.min.js',
          
          // Font-awesome
          'stylesheets/font-awesome': 'font-awesome/scss/*.scss',

          // jQuery
          'javascripts/jquery-min.js': 'jquery/dist/jquery.min.js'
        }
      },
      fonts: {
        files: {
          'fonts/font-awesome': 'font-awesome/fonts',
        }
      }
    },
    broccoli: {
      dev: {
        env:  'development',
        dest: 'public/assets/',
        config: 'Brocfile.js'
      },
      prod: {
        env:  'production',
        dest: 'public/assets/',
        config: 'Brocfile.js'
      }
    }
  });
  
  // Register Tasks
  grunt.registerTask('default', 'build:debug');
  grunt.registerTask('watch', 'build:watch');
  grunt.registerTask('clear', 'build:clean');

  grunt.registerTask('build', ['build:debug']);
  grunt.registerTask('build:debug', ['clear', 'broccoli:dev:build']);
  grunt.registerTask('build:prod', ['clear', 'broccoli:prod:build']);
  grunt.registerTask('build:watch', ['clear', 'broccoli:dev:watch']);
  grunt.registerTask('build:clean', ['clean']);
};
