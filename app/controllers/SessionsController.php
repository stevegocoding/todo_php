<?php

namespace App\Controller;

use PDO;
use \App\Helpers\DBConFactory as DBConFactory;

class SessionsController extends \App\Controller\AppController
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
    $dbCon->getHandle();
    
    $sql = "
            SELECT u.user_id, u.user_email, u.user_password
            FROM users AS u
            WHERE u.user_email = :userEmail;
            ";
    $stmt = $dbCon->getHandle()->prepare($sql);
    $stmt->execute(array(':userEmail' => $req->identification));
    if ($stmt->rowCount() == 1) 
    {
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      if (password_verify($req->password, $row['user_password'])) {
        $this->loginUser($row['user_id']);
        $this->response->header('Content-Type', 'application/json');
        echo json_encode(array(
          'status' => 'success',
          'sessionID' => session_id()
        ));
      }
      else 
      {
        $this->response->setStatus(401);
        $this->response->header('Content-Type', 'application/json');
        echo json_encode(array(
          'status' => 'failed',
          'error' => 'Invalid user password!'
        ));
      }
    }
  }

  public function destroy()
  {
    $this->logoutUser();
  }
}
