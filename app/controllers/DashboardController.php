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
    //$this->app->render('dashboard/index.twig', $this->viewData);
    
    
    $viewData = array(
      'tasks_groups' => array(
        array(
          'tasks_group_header' => 'Header',
          'tasks_group_header_date' => 'YYYY-MM-DD',
          'tasks' => array(
            array('task_desc' => 'Desc 1'),
            array('task_desc' => 'Desc 2')
          )
        ),
        array(
          'tasks_group_header' => 'Header 2',
          'tasks_group_header_date' => 'YYYY-MM-DD',
          'tasks' => array(
            array('task_desc' => 'Desc 3'),
            array('task_desc' => 'Desc 4')
          )
        )
      )
    );
    
    $this->app->render('dashboard.handlebars', $viewData);
  }
}
