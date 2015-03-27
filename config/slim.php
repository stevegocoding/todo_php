<?php
$config['slim'] = array(
  'mode' => 'development',

  'debug' => true,

  // Logging
  'log.writer' => null,
  'log.level' => \Slim\Log::DEBUG,
  'log.enabled' => true, 

  // HTTP
  'http.version' => '1.1', 

  // Route
  'routes.case_senstive' => true 
);
