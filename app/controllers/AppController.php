<?php

namespace App\Controller;

class AppController
{
  protected $app;
  protected $request;
  protected $response;
  protected $viewData;

  public function __construct(\SlimCustom $app) {
    $this->app = $app;
    $this->request = $app->request;
    $this->response = $app->response;
    
    $this->viewData = array();
    $this->viewData['baseUrl'] = $this->baseUrl();
    $this->viewData['assetUrl'] = $this->viewData['baseUrl'] . 'assets/';
  }

  protected function baseUrl() {
    $path       = dirname($_SERVER['SCRIPT_NAME']);
    $path       = trim($path, '/');
    $baseUrl    = $this->request->getUrl();
    $baseUrl    = trim($baseUrl, '/');
    $port       = $_SERVER['SERVER_PORT'];
    return $baseUrl.'/'.$path.( $path ? '/' : '' );
  }
}
