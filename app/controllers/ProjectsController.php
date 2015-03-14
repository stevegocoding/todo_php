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
    echo json_encode($projects, JSON_NUMERIC_CHECK);
  }

  public function create() {
    $body = $this->request->getBody();
    $req = json_decode($body);

    $dbCon = DBConFactory::createConnection();
    $dbCon->getHandle();
    $stmt = $dbCon->getHandle()->prepare("INSERT INTO projects (project_desc, project_priority, user_id) VALUES (:desc, :priority, :userID)");
    $stmt->execute(array(':desc' => $req->desc, ':priority' => $req->priority, ':userID' => 1));
    $lastID = $dbCon->getHandle()->lastInsertId();

    $resp = array(
      'id' => $lastID,
      'desc' => $req->desc,
      'priority' => $req->priority
    );
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($resp, JSON_NUMERIC_CHECK);
  }

  public function update($property) {
    $body = $this->request->getBody();
    $req = json_decode($body);
    
    $dbCon = DBConFactory::createConnection();
    $dbCon->getHandle();
    $columnName = "project_{$property}";
    $sql = "UPDATE projects SET {$columnName}=:value WHERE project_id=:id";
    $stmt = $dbCon->getHandle()->prepare($sql);
    foreach ($req as $u) {
      $stmt->execute(array(
        ':id' => (int)($u->id), 
        ':value' => $u->value
      ));
    }
    $resp = array(
      'property' => $property,
      'sql' => $sql
    );
    $this->response->header('Content-Type', 'application/json');
    $this->response->setStatus(200);
    echo json_encode($resp, JSON_NUMERIC_CHECK);
  }
}
