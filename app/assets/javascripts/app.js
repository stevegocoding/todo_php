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
    id: 0,
    desc: '',
    priority: 0
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

    find: function(id) {
    },

    remove: function(id) {
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
    sortedProjects: Ember.computed.alias('arrangedContent', function() {
      console.log('test');
    }),
    actions: {
      updatePriorities: function(priorities) {
        var i = 0;
        console.log('---------------------');
        Ember.beginPropertyChanges();
        this.get('model').forEach(function(item) {
          i = i + 1; 

          var id = item.get('id');
          var p = priorities[id];
          console.log('id: ' + id + ' -- ' + 'p: '+ p);

          item.set('priority', p);
        }, this);
        console.log('counter: ' + i);
        console.log('---------------------');
        Ember.endPropertyChanges();
      }, 
      showProjectPopupMenu: function() {
        console.log('show menu');
        this._showProjectPopupMenu();
      },
      newProjectAbove: function() {
        console.log('new project above');
      },
      newProjectBelow: function() {
        console.log('new project below');
      },
      editProject: function() {
        
      }
    },
    _closeProjectPopupMenu: function() {
      this.set('isProjectMenuShown', false);
    },
    _showProjectPopupMenu: function() {
      this.set('isProjectMenuShown', true);
    }
  });
  
  /***************************************
   * Dashboard View 
   **************************************/
  App.DashboardView = Ember.View.extend({
    templateName: 'dashboard',
    click: function() {
      console.log('dashboard view -- click');
    }
  });
  
  /***************************************
   * Components 
   **************************************/

  /** 
   * Sortable List Component
   **/
  App.SortableListComponent = Ember.Component.extend({
    tagName: 'ul',
    classNameBindings: ['listClass'],
    listItems: Ember.A([]),
    
    listClass: Ember.computed('listType', function() {
      return (this.get('listType').dasherize());
    }),

    itemsDidChanged: function() {
      console.log('items array changed! ' + this.get('items').get('length'));
    }.observes('items').on('init'),

    init: function() {
      this._super();
    },

    didInsertElement: function() {
      this._initJQueryUISortableList();
      console.log('insert element');
    },
    
    addListItem: function(item) {
      this.get('listItems').pushObject(item);
    },
    
    clearSelection: function() {
      this.get('listItems').forEach(function(item, index, enumerable) {
        if (item.get('isSelected') === true) {
          item.set('isSelected', false);
        }
      });
    },
    _initJQueryUISortableList: function() {
      var self = this;
      var options = {
        placeholder: 'ui-state-highlight-my',
        handle: '.sortable-handle',
        cursor: 'move',
        update: function(evt, ui) {
          self.get('listItems').clear();
          
          var priorities = {};
          self.$('.sortable-list-item').each(function(index) {
            var itemID = $(this).attr('data-item-id') ;
            priorities[itemID]= index;
          });
          console.log(priorities);

          self.$().sortable('cancel');
          self.rerender();
          self.sendAction('sortedListAction', priorities);
        }
      };
      this.$().sortable(options);
      this.$().disableSelection();
    }
  });
  App.ProjectsListComponent = App.SortableListComponent.extend({
    listType: 'projectsList',
    layoutName: 'components/sortable-list',
    didOpenPopupMenu: false,
    click: function() {
      if (!this.get('didOpenPopupMenu')) {
        this._closeAllPopupMenus();
      }
      else {
        this.set('didOpenPopupMenu', false);
      }
    },
    actions: {
      showProjectPopupMenu: function(item) {
        this._closeAllPopupMenus();
        item.set('isMenuVisible', true);
        this.set('didOpenPopupMenu', true);
        return false;
      },
      editProjectMenuAction: function(item) {
        this._closeAllPopupMenus();
      }
    },
    _closeAllPopupMenus: function() {
      this.get('listItems').forEach(function(item, index, enumerable) {
        item.set('isMenuVisible', false);
      });
    }
  });
  Ember.Handlebars.helper('projects-list', App.ProjectsListComponent);

  App.ProjectsListItemComponent = Ember.Component.extend({
    tagName: 'li',
    classNames: ['ui-sortable-handle', 'sortable-list-item', 'projects-list-item'],
    classNameBindings: ['isSelected'],
    attributeBindings: ['pid:data-item-id'],
    isMenuVisible: false, 
    isSelected: false,
    editorMode: false,
    
    targetObject: Ember.computed.alias('parentView'),
    parentList: Ember.computed.alias('parentView'),
    
    modeDidChange: function() {
      if (this.get('editorMode')) {
        this._hideMenuTrigger();
      }
    }.observes('editorMode'),
    
    /** Children Components */
    menuTriggerBtn: null,

    init: function() {
      this._super();
    },
    didInsertElement: function() {
      this.get('parentList').addListItem(this);
      if (!this.get('editorMode')) {
        this._hideDragHandle();
        this._hideMenuTrigger();
      }
    }, 
    setChildComponent: function(name, component) {
      this.set(name, component);
    },
    toggleMenu: function() {
      this.set('isMenuVisible', !this.get('isMenuVisible'));
    },
    click: function() {
      this.get('parentList').clearSelection();
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
    actions: {
      menuTriggeredAction: function() {
        this.sendAction('menuTriggeredAction', this);
      },
      editProject: function() {
        this.sendAction('editProjectMenuAction', this);
        this.set('editorMode', true);
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
    }
  });

  App.IconButtonComponent = Ember.Component.extend({
    tagName: 'a',
    classNameBindings: ['btnClass'],
    parentItem: Ember.computed.alias('parentView'),
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
    actions: {
      entryAction: function() {
        this.sendAction('menuEntryAction');
      }
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
            action: 'newProjectAbove',
            options: {}
          },
          {
            title: 'Add project below',
            action: 'newProjectBelow',
            options: {
              separator: true
            }
          },
          {
            title: 'Edit project',
            action: 'editProject'
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
  

}(window, window.Ember, window.jQuery));
