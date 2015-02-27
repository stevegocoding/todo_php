<?php 

namespace App\Helpers;

class DBConFactory
{
  private static $config = null;

  public static function config($dbConfig)
  {
    self::$config = $dbConfig;
  }

  public static function createConnection()
  {
    if (self::$config) {
      return new DBConnection(self::$config);
    }
    return null;
  }
}
