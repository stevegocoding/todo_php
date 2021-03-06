<?php

use Phinx\Migration\AbstractMigration;

class CreateTasks extends AbstractMigration
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
        "CREATE TABLE tasks
        (
          task_id         INT             PRIMARY KEY     AUTO_INCREMENT,
          task_desc       VARCHAR(255)    NOT NULL,
          task_due_date   DATETIME        NOT NULL,
          task_done_date  DATETIME        DEFAULT NULL,
          parent_task_id  INT             NULL            DEFAULT NULL,
          created_on      TIMESTAMP       NOT NULL,
          CONSTRAINT tasks_fk_parent_tasks
            FOREIGN KEY (parent_task_id)
            REFERENCES tasks (task_id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        ) ENGINE=InnoDB;
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
