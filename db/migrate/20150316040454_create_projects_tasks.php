<?php

use Phinx\Migration\AbstractMigration;

class CreateProjectsTasks extends AbstractMigration
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
        " CREATE TABLE projects_tasks
        (
          project_id            INT         NOT NULL,
          task_id               INT         NOT NULL,
          task_sort_idx         INT         NOT NULL,
          PRIMARY KEY pk_projects_to_tasks (project_id, task_id),
          CONSTRAINT fk_projects
            FOREIGN KEY (project_id)
            REFERENCES projects (project_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
          CONSTRAINT fk_tasks
            FOREIGN KEY (task_id)
            REFERENCES tasks (task_id)
            ON DELETE CASCADE
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
