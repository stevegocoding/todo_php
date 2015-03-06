<?php

namespace App\Controller;

use PDO;
use \App\Helpers\DBConFactory as DBConFactory;

class ProjectsController extends \App\Controller\AppController
{
  public function __construct($app)
  {
    parent::__construct($app);
  }

  public function index()
  {
    $dbCon = DBConFactory::createConnection();
    $dbCon->getHandle();
    $stmt = $dbCon->getHandle()->prepare("SELECT * FROM projects");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $projects = array();
    foreach ($rows as $proj) {
      $projects[] = array(
        'id' => $proj['project_id'], 
        'desc' => $proj['project_desc'],
        'priority' => $proj['project_priority']
      );
    }
    
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($projects);
  }
}
