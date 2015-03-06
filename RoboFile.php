<?php

require_once __DIR__.'/vendor/autoload.php';
require_once __DIR__.'/config/database.php';

class RoboFile extends \Robo\Tasks
{

  private function databaseExist($db, $dbName)
  {
      $stmt = $db->prepare('SELECT COUNT(*) AS `exist` FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME=?');
      $stmt->bindParam(1, $dbName, PDO::PARAM_STR);
      $stmt->execute();
      $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $exist = $results[0]['exist'] == 1;
      return $exist;
  }
  
  public function dbCreate($env) 
  {
    $this->say("Creating database ...");
    
    $config = array();
    require __DIR__.'/config/database.php';
    
    $dbConnectConfig = $config['database'][$env]['connection'];

    $host = $dbConnectConfig['host'];
    $dbName = $dbConnectConfig['database'];
    $userName = $dbConnectConfig['username'];
    $password = $dbConnectConfig['password'];
    
    try {
      $db = new PDO("mysql:host={$host};dbname=INFORMATION_SCHEMA;charset=utf8",$userName,$password);
      $db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
      $exist = $this->databaseExist($db, $dbName);
      if ($exist) {
        $this->say("Database $dbName already existed");
        return;
      }
      else {
        // Create a new database
        $sql = "CREATE DATABASE $dbName;
                ALTER DATABASE $dbName CHARACTER SET utf8 COLLATE utf8_unicode_ci;";
        $db->exec($sql);
      }
    }
    catch(PDOException $e) {
      $this->say($e.getMessage());
    }
  }

  public function dbDrop($env)
  {
    $this->say("Dropping database ...");
    
    $config = array();
    require __DIR__.'/config/database.php';
    
    $dbConnectConfig = $config['database'][$env]['connection'];

    $host = $dbConnectConfig['host'];
    $dbName = $dbConnectConfig['database'];
    $userName = $dbConnectConfig['username'];
    $password = $dbConnectConfig['password'];

    try {
      $db = new PDO("mysql:host={$host};charset=utf8",$userName,$password);
      $db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
      $exist = $this->databaseExist($db, $dbName);
      if ($exist) {
        $sql = "DROP DATABASE $dbName";
        $db->exec($sql);
      }
    }
    catch(PDOException $e) {
      $this->say($e.getMessage());
    }
  }

  public function dbReset($env)
  {
    $this->dbDrop($env);
    $this->dbCreate($env);
  }

  public function dbMigrate($env)
  {
    if ($env === 'development' || $env === 'staging' || $env === 'production') {
      $this->taskExec('php')->arg("vendor/bin/phinx migrate -e $env")->run();
    }
    else {
      $this->say('Invalid env');
    }
  }

  private function placeholders($text, $count = 0, $sep = ',')
  {
    $result = array();
    if ($count > 0) {
      for ($i = 0; $i < $count; $i++) {
        $result[] = $text;
      }
    }
    return implode($sep, $result);
  }

  private function fakeUsers($db, $faker)
  {
    $columnNames = array('user_name', 'user_email', 'user_password');

    $data = array();
    $data[] = array('user_name' => 'user', 'user_email' => 'user@example.com', 'user_password' => password_hash('password', PASSWORD_BCRYPT));
    $data[] = array('user_name' => 'admin', 'user_email' => 'admin@example.com', 'user_password' => password_hash('admin_password', PASSWORD_BCRYPT));
    
    $insertValues = array();
    foreach($data as $d) {
      $questionMarks[] = '(' . $this->placeholders('?', sizeof($d)) . ')';
      $insertValues = array_merge($insertValues, array_values($d));
    }

    $sql = "
    INSERT INTO users (" . 
      implode(",", $columnNames)
      . ") VALUES " 
      . implode(',', $questionMarks);

    $db->beginTransaction();
    $stmt = $db->prepare($sql);
    try {
      $stmt->execute($insertValues);
    }
    catch (PDOException $e) {
      echo $e->getMessage();
    }
    $db->commit();
  }

  private function fakeProjects($db, $faker)
  {
    $columnNames = array('project_desc', 'project_priority', 'user_id');

    $data = array();
    for ($i = 0; $i < 5; $i++) {
      $data[] = array($faker->text(20), $i, 1);
    }
    $insertValues = array();
    foreach($data as $d) {
      $questionMarks[] = '(' . $this->placeholders('?', sizeof($d)) . ')';
      $insertValues = array_merge($insertValues, $d);
    }

    $sql = "
    INSERT INTO projects (" . 
      implode(",", $columnNames)
      . ") VALUES " 
      . implode(',', $questionMarks);

    $db->beginTransaction();
    $stmt = $db->prepare($sql);
    try {
      $stmt->execute($insertValues);
    }
    catch (PDOException $e) {
      echo $e->getMessage();
    }
    $db->commit();
  }

  private function fakeTasks($db, $faker)
  {
    $columnNames = array('task_desc', 'task_due_date', 'task_done_date', 'parent_task_id', 'project_id');
    
    $data = array();
    
    // undone tasks
    for ($i = 0; $i < 5; $i++) {
      $dueDate = $faker->dateTimeBetween('-1 day', 'now')->format('Y-m-d H:i:s');
      $doneDate = null;
      $data[] = array($faker->text(20), $dueDate, $doneDate, null, 1);
    }

    // done tasks 
    for ($i = 0; $i < 5; $i++) {
      $dueDate = $faker->dateTimeBetween('-3 day', 'now')->format('Y-m-d H:i:s');
      $doneDate = $faker->dateTimeBetween('now', 'now')->format('Y-m-d H:i:s');
      $data[] = array($faker->text(20), $dueDate, $doneDate, 1, 1);
    }
    
    $insertValues = array();
    foreach($data as $d) {
      $questionMarks[] = '(' . $this->placeholders('?', sizeof($d)) . ')';
      $insertValues = array_merge($insertValues, $d);
    }

    $sql = "
    INSERT INTO tasks (" . 
      implode(",", $columnNames)
      . ") VALUES " 
      . implode(',', $questionMarks);

    //var_dump($insertValues);
    
    $db->beginTransaction();
    $stmt = $db->prepare($sql);
    try {
      $stmt->execute($insertValues);
    }
    catch (PDOException $e) {
      echo $e->getMessage();
    }
    $db->commit();
  }
  
  public function dbFake($env)
  {
    $this->say('Populating fake data ...');

    $this->dbReset($env);
    $this->dbMigrate($env);

    $config = array();
    require __DIR__.'/config/database.php';
    
    $dbConnectConfig = $config['database'][$env]['connection'];

    $host = $dbConnectConfig['host'];
    $dbName = $dbConnectConfig['database'];
    $userName = $dbConnectConfig['username'];
    $password = $dbConnectConfig['password'];

    try {
      $db = new PDO("mysql:host={$host};dbname={$dbName};charset=utf8",$userName,$password);
      $db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
      $faker = Faker\Factory::create();
      $faker->seed(5);

      // Create fake users
      $this->fakeUsers($db, $faker);

      // Create fake projects
      $this->fakeProjects($db, $faker);
      
      // Create fake tasks
      $this->fakeTasks($db, $faker);
        
    }
    catch(PDOException $e) {
      $this->say($e.getMessage());
    }




  }
}
