module.exports = function (grunt) {
  // Dev Assets Path
  var assetDevRootPath = 'app/assets/';
  var jsDevPath = assetDevRootPath + 'javascripts';
  var stylesDevPath = assetDevRootPath + 'stylesheets';
  
  // Production Assets Path
  var assetDistRootPath = 'public/assets/';
  var jsDistPath = assetDistRootPath + 'javascripts';
  var stylesDistPath = assetDistRootPath + 'stylesheets';
  
  var LIVERELOAD_PORT = 8000;
  
  // Load the tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-bowercopy');

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: [jsDistPath + '/*.js', stylesDistPath + '/*.css', 'vendor/assets']
      }
    },
    bowercopy: {
      options: {
        // Bower components folder will be removed afterwards 
        clean: false
      },
      stylesheets_js: {
        options: {
          destPrefix: 'vendor/assets'
        },
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
        options: {
          destPrefix: 'public/assets/fonts'
        },
        files: {
          'public/assets/fonts': 'font-awesome/fonts',
        }
      }
    },
    compass: {
      /*
      dist: {
        options: {
          specify: stylesDevPath + '/app.scss',
          cssDir: stylesDistPath,
          environment: 'production',
          outputStyle: 'compressed'
        }
      },
      */
      dev: {
        options: {
          sassDir: stylesDevPath,
          cssDir: stylesDistPath,
          relativeAssets: false,
          require: 'susy',
          environment: 'development',
          outputStyle: 'expanded'
        }
      }
    },
    watch: {
      liverelaod: {
        options: {
          livereload: true
        },
        files: ['app/views/*.twig', 'app/views/layout/*.twig']
      },
      scss: {
        files: [stylesDevPath + '/**/*.scss'],
        tasks: ['compass:dev'],
        options: {
          livereload: true
        }
        
      }
    }
  });
  
  // Register Tasks
  grunt.registerTask('default', ['compass:dev', 'watch']);
};
