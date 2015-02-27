<?php

namespace App\Controller;

class DashboardController extends \App\Controller\AppController
{
  public function __construct($app) 
  {
    parent::__construct($app);
  }

  public function index() 
  {
    echo json_encode($this->app->config('path.public'));
  }
}
