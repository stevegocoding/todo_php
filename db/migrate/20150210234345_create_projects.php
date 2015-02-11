<?php

use Phinx\Migration\AbstractMigration;

class CreateProjects extends AbstractMigration
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
        "CREATE TABLE projects
        (
          project_id      INT           PRIMARY KEY     AUTO_INCREMENT,
          project_desc    VARCHAR(50)   NOT NULL,
          user_id         INT           NOT NULL,
          created_on      TIMESTAMP     NOT NULL,
          
          CONSTRAINT projects_fk_users FOREIGN KEY (user_id)
            REFERENCES users (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ) ENGINE=InnoDB;
        CHARSET utf8 COLLATE utf8_general_ci;
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
