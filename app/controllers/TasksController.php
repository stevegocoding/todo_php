<?php

namespace App\Controller;

use PDO;
use \App\Helpers\DBConFactory as DBConFactory;

class TasksController extends \App\Controller\AppController
{
  public function __construct($app)
  {
    parent::__construct($app);
  }
  
  public function create() 
  {
    $body = $this->request->getBody();
    $req = json_decode($body);

    $dbCon = DBConFactory::createConnection();
    $sql = "
            INSERT INTO tasks (task_desc, task_due_date) VALUES (:desc, :dueDate);
           ";
    
    $stmt = $dbCon->getHandle()->prepare($sql);
    $stmt->bindParam(':desc', $req->desc, PDO::PARAM_STR);
    $stmt->bindParam(':dueDate', $req->dueDate);
    $stmt->execute();
    $lastID = $dbCon->getHandle()->lastInsertId();

    $sql2 = "
            INSERT INTO projects_tasks (project_id, task_id, task_sort_idx) VALUES (:projectID, :taskID, :sortIdx);
          ";
    $stmt2 = $dbCon->getHandle()->prepare($sql2);
    $stmt2->bindParam(':projectID', $req->projectID, PDO::PARAM_INT);
    $stmt2->bindParam(':taskID', $lastID, PDO::PARAM_INT);
    $stmt2->bindParam(':sortIdx', $req->sortIdx, PDO::PARAM_INT);
    $stmt2->execute();

    $resp = array(
      'id' => $lastID
    );
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($resp, JSON_NUMERIC_CHECK);
  }

  public function findAll() 
  {
    $dbCon = DBConFactory::createConnection();
    $stmt = $dbCon->getHandle()->prepare("SELECT * FROM tasks");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $tasks = array();
    foreach ($rows as $task) {
      $tasks[] = array(
        'id' => $task['task_id'], 
        'desc' => $task['task_desc']
      );
    }
    
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($tasks, JSON_NUMERIC_CHECK);
  }

  public function findByProject() 
  {
    /*
    if (!$this->checkLogin())
    {
      $this->response->setStatus(401);
      $this->response->header('Content-Type', 'application/json');
      echo json_encode(array(
        'status' => '401',
        'message' => 'unauthorized'
      ));
      return;
    }
     */
    $dbCon = DBConFactory::createConnection();
    $dbCon->getHandle();

    $projectParam = $this->request->get('project');
    $sql = "
            SELECT  t.task_id as t_id, 
                    t.task_desc as t_desc,
                    t.task_due_date as t_due_date,
                    p.project_desc as t_project,
                    p.project_id as t_project_id,
                    pt.task_sort_idx as t_idx
            FROM tasks as t
            INNER JOIN projects_tasks as pt 
            ON t.task_id = pt.task_id
            INNER JOIN projects as p
            ON pt.project_id = p.project_id
            INNER JOIN users as u
            ON u.user_id = p.user_id
            WHERE p.user_id = :userID AND
                  p.project_desc = :projectName;
          ";

    $resp = array('sql' => $sql);
    
    $stmt = $dbCon->getHandle()->prepare($sql);
    $stmt->execute(
      array(
        ':userID' => $this->getCurrentUser(),
        ':projectName' => $projectParam
      ));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $tasks = array();
    foreach ($rows as $task) {
      $tasks[] = array(
        'id' => $task['t_id'], 
        'desc' => $task['t_desc'],
        'dueDate' => $task['t_due_date'],
        'project' => $task['t_project'],
        'project_id' => $task['t_project_id'],
        'sortIdx' => $task['t_idx']
      );
    }
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($tasks, JSON_NUMERIC_CHECK);
  }

  public function findDueInDays()
  {
    /*
    if (!$this->checkLogin())
    {
      $this->response->setStatus(401);
      $this->response->header('Content-Type', 'application/json');
      echo json_encode(array(
        'status' => '401',
        'message' => 'unauthorized'
      ));
      return;
    }
     */
    $dbCon = DBConFactory::createConnection();
    $dbCon->getHandle();

    $dueInDays = $this->request->get('days');

    // -1 means overdue
    if ($dueInDays == -1) {
      $this->findOverdue();
      return;
    }
    else {
      $this->findToDue($dueInDays);
      return;
    }
  }

  private function findToDue($days) 
  {
    $sql = "
            SELECT  t.task_id as t_id, 
                    t.task_desc as t_desc,
                    DATE(t.task_due_date) as t_duedate,
                    DATEDIFF(t.task_due_date, CURDATE()) as t_due_in_days,
                    p.project_desc as t_project,
                    pt.task_sort_idx as t_idx
            FROM tasks as t
            INNER JOIN projects_tasks as pt 
            ON t.task_id = pt.task_id
            INNER JOIN projects as p
            ON pt.project_id = p.project_id
            INNER JOIN users as u
            ON u.user_id = p.user_id
            WHERE p.user_id = :userID AND
                  DATEDIFF(t.task_due_date, CURDATE()) BETWEEN 0 AND :dueInDays AND 
                  t.task_done_date IS NULL;
          ";

    $dbCon = DBConFactory::createConnection();
    $stmt = $dbCon->getHandle()->prepare($sql);
    $stmt->bindValue(':dueInDays', $days, PDO::PARAM_INT);
    $stmt->bindValue(':userID', $this->getCurrentUser());
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $tasks = array();
    foreach ($rows as $task) {
      $tasks[] = array(
        'id' => $task['t_id'], 
        'desc' => $task['t_desc'],
        'dueDate' => $task['t_duedate'],
        'dueRelative' => $task['t_due_in_days'],
        'doneDate' => null,
        'project' => $task['t_project'],
        'sortIdx' => $task['t_idx']
      );
    }
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($tasks, JSON_NUMERIC_CHECK);
  }

  private function findOverdue() 
  {
    $sql = "
            SELECT  t.task_id as t_id, 
                    t.task_desc as t_desc,
                    DATE(t.task_due_date) as t_duedate,
                    DATEDIFF(CURDATE(), t.task_due_date) as t_overdue_days,
                    p.project_desc as t_project,
                    pt.task_sort_idx as t_idx
            FROM tasks as t
            INNER JOIN projects_tasks as pt 
            ON t.task_id = pt.task_id
            INNER JOIN projects as p
            ON pt.project_id = p.project_id
            INNER JOIN users as u
            ON u.user_id = p.user_id
            WHERE p.user_id = :userID AND
                  DATEDIFF(CURDATE(), t.task_due_date) > 0 AND
                  t.task_done_date IS NULL;
          ";
    
    $dbCon = DBConFactory::createConnection();
    $stmt = $dbCon->getHandle()->prepare($sql);
    $stmt->execute(array(
      ':userID' => $this->getCurrentUser()
    ));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $tasks = array();
    foreach ($rows as $task) {
      $tasks[] = array(
        'id' => $task['t_id'], 
        'desc' => $task['t_desc'],
        'dueDate' => $task['t_duedate'],
        'dueRelative' => $task['t_overdue_days'] * -1,
        'doneDate' => null,
        'project' => $task['t_project'],
        'sortIdx' => $task['t_idx']
      );
    }
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($tasks, JSON_NUMERIC_CHECK);
  }

  public function findDone() 
  {
    
  }
}
