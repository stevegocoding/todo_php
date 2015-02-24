var Funnel                  = require('broccoli-funnel');
var mergeTrees              = require('broccoli-merge-trees');
var findBowerTrees          = require('broccoli-bower');
var uglifyJavaScript        = require('broccoli-uglify-js');
var concatFiles             = require('broccoli-concat');
var compileSass             = require('broccoli-compass');
var debug                   = require('broccoli-stew').debug;

/******************************************************
 * Build Environment
 ******************************************************/
var env = process.env.BROCCOLI_ENV || 'development';

/******************************************************
 * Stylesheets Assets
 *******************************************************/
var stylesTree = new Funnel('app/assets/', {
});

var appCss = compileSass(stylesTree, {
  files: ['stylesheets/app.scss'],
  outputStyle: 'expanded',
  sassDir: 'stylesheets',
  imagesDir: 'images/',
  require: 'susy',
  relativeAssets: false,
  cssDir: './'
});

appCss = new Funnel(appCss, {
  files: ['app.css'],
  destDir: 'styles'
});

/******************************************************
 * Javascrpts Assets
 *******************************************************/
var appTree = 'app/assets/javascripts';
var appFiles = ['**/*.js'];
var vendorTree = 'bower_components';
var vendorFiles = null;
if (env === 'production') {
  vendorFiles = [
    'jquery/dist/jquery.min.js',
    'ember/ember.min.js',
    'ember/ember-template-compiler.js',
    'handlebars/handlebars.min.js'
  ]; 
}
else {
  vendorFiles = [
    'jquery/dist/jquery.min.js',
    'ember/ember.debug.js',
    'ember/ember-template-compiler.js',
    'handlebars/handlebars.js'
  ]; 
}

var appJS = concatFiles(appTree, {
  inputFiles: appFiles,
  outputFile: '/app_bundle.js'
});

var vendorJS = concatFiles(vendorTree, {
  inputFiles: vendorFiles,
  outputFile: '/vendor.js'
});

if (env === 'production') {
  appJS = uglifyJavaScript(appJS, {
    mangle: false,
    compress: false
  });
}

appJS = new Funnel(appJS, {destDir: 'js'});
vendorJS = new Funnel(vendorJS, {destDir: 'js'});

module.exports = mergeTrees([appJS, vendorJS, appCss], {overwrite: true});
