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
      dev: {
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
          'fonts': 'font-awesome/fonts',

          // jQuery
          'javascripts/jquery-min.js': 'jquery/dist/jquery.min.js'
        }
      }
    },
    compass: {
      dist: {
        options: {
          specify: stylesDevPath + '/app.scss',
          cssDir: stylesDistPath,
          environment: 'production',
          outputStyle: 'compressed'
        }
      },
      dev: {
        options: {
          sassDir: stylesDevPath,
          cssDir: stylesDistPath,
          relativeAssets: false,
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
        files: [stylesDevPath + '/*.scss'],
        tasks: ['compass:dev']                             
      }
    }
  });
  
  // Register Tasks
  grunt.registerTask('default', ['watch']);
};
