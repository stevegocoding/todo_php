<?php
$config['slim'] = array(
  'mode' => 'development',

  'debug' => true,

  // Logging
  'log.writer' => null,
  'log.level' => \Slim\Log::DEBUG,
  'log.enabled' => true, 

  // View
  'view' => new \Slim\Views\Twig(),
  'templates.path' => APP_PATH.'views',

  // HTTP
  'http.version' => '1.1', 

  // Route
  'routes.case_senstive' => true 
);
