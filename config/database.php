<?php

$config['database'] = array(
  'development' => array(
    'connection' => array(
      'driver' => 'mysql',
      'host' => 'localhost',
      'database' => 'todo_dev',
      'username' => 'homestead',
      'password' => 'secret',
      'charset' => 'utf8',
      'collation' => 'utf8_unicode_ci',
      'prefix' => ''
    )
  ),
  'production' => array(
  )
);
