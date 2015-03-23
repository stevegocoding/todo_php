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

  public function findAll() 
  {
    $dbCon = DBConFactory::createConnection();
    $dbCon->getHandle();
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
    $dbCon = DBConFactory::createConnection();
    $dbCon->getHandle();

    $projectParam = $this->request->get('project');
    $sql = "
            SELECT  t.task_id as t_id, 
                    t.task_desc as t_desc,
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
        'project' => $task['t_project'],
        'sortIdx' => $task['t_idx']
      );
    }
    $this->response->header('Content-Type', 'application/json');
    echo json_encode($tasks, JSON_NUMERIC_CHECK);
  }

  public function findDueInDays()
  {
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
