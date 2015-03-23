<?php

namespace App\Controller;

use PDO;
use \App\Helpers\DBConFactory as DBConFactory;

class AppController
{
  protected $app;
  protected $request;
  protected $response;
  protected $viewData;

  public function __construct(\SlimCustom $app) 
  {
    $this->app = $app;
    $this->request = $app->request;
    $this->response = $app->response;
    
    $this->viewData = array();
    $this->viewData['baseUrl'] = $this->baseUrl();
    $this->viewData['assetUrl'] = $this->viewData['baseUrl'] . 'assets/';
  }

  protected function baseUrl() 
  {
    $path       = dirname($_SERVER['SCRIPT_NAME']);
    $path       = trim($path, '/');
    $baseUrl    = $this->request->getUrl();
    $baseUrl    = trim($baseUrl, '/');
    $port       = $_SERVER['SERVER_PORT'];
    return $baseUrl.'/'.$path.( $path ? '/' : '' );
  }

  protected function loginUser($userID)
  {
    $_SESSION['user_id'] = $userID;
  }

  protected function logoutUser()
  {
    if (isset($_SESSION['user_id'])) 
    {
      unset($_SESSION['user_id']);
    }
  }

  protected function getCurrentUser() 
  {
    if (isset($_SESSION['user_id']))
    {
       return $_SESSION['user_id'];
    }
    return NULL;
  }

  protected function checkLogin()
  {
    $currentUserID = $this->getCurrentUser();
    if (!is_null($currentUserID)) 
    {
      $dbCon = DBConFactory::createConnection();
      $sql = "
              SELECT user_id
              FROM users
              WHERE user_id = :currentUserID;
            ";
      $stmt = $dbCon->getHandle()->prepare($sql);
      $stmt->execute(array(':currentUserID' => $currentUserID));
      if ($stmt->rowCount() == 1)
      {
        return true;
      }
    }

    return false;
  }
}
