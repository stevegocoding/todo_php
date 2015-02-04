<?php

if (!defined('__DIR__')) {
   define('__DIR__', dirname(__FILE__));
}
define('ROOT_PATH'  , __DIR__.'/');
define('VENDOR_PATH', __DIR__.'/vendor/');
define('APP_PATH'   , __DIR__.'/app/');
define('PUBLIC_PATH', __DIR__.'/public/');

require VENDOR_PATH.'autoload.php';

$config = array(
    'path.root'     => ROOT_PATH,
    'path.public'   => PUBLIC_PATH,
    'path.app'      => APP_PATH
);

foreach(glob(ROOT_PATH . 'config/*.php') as $configFile) {
  require $configFile;
}

/** Merge cookies configs to slim's config */ 
if (isset($config['cookies'])) {
  foreach($config['cookies'] as $configKey => $configValue) {
    $config['slim']['cookies' . $configKey] = $configValue;
  }
}

/**
 * Initialize Slim Application
 **/
$app = new SlimCustom($config['slim']);

/** 
 * Register controllers to container
 **/
$app->container->singleton('App/Home', function($container) {
  return new \App\Controller\HomeController($app);
});

$app->get('/', '\App\Controller\HomeController:hello');

return $app;
