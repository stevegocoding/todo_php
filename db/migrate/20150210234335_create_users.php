<?php

use Phinx\Migration\AbstractMigration;

class CreateUsers extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     *
     * Uncomment this method if you would like to use it.
     *
    public function change()
    {
    }
    */
    
    /**
     * Migrate Up.
     */
    public function up()
    {
      $sql = 
        "CREATE TABLE users
        (
          user_id           INT           PRIMARY KEY       AUTO_INCREMENT,
          user_name         VARCHAR(20)   NOT NULL,
          user_email        VARCHAR(254)  NOT NULL          UNIQUE,
          user_password     BINARY(60)    NOT NULL,
          create_on         TIMESTAMP     NOT NULL
        ) ENGINE=InnoDB;
        CREATE INDEX user_email_ix
          ON users (user_email);
        ";
      $this->execute($sql);
    }

    /**
     * Migrate Down.
     */
    public function down()
    {

    }
}
