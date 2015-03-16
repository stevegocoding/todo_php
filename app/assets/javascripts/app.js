(function(window, Ember, $) {
  /***************************************
   * Application 
   **************************************/
  App = Ember.Application.create({
  });
  
  /***************************************
   * Routes 
   **************************************/
  App.Router.map(function() {
    this.route('dashboard', {path: '/dashboard'});
  });
  
  /***************************************
   * Models
   **************************************/
  App.Project = Ember.Object.extend({
    id: -1,
    desc: '',
    priority: -1,
    isNew: false
  });
  
  App.Project.reopenClass({
    findAll: function() {
      return $.ajax({
        url: '/projects',
        type: 'GET',
        dataType: 'JSON'
      }).then(function(data) {
        console.log('Project Model: findAll -- OK!');
        return data.map(function(project) {
          return App.Project.create(project);
        });
      });
    },
    saveNew: function(newProject) {
      return $.ajax({
        url: '/projects',
        type: 'POST',
        dataType: 'JSON',
        data: JSON.stringify(newProject)
      });
    },
    find: function(id) {
    },
    remove: function(id) {
    },
    updateDesc: function(data) {
      return $.ajax({
        url: 'projects/desc',
        type: 'PUT',
        dataType: 'JSON',
        data: JSON.stringify(data)
      });
    },
    updatePriorities: function(priorities) {
      return $.ajax({
        url: '/projects/priority',
        type: 'PUT',
        dataType: 'JSON',
        data: JSON.stringify(priorities)
      });
    }
  });
  
  ////////////////////////////////////////
  
  App.Task = Ember.Object.extend({
    id: -1,
    desc: '',
    dueDate: ''
  });
  
  App.Task.reopenClass({
    findAll: function() {
      return $.ajax({
        url: '/tasks',
        type: 'GET',
        dataType: 'JSON'
      });
    },
    findByProject: function(projectID) {
      return $.ajax({
        url: '/tasks',
        type: 'GET',
        dataType: 'GET',
        data: {
          project_id: projectID
        }
      });
    },
    findByFilter: function(filterName) {
      return $.ajax({
        url: '/tasks/filtered',
        type: 'GET',
        dataType: 'GET',
        data: {
          filter: filterName
        }
      });
    },
    saveNew: function(newTask) {
      return $.ajax({
        url: '/tasks',
        type: 'POST',
        dataType: 'JSON',
        data: JSON.stringify(newTask)
      });
    },
    updateDesc: function(data) {
      return $.ajax({
        url: '/tasks/desc',
        type: 'PUT',
        dataType: 'JSON',
        data: JSON.stringify(data)
      });
    },
    updateDueDate: function(data) {
      return $.ajax({
        url: '/tasks/duedate',
        type: 'PUT',
        dataType: 'JSON',
        data: JSON.stringify(data)
      });
    },
    remove: function(data) {
      return $.ajax({
        url: '/tasks',
        type: 'DELETE',
        dataType: 'JSON',
        data: JSON.stringify(data)
      });
    }
  });

  /***************************************
   * Routes 
   **************************************/
  App.DashboardRoute = Ember.Route.extend({
    model: function() {
      return Ember.RSVP.hash({
        projects: App.Project.findAll()
      });
    },
    setupController: function(controller, model) {
      this.controllerFor('projects').set('model', model.projects);
    }
  });
  
  
  /***************************************
   * Controllers 
   **************************************/
  App.DashboardController = Ember.ObjectController.extend({
  });
  
  App.ProjectsController = Ember.ArrayController.extend({
    sortProperties: ['priority'],
    sortAscending: true,
    sortedProjects: Ember.computed.alias('arrangedContent'),
    nextID: Ember.computed(function() {
      if (this.get('length') === 0) {
        return 1;
      }
      return (parseInt(this.get('lastObject').get('id')) + 1).toString();
    }),
    hasNewProject: Ember.computed('@each.isNew', function() {
       return this.filterBy("isNew", true).get("length") > 0;
    }),
    actions: {
      updateProjectsPriorities: function(params) {
        var priorities = params.priorities;
        Ember.beginPropertyChanges();
        /*
        this.get('model').forEach(function(item) {
          i = i + 1; 

          var id = item.get('id');
          var p = priorities[id];
          console.log('id: ' + id + ' -- ' + 'p: '+ p);

          item.set('priority', p);
        }, this);
        */

        var self = this;
        priorities.forEach(function(element, index, array) {
          var itemID = array[index].id;
          var itemIdx = array[index].value;
          var item = self.get('model').findBy('id', itemID);
          if (item) {
            item.set('priority', itemIdx);
          }
          else {
            console.log('update projects proorities -- error!');
            console.log('id: ' + itemID + ' -- ' + 'p: '+ itemIdx);
          }
        });
        Ember.endPropertyChanges();
        
       if (this.get('hasNewProject') === false) {
         App.Project.updatePriorities(priorities).then(function(respData) {
           Ember.run(function() {
             params.deferred.resolve(respData);
           });
         },
         function(error) {
           params.deferred.reject(error);
         });
       }
      }, 
      newProject: function() {
        var data = {
          id: this.get('nextID'),
          desc: '',
          priority: this.get('length'),
          isNew: true
        };
        var newProj = App.Project.create(data);
        this.pushObject(newProj);
      },
      createProject: function(params) {
        var data = {
          id: params.id,
          desc: params.desc,
          priority: params.priority
        };
        var self = this;
        App.Project.saveNew(data).then(function(respData, statusCode) {
          Ember.run(function () {
            var obj = self.findBy('id', params.id);
            self.removeObject(obj); 
            var newProj = App.Project.create(respData);
            self.pushObject(newProj);
            params.deferred.resolve(respData);
          });
        },
        function(error) {
          params.deferred.reject(error);
        });
      },
      deleteProject: function(params) {
        console.log('delete');
        if (params.isNew === true) {
          var obj = this.findBy('id', params.id) 
          if (obj.get('isNew') === true) {
            this.removeObject(obj);
          }
        }
      },
      updateProjectDesc: function(params) {
        App.Project.updateDesc(params.data).then(function(respData) {
          Ember.run(function() {
            params.deferred.resolve(respData);
          });
        },
        function(error) {
          params.deferred.reject(error);
        });
      }
    }
  });
  
  /***************************************
   * Dashboard View 
   **************************************/
  App.DashboardView = Ember.View.extend({
    templateName: 'dashboard'
  });
  
  /***************************************
   * Components 
   **************************************/

  /** 
   * jQuery UI Sortable Mixin
   **/
  App.JQueryUISortableMixin = Ember.Mixin.create({
    didInsertElement: function() {
      Ember.run.scheduleOnce('afterRender', this, function() {
      var self = this;
      var options = {
        placeholder: self.get('placeholderClass'),
        handle: self.get('sortableHandleQueryStr'),
        cursor: 'move',
        update: function(evt, ui) {
          var indices = [];
          self.$().find(self.get('sortableItemQueryStr')).each(function(index) {
            var itemID = parseInt($(this).attr(self.get('sortableItemIDAttr')));
            // indices[itemID]= index;
            indices.push({id: itemID, value: index});
          });
          self.$().sortable('cancel');
          self.didUpdateSortable(indices);
        }
      };
      this.$().sortable(options);
      this.$().disableSelection();
      });
    } 
  }); 
  
  App.ProjectsListComponent = Ember.Component.extend(App.JQueryUISortableMixin, { tagName: 'ul',
    classNames: ['projects-list'],
    listItems: Ember.A([]),
    didOpenPopupMenu: false,

    /** Sortable Mixin Config */
    placeholderClass: 'ui-state-highlight-my',
    sortableHandleQueryStr: '.sortable-handle',
    sortableItemQueryStr: '.sortable-list-item',
    sortableItemIDAttr: 'data-item-id',
   
    didInsertElement: function() {
      this.set('sortbleItemIDAttr', 'data-item-id');
      this._super();
    },
    didUpdateSortable: function(indices) {
      this.rerender();
      var self = this;
      var deferred = Ember.RSVP.defer();
      deferred.promise.then(function(data) {
        console.log('update sortable deferred OK');
      },
      function(reason) {
        console.log('deferred Failed! -- ' + reason);
      });
      var params = {
        priorities: indices,
        deferred: deferred
      };
      this.sendAction('updateSortable', params);
    },
    addListItem: function(item) {
      this.get('listItems').pushObject(item);
      console.log('add ----- ');
    },
    removeListItem: function(item) {
      this.get('listItems').removeObject(item);
      console.log('remove ----- ');
    },
    clearSelection: function() {
      this.get('listItems').forEach(function(item, index, enumerable) {
        if (item.get('isSelected') === true) {
          item.set('isSelected', false);
        }
      });
    },
    closeAllPopupMenus: function() {
      this.get('listItems').forEach(function(item, index, enumerable) {
        item.set('isMenuVisible', false);
      });
    },
    click: function() {
      if (!this.get('didOpenPopupMenu')) {
        this.closeAllPopupMenus();
      }
      else {
        this.set('didOpenPopupMenu', false);
      }
    },
    openProjectPopupMenu: function(item) {
      this.closeAllPopupMenus();
      item.set('isMenuVisible', true);
      this.set('didOpenPopupMenu', true);
    },
    saveEdit: function(item) {
      if (item.get('isNew')) {
        var self = this;
        var deferred = Ember.RSVP.defer();
        deferred.promise.then(function(data) {
          console.log('deferred OK');
        },
        function(reason) {
          console.log('deferred Failed! -- ' + reason);
        });
        var params = {
          id: item.get('pid'),
          desc: item.get('desc'),
          priority: item.get('priority'),
          deferred: deferred
        };
        this.sendAction('addProject', params);
      }
      else {
        var params = {
          data: [{
            id: item.get('pid'),
            value: item.get('desc')
          }]
        };
        var deferred = Ember.RSVP.defer();
        deferred.promise.then(function(data) {
          console.log('deferred OK');
          item.set('editorMode', false);
        },
        function(reason) {
          console.log('deferred Failed! -- ' + reason);
        });
        params.deferred = deferred;
        this.sendAction('updateProject', params);
      }
    },
    cancelEdit: function(item) {
      if (item.get('isNew') === true) {
        var params = {
          id: item.get('pid'),
          isNew: item.get('isNew')
        };
        this.sendAction('removeProject', params);
      }
      else {
        item.set('editorMode', false);
      }
    }
  });

  App.ProjectsListItemComponent = Ember.Component.extend({
    tagName: 'li',
    classNames: ['ui-sortable-handle', 'sortable-list-item', 'projects-list-item'],
    classNameBindings: ['isSelected'],
    attributeBindings: ['pid:data-item-id'],
    isMenuVisible: false, 
    isSelected: false,
    editorMode: false,
    
    modeDidChange: function() {
      if (this.get('editorMode')) {
        this._hideMenuTrigger();
      }
      console.log('editor mode!');
    }.observes('editorMode'),
    
    /** Children Components */
    menuTriggerBtn: null,

    init: function() {
      this._super();
      if (this.get('isNew')) {
        this.set('editorMode', true);
      }
    },
    didInsertElement: function() {
      console.log('insert element');
      this.get('projectsList').addListItem(this);
      if (!this.get('editorMode')) {
        this._hideDragHandle();
        this._hideMenuTrigger();
      }
    },
    willDestroyElement: function() {
      console.log('destroy element');
      this.get('projectsList').removeListItem(this);
    },
    setChildComponent: function(name, component) {
      this.set(name, component);
    },
    toggleMenu: function() {
      this.set('isMenuVisible', !this.get('isMenuVisible'));
    },
    click: function() {
      this.get('projectsList').clearSelection();
      this.set('isSelected', true);
    },
    mouseEnter: function() {
      if (!this.get('editorMode')) {
        this._showDragHandle();
        this._showMenuTrigger();
      }
    },
    mouseLeave: function() {
      if (!this.get('editorMode')) {
        this._hideDragHandle();
        this._hideMenuTrigger();
      }
    },
    _showMenuTrigger: function() {
      this.get('menuTriggerBtn').setVisibility(true);
    },
    _hideMenuTrigger: function() {
      this.get('menuTriggerBtn').setVisibility(false);
    },
    _hideDragHandle: function() {
      this.$('.sortable-handle').css('visibility', 'hidden');
    },
    _showDragHandle: function() {
      this.$('.sortable-handle').css('visibility', 'visible');
    },
    actions: {
      openMenuBtnAction: function() {
        this.get('projectsList').openProjectPopupMenu(this);
      },
      editProjectMenuAction: function() {
        this.set('editorMode', true);
        this.set('isMenuVisible', false);
      },
      newProjectAboveMenuAction: function() {
        console.log('new project above -- item');
      },
      newProjectBelowMenuAction: function() {
        console.log('new project below -- item');
      },
      saveEditBtnAction: function() {
        this.get('projectsList').saveEdit(this);
      },
      cancelEditBtnAction: function() {
        this.get('projectsList').cancelEdit(this);
      }
    }
  });

  App.IconButtonComponent = Ember.Component.extend({
    tagName: 'a',
    classNameBindings: ['btnClass'],
    btnClass: Ember.computed('btnType', function() {
      return Ember.String.dasherize(this.get('btnType'));
    }),
    init: function() {
      this._super();
      this.get('parentItem').setChildComponent('menuTriggerBtn', this);
    },
    setVisibility: function(isVisible) {
      val = isVisible? 'visible' : 'hidden';
      this.$().css('visibility', val);
    },
    click: function() {
      this.sendAction('btnAction');
    }
  });
  Ember.Handlebars.helper('icon-button', App.IconButtonComponent);
  
  /** Input text filed component for project item
   **/
  App.ProjectItemTextAreaComponent = Ember.TextArea.extend({
    classNames: ['project-desc-input'],
    placeholder: 'Project name'
  });
  Ember.Handlebars.helper('project-textarea', App.ProjectItemTextAreaComponent);

  /** Menu Component 
   **/
  App.MenuComponent = Ember.Component.extend({
    tagName: 'ul',
    classNameBindings: ['menuClass'],
    menuClass: Ember.computed('menuType', function() {
      return this.get('menuType').dasherize();
    }),
    didInsertElement: function() {
    }
  });
  App.MenuEntryComponent = Ember.Component.extend({
    tagName: 'li',
    classNameBindings: ['menuEntryClass', 'withSeparator'],
    menuEntryClass: Ember.computed('menuEntryType', function() {
      return this.get('menuEntryType').dasherize();
    }),
    click: function() {
      this.sendAction('menuEntryAction');
    }
  });
  
  App.ProjectPopupMenuComponent = App.MenuComponent.extend({
    menuType: 'projectItemMenu',
    layoutName: 'components/menu',
    init: function() {
      this._super();
      this.set('menuEntries', [
          {
            title: 'Add project above',
            action: 'newProjectAboveMenuAction',
            options: {}
          },
          {
            title: 'Add project below',
            action: 'newProjectBelowMenuAction',
            options: {
              separator: true
            }
          },
          {
            title: 'Edit project',
            action: 'editProjectMenuAction'
          }
      ]);
    }
  });
  Ember.Handlebars.helper('project-popup-menu', App.ProjectPopupMenuComponent);
  
  App.ProjectPopupMenuEntryComponent = App.MenuEntryComponent.extend({
    menuEntryType: 'projectMenuEntry',
    layoutName: 'components/menu-entry',
    withSeparator: Ember.computed('options', function() {
      var opt = this.get('options');
      if (opt && opt.hasOwnProperty('separator') && opt['separator'] === true) {
        return 'with-separator';
      }
      return '';
    })
  });
  Ember.Handlebars.helper('project-menu-entry', App.ProjectPopupMenuEntryComponent);
  
  /** Horizontal Menu Component
   **/
  App.HorizontalMenuComponent = App.MenuComponent.extend({
    menuType: 'sidebarHorizontalMenu',
    classNames: ['horizontal-menu', 'tabs-menu'],
    layoutName: 'components/menu',
    init: function() {
      this._super();
      this.set('menuEntries', [
          {
            title: 'Projects',
            action: 'showProjects'
          },
          {
            title: 'Filters',
            action: 'showFilters'
          }
      ]);
    }
  });
  Ember.Handlebars.helper('horizontal-menu', App.HorizontalMenuComponent);
  
  App.HorizontalMenuEntryComponent = App.MenuEntryComponent.extend({
    menuEntryType: 'sidebarHorizontalMenuEntry',
    classNames: ['tabs-menu-item'],
    layoutName: 'components/menu-entry'
  });
  Ember.Handlebars.helper('horizontal-menu-entry', App.HorizontalMenuEntryComponent);
  
  App.TasksController = Ember.ArrayController.extend({
    
  });
  

}(window, window.Ember, window.jQuery));
