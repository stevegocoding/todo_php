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
          task_due_date   DATE            NOT NULL,
          task_done_date  DATE            DEFAULT NULL,
          parent_task_id  INT             DEFAULT NULL,
          project_id      INT             NOT NULL,
          created_on      TIMESTAMP       NOT NULL,
          CONSTRAINT tasks_fk_projects
            FOREIGN KEY (project_id)
            REFERENCES projects (project_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
          CONSTRAINT tasks_fk_parent_tasks
            FOREIGN KEY (parent_task_id)
            REFERENCES tasks (task_id)
            ON DELETE SET NULL
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
