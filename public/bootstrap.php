<?php

session_start();

if (!defined('__DIR__')) {
   define('__DIR__', dirname(__FILE__));
}
define('ROOT_PATH'  , __DIR__.'/../');
define('VENDOR_PATH', __DIR__.'/../vendor/');
define('APP_PATH'   , __DIR__.'/../app/');
define('PUBLIC_PATH', __DIR__.'/../public/');

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

$mode = $config['slim']['mode'];
$dbConfig = $config['database'][$mode];
\App\Helpers\DBConFactory::config($dbConfig['connection']);

/**
 * Initialize Slim Application
 **/
$app = new SlimCustom($config['slim']);

/** 
 * Register controllers to container
 **/
$app->container->singleton('App/Dashboard', function($container) {
  return new \App\Controller\DashboardController($app);
});
$app->container->singleton('App/Projects', function($container) {
  return new \App\Controller\ProjectsController($app);
});
$app->container->singleton('App/Tasks', function($container) {
  return new \App\Controller\TasksController($app);
});


$app->get('/test', function() {
  echo 'hello';
});

$app->get('/', function() {
  $content = file_get_contents('index.html');
  echo($content);
});


$app->post('/sessions', '\App\Controller\SessionsController:create');
$app->post('/sessions/verify', '\App\Controller\SessionsController:verify');
$app->delete('/sessions', '\App\Controller\SessionsController:destroy');

$app->get('/projects', '\App\Controller\ProjectsController:index');
$app->post('/projects', '\App\Controller\ProjectsController:create');
$app->put('/projects/:property', '\App\Controller\ProjectsController:update');

$app->post('/tasks', '\App\Controller\TasksController:create');
$app->get('/tasks/project', '\App\Controller\TasksController:findByProject');
$app->get('/tasks/due', '\App\Controller\TasksController:findDueInDays');
$app->put('/tasks/:id', '\App\Controller\TasksController:updateTask');

$app->run();
