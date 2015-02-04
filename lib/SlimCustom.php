<?php

//namespace ToDoApp;
class SlimCustom extends \Slim\Slim
{
  public function mapRoute($args)
  {
    $callable = array_pop($args);
    if (is_string($callable) && substr_count($callable, ':', 1) == 1) {
      $callable = $this->createControllerClosure($callable);
    }
    $args[] = $callable;

    return parent::mapRoute($args);
  }

  private function createControllerClosure($name)
  {
    list($controllerName, $actionName) = explode(':', $name);
    
    // Create a callable that will find or create the controller instance
    // and then execute the action
    $app = $this;

    $callable = function() use ($app, $controllerName, $actionName) {
      // Try to fetch the controller instance from Slim container
      if ($app->container->has($controllerName)) {
        $controller = $app->container->get($controllerName);
      }
      else {
        $controller = new $controllerName($app);
      }

      return call_user_func_array(array($controller, $actionName), func_get_args());
    };

    return $callable;
  }
}
