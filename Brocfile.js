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
 * Global
 *******************************************************/
var bowerTree = 'bower_components';
var appAssetsTree = 'app/assets/';

/******************************************************
 * Stylesheets Assets
 *******************************************************/
var jqueryUIThemeName = 'custom';
var jqueryUIThemePath = 'jquery-ui/themes/' + jqueryUIThemeName + '/';
var jqueryUIThemeTree = new Funnel(bowerTree, {
  srcDir: 'jquery-ui/themes/' + jqueryUIThemeName
});
var jqueryUIThemeImageTree = new Funnel(jqueryUIThemeTree, {
  srcDir: 'images'
});

var vendorCssFiles = [
    jqueryUIThemePath + 'jquery-ui.min.css'
];

var vendorCss = concatFiles(bowerTree, {
  inputFiles: vendorCssFiles,
  outputFile: '/vendor.css'
});

var appCss = compileSass(appAssetsTree, {
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
var vendorFiles = null;
if (env === 'production') {
  vendorFiles = [
    'jquery/dist/jquery.min.js',
    'jquery-ui/jquery-ui.min.js',
    'ember/ember.min.js',
    'ember-model/ember-model.js',
    'handlebars/handlebars.runtime.min.js'
  ]; 
}
else {
  vendorFiles = [
    'jquery/dist/jquery.min.js',
    'jquery-ui/jquery-ui.min.js',
    'ember/ember.debug.js',
    'ember-model/ember-model.js',
    'handlebars/handlebars.runtime.js'
  ]; 
}

var appJS = concatFiles(appTree, {
  inputFiles: appFiles,
  outputFile: '/app_bundle.js'
});

var vendorJS = concatFiles(bowerTree, {
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
 * Images
 *******************************************************/
var jqueryUIImages= new Funnel(jqueryUIThemeImageTree, {
  destDir: 'styles/images'
});

/******************************************************
 * Fonts
 *******************************************************/
var vendorFonts = new Funnel(bowerTree, {
  srcDir: 'font-awesome/fonts',
  destDir: 'fonts'
});

appJS = new Funnel(appJS, {destDir: 'js'});
appTemplates = new Funnel(appTemplates, {destDir: 'js'});
vendorJS = new Funnel(vendorJS, {destDir: 'js'});
vendorCss = new Funnel(vendorCss, {destDir: 'styles'});

module.exports = mergeTrees([appJS, appTemplates, vendorJS, appCss, vendorCss,jqueryUIImages, vendorFonts], {overwrite: true});
