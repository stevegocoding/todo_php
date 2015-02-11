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
}
