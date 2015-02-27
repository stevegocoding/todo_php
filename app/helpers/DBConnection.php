<?php

namespace App\Helpers;

use PDO;

class DBConnection
{
  private $dbh= NULL;
  
  public function __construct($config)
  {
    $dbHost = $config['host'];
    $dbName = $config['database'];
    $username = $config['username'];
    $password = $config['password'];

    try {
      $this->dbh = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8",$username,$password, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
    }
    catch(PDOException $e) {
      echo __LINE__.$e->getMessage();
    }
  }

  public function __destruct() 
  {
    $this->dbh = NULL;
  }
  
  public function getHandle()
  {
    return $this->dbh;
  }
}
