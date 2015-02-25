var Funnel                  = require('broccoli-funnel');
var mergeTrees              = require('broccoli-merge-trees');
var findBowerTrees          = require('broccoli-bower');
var uglifyJavaScript        = require('broccoli-uglify-js');
var compileTemplates        = require('ember-cli-htmlbars');
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
    'handlebars/handlebars.runtime.min.js'
  ]; 
}
else {
  vendorFiles = [
    'jquery/dist/jquery.min.js',
    'ember/ember.debug.js',
    'handlebars/handlebars.runtime.js'
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

/******************************************************
 * Handlebars Templates Compile
 *******************************************************/
var templatesTree = new Funnel(appTree, {
  srcDir: 'templates',
  destDir: 'templates'
});
var appTemplates = compileTemplates(templatesTree, {
  module: false,
  isHTMLBars: true,
  templateCompiler: require('./bower_components/ember/ember-template-compiler')
});
appTemplates = concatFiles(appTemplates, {
  inputFiles: ['**/*.js'],
  outputFile: '/templates.js'
});

/******************************************************
 * Fonts
 *******************************************************/
var vendorFontsTree = 'vendor/assets/fonts';
var appFonts = new Funnel(vendorFontsTree, {
  srcDir: 'font-awesome',
  destDir: 'fonts'
});

appJS = new Funnel(appJS, {destDir: 'js'});
appTemplates = new Funnel(appTemplates, {destDir: 'js'});
vendorJS = new Funnel(vendorJS, {destDir: 'js'});

module.exports = mergeTrees([appJS, appTemplates, vendorJS, appCss, appFonts], {overwrite: true});
