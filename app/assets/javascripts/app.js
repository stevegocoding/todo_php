(function(window, Ember, $, moment) {
  // configure an authorizer to be used
  window.ENV = window.ENV || {};
  window.ENV['simple-auth'] = {
    //authorizer: 'authorizer:custom'
    store: 'simple-auth-session-store:cookie'
  };
      
  /***************************************
   * Application 
   **************************************/
  Ember.Application.initializer({
    name: 'authentication',
    after: 'simple-auth',
    initialize: function(container, application) {
      var applicationRoute = container.lookup('route:application');
      var session          = container.lookup('simple-auth-session:main');
      // handle the session events
      session.on('sessionAuthenticationSucceeded', function() {
        //applicationRoute.transitionTo('app');
      });
      session.on('sessionAuthenticationFailed', function() {
        //Ember.Logger.debug('Session authentication failed!');
      });
      session.on('sessionInvalidationSucceeded', function() {
        //applicationRoute.transitionTo('index');
      });
      session.on('sessionInvalidationFailed', function() {
        //Ember.Logger.debug('Session invalidation failed!');
      });
      
      // register the custom authenticator and authorizer so Ember Simple Auth can find them
      var authenticator = container.lookup('authenticator:custom');
      if (authenticator === null) {
        application.register('authenticator:custom', App.CustomAuthenticator);
      }
      var cookieStore = container.lookup('simple-auth-session-store:cookie');
      
      //container.register('authorizer:custom', App.CustomAuthorizer);
    }
  });
  App = Ember.Application.create({
    LOG_ACTIVE_GENERATION: false,
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: false,
    LOG_VIEW_LOOKUPS: false
  });
  
  /***************************************
   * Routes 
   **************************************/
  App.Router.map(function() {
    this.route('home', {path: '/home'});
    this.route('login', {path: '/login'});
    this.route('logout', {path: '/logout'});

    this.resource('app', function() {
      this.route('projectTasks', {path: '/tasks/project'});
      this.route('dateFilteredTasks', {path: '/tasks/filtered'});
    });
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
    dueDate: '',
    dueRelative: 0,
    doneDate: null,
    project: '',
    sortIdx: -1,
    isNew: false,
    
    isOverdue: Ember.computed('dueRelative', function() {
      return (this.get('dueRelative') < 0);
    }),
    isDone: Ember.computed('doneDate', function() {
      return !!this.get('doneDate');
    })
  });
  
  App.Task.reopenClass({
    findAll: function() {
      return $.ajax({
        url: '/tasks',
        type: 'GET',
        dataType: 'JSON'
      });
    },
    findByProject: function(projectName) {
      return $.ajax({
        url: '/tasks/project',
        type: 'GET',
        dataType: 'JSON',
        data: {
          project: projectName
        }
      }).then(function(data) {
        console.log('Task Model: findAll -- OK!');
        return data.map(function(task) {
          return App.Task.create(task);
        });
      }
      );
    },
    findDueInDays: function(dueInDays) {
      return $.ajax({
        url: '/tasks/due',
        type: 'GET',
        dataType: 'JSON',
        data: {
          days: dueInDays
        }
      }).then(function(data) {
        return data.map(function(project) {
          return App.Task.create(project);
        });
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
  App.AppProjectTasksRoute = Ember.Route.extend({      
    model: function(params, transition) {
      // 1. params with dynamic segments & query params
      // 2. transition.params is a hash or route hierarchy
      // 3. this will only be called first time entering the route
      // 4. all internal transitions will not call model hook
      
      return App.Task.findByProject(params.projectParam);
      /*
      return [
        Ember.Object.create({id:1, desc: params.projectParam, project: params.projectParam, sortIdx: 1}),
        Ember.Object.create({id:1, desc: params.projectParam, project: params.projectParam, sortIdx: 1}),
        Ember.Object.create({id:1, desc: params.projectParam, project: params.projectParam, sortIdx: 1})
      ];
      */
    },
    /*
    renderTemplate: function() {
      this._super();
      this.render('index/project_tasks', {
        //outlet: 'ot',
        into: 'index',
        controller: 'projectTasks'
      });
    },
    */
    actions: {
      queryParamsDidChange: function() {
        this.refresh();
      }
    }
  });
  
  App.AppDateFilteredTasksRoute = Ember.Route.extend({
    filterNameToDays: Ember.Object.create({
      'overdue': -1,
      'today': 0,
      '7days': 7
    }),
    model: function(params, transition) {
      //var days = this.get('filterNameToDays').get(params.filter);
      var days = params.dueInDays;
      return App.Task.findDueInDays(days);
    },
      /*
    renderTemplate: function() {
      this.render('index/date_tasks', {
        //outlet: 'ot',
        into: 'index',
        controller: 'dateFilteredTasks'
      });
    },
    */
    actions: {
      queryParamsDidChange: function() {
        this.refresh();
      }
    }
  });
  
  App.DaysGroup = Ember.Object.extend({
    header: null,
    list: [],
    dueRelative: 0,
    formattedDate: Ember.computed('header', function() {
      return moment(this.get('header')).format("Do MMM");
    }),
    title: Ember.computed('header', function() {
      var days = this.get('dueRelative');
      if (days === 0) {
        return 'Today';
      }
      else if (days === -1) {
        return 'Yesterday';
      }
      else if (days === 1) {
         return 'Tomorrow';
      }
      else {
        if (days < 0) {
          return (-1*days).toString() + ' days ago';
        }
        return moment(this.get('header')).format("dddd");
      }
    })
  });

  App.GroupableMixin = Ember.Mixin.create({
    groupProperty: null,

    groupedContent: Ember.computed('content', 'groupProperty', function() {
      return this.groupBy(this.get('content'), this.get('groupProperty'));
    }),
    groupBy: function(content, groupProperty) {
      var groupedContent = [];
      content.forEach(function(item) { 
        var hasGroup = !!groupedContent.findBy('header', item.get(groupProperty));

        if (!hasGroup) { 
          groupedContent.pushObject(App.DaysGroup.create({
            header: item.get(groupProperty),
            dueRelative: item.get('dueRelative'),
            list: []
          }));
        }
        groupedContent.findBy('header', item.get(groupProperty)).get('list').pushObject(item);
      });
      return groupedContent;
    }
  });
  
  App.AppDateFilteredTasksController = Ember.ArrayController.extend(App.GroupableMixin, {
    daysToFilterName: Ember.Object.create({
      '-1': 'overdue',
      '0': 'today',
      '7': '7days'
    }),
    queryParams: ['dueInDays'],
    dueInDays: null,
    
    groupProperty: 'dueDate',
    taskGroups: Ember.computed.alias('groupedContent'),
      
    resetController: function (controller, isExiting, transition) {
      if (isExiting) {
        // isExiting would be false if only the route's model was changing
        controller.set('dueInDays', '0');
      }
    }
  });
  
  App.AppProjectTasksController = Ember.ArrayController.extend({
    queryParams: ['projectParam'],
    projectParam: null,
    
    projectName: Ember.computed.alias('projectParam'),
    sortedTasks: Ember.computed.alias('content'),
    
    actions: {
      updateTasksSortIdx: function() {
      },
      newTask: function(param) {
      },
      createTask: function(param) {
      },
      deleteTask: function(param) {
      },
      updateTaskDesc: function(param) {
      }
    }
  });
  
  App.ApplicationRoute = Ember.Route.extend(SimpleAuth.ApplicationRouteMixin, {
    actions: {
      sessionAuthenticationSucceeded: function() {
        console.log('sessionAuthenticationSucceeded');
        this.transitionTo('app');
      },
      logout: function() {
        this.get('session').invalidate();
      }
    }
  });
  
  App.IndexRoute = Ember.Route.extend({
    beforeModel: function(transition) {
      if (!this.get('session').get('isAuthenticated')) {
        transition.abort();
        this.transitionTo('home');
      }
      else {
        this.transitionTo('app');
      }
    }
  });
 
  App.AppRoute = Ember.Route.extend({
    model: function(params, transition) {
      var self = this;
      return Ember.RSVP.hash({
        projects: App.Project.findAll(),
        //overdueTasks: App.Task.findDueInDays(-1)
        overdueTasks: App.Task.findDueInDays(7),
        inboxTasks: App.Task.findByProject('inbox')
      });
    },
    setupController: function(controller, model) {
      this.controllerFor('app.projects').set('model', model.projects);
      this.controllerFor('app.dateFilteredTasks').set('model', model.overdueTasks);
      this.controllerFor('app.projectTasks').set('model', model.inboxTasks);
    },
    transitToProjectTasks: function(project) {
      this.transitionTo('app.projectTasks');
      this.controllerFor('app.projectTasks').set('projectParam', project);
    },
    transitToDateTasks: function(days) {
      this.transitionTo('app.dateFilteredTasks');
      this.controllerFor('app.dateFilteredTasks').set('dueInDays', days);
    },
    actions: {
      showInboxTasks: function() {
        this.transitToProjectTasks('inbox');
      },
      showProjectTasks: function(params) {
        this.transitToProjectTasks(params.project);
      },
      showTodayTasks: function() {
        this.transitToDateTasks(0);
      },
      showWeekTasks: function() {
        this.transitToDateTasks(7);
      },
      showOverdueTasks: function(params) {
        this.transitToDateTasks(-1);
      },
      showDueInDaysTasks: function(params) {
        this.transitToDateTasks(params.days);
      }
    }
  });
 
  App.AppIndexRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, {
    beforeModel: function(transition) {
      this._super(transition);
      var self = this;
      return new Ember.RSVP.Promise(function(resolve, reject) {
        $.ajax({
          url:         '/sessions/verify',
          type:        'POST',
          contentType: 'application/json'
        }).then(function(response) {
          Ember.run(function() {
            resolve({ sessionID: response.sessionID });
          });
        }, function(xhr, status, error) {
          var response = JSON.parse(xhr.responseText);
          Ember.run(function() {
            self.get('session').invalidate();
            reject(response.error);
          });
        });
      });
    },
    renderTemplate: function(controller, model) {
      this._super(controller, model);
      var tasksController = this.controllerFor('app.projectTasks');
      this.render('app/project_tasks', {
        controller: tasksController
      });
    }
  });

  App.HomeRoute = Ember.Route.extend({
    /*
    renderTemplate: function() {
      this.render('home', {
        outlet: 'home',
        kj:  into: 'application'
      });
    }
    */
  });

  App.CustomAuthenticator = SimpleAuth.Authenticators.Base.extend({
    tokenEndpoint: '/sessions',
    restore: function(data) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        if (!Ember.isEmpty(data.sessionID)) {
          resolve(data);
        } else {
          reject();
        }
      });
    },
    authenticate: function(credentials) {
      var self = this;
      return new Ember.RSVP.Promise(function(resolve, reject) {
        Ember.$.ajax({
          url:         self.tokenEndpoint,
          type:        'POST',
          data:        JSON.stringify({ identification: credentials.identification, password: credentials.password }),
          contentType: 'application/json'
        }).then(function(response) {
          Ember.run(function() {
            resolve({ sessionID: response.sessionID });
          });
        }, function(xhr, status, error) {
          var response = JSON.parse(xhr.responseText);
          Ember.run(function() {
            reject(response.error);
          });
        });
      });
    },

    invalidate: function() {
      var self = this;
      return new Ember.RSVP.Promise(function(resolve) {
        Ember.$.ajax({ 
          url: self.tokenEndpoint, 
          type: 'DELETE' 
        }).always(function() {
          resolve();
        })
      });
    },
  });
  
  App.LoginRoute = Ember.Route.extend({
  });
  
  App.LogoutRoute = Ember.Route.extend({
  });
  
  /***************************************
   * Controllers 
   **************************************/
  App.ApplicationController = Ember.ArrayController.extend({
  });
  
  App.LoginController = Ember.Controller.extend({
    errorMessage: '',
    remembeMe: false,
    
    // change the store's cookie expiration time depending on whether "remember me" is checked or not
    rememberMeChanged: function() {
      this.get('session.store').cookieExpirationTime = this.get('rememberMe') ? 1209600 : null;
    }.observes('rememberMe'),
      
    actions: {
      login: function() {
        var self = this;
        var cred = this.getProperties('identification', 'password');
        this.get('session').authenticate('authenticator:custom', cred).then(function(data) {
          console.log('Login Success!');
        }, 
        function(error) {
          self.set('errorMessage', error.error);
        });
      }
    }
  });
  
  App.AppProjectsController = Ember.ArrayController.extend({
    //needs: ['app/projectTasks'],
      
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
  
  App.JQueryUIDatePickerMixin = Ember.Mixin.create({
    didInsertElement: function() {
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.$().datepicker({
          showButtonPanel: true
        });
      });
    },
    willDestroyElement: function() {
      this.$().datepicker('destroy');
    }
  });
  
  App.ProjectsListComponent = Ember.Component.extend(App.JQueryUISortableMixin, { 
    tagName: 'ul',
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
    itemClicked: function(item) {
      var params = {
        project: item.get('desc')
      };
      this.sendAction('showProjectTasks', params);
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
      this.set('isSelected', true);
      this.get('projectsList').clearSelection();
      this.get('projectsList').itemClicked(this);
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
    didInsertElement: function() {
      this.get('parentItem').set('menuTriggerBtn', this);
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

  /////////////////////////////////////////////////////////////////////////////////
  
  App.TasksListHeaderComponent = Ember.Component.extend({
    tagName: 'div',
    classNames: ['tasks-list-header']
  });
  
  App.TasksListComponent = Ember.Component.extend(App.JQueryUISortableMixin, {
    tagName: 'ul',
    classNames: ['tasks-list'],
    
    listItems: Ember.A([]),

    addListItem: function(item) {
      this.get('listItems').pushObject(item);
    }
  });
 
  App.TasksListItemComponent = Ember.Component.extend(App.JQueryUISortableMixin, {
    tagName: 'li',
    classNames: ['ui-sortable-handle', 'sortable-list-item', 'tasks-list-item'],
    editorMode: false,
    isDone: false,
    
   // tasksList: null,
    menuTriggerBtn: null,
    
    /** Sortable Mixin Config */
    placeholderClass: 'ui-state-highlight-task',
    sortableHandleQueryStr: '.sortable-handle',
    sortableItemQueryStr: '.sortable-list-item',
    sortableItemIDAttr: 'data-item-id',
    
    didInsertElement: function() {
      this.get('tasksList').addListItem(this);
      if (!this.get('editorMode')) {
        this._hideDragHandle();
        this._hideMenuTrigger();
      }
    },
    
    click: function() {
      if (!this.get('editorMode')) {
        this.set('editorMode', true);
      }
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
  });

  App.TaskItemTextFieldComponent = Ember.TextField.extend({
    classNames: ['task-desc-input'],
    placeholder: 'task description',
   
  });
  Ember.Handlebars.helper('task-textfield', App.TaskItemTextFieldComponent);
  
  /** Datepicker component for tasks item
   **/
  App.TaskItemDatePickerComponent = Ember.TextField.extend(App.JQueryUIDatePickerMixin, {
    classNames: ['task-datepicker-input'],
    placeholder: 'due date'
  });
  Ember.Handlebars.helper('task-datepicker', App.TaskItemDatePickerComponent);
}(window, window.Ember, window.jQuery, window.moment));
