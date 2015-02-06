<?php

namespace App\Controller;

class HomeController extends \App\Controller\AppController
{
  public function __construct(\SlimCustom $app) {
    parent::__construct($app);
  }
  
  public function hello() {
    echo '<p> Hello </p>'; 
  }
}
