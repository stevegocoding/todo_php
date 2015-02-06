<?php

namespace App\Controller;

class AppController
{
  protected $app;

  public function __construct(\SlimCustom $app) {
    $this->app = $app;
  }
}
