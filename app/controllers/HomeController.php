<?php

namespace App\Controller;

class HomeController 
{
  protected $app; 
  
  public function __construct(\SlimCustom $app) {
    $this->app = $app;
  }
  
  public function hello() {
    echo '<p> Hello </p>'; 
  }
};
