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
    $this->app->render('dashboard/index.twig', $this->viewData);
  }
}
