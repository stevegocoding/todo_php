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
      newProjectAbove: function() {
        console.log('new project above');
      },
      newProjectBelow: function() {
        console.log('new project below');
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

  App.ProjectsListItemComponent = Ember.Component.extend({
    tagName: 'li',
    classNames: ['ui-sortable-handle', 'sortable-list-item', 'projects-list-item'],
    classNameBindings: ['isSelected'],
    attributeBindings: ['pid:data-item-id'],
    isMenuVisible: false,
    isSelected: false,
    
    parentList: Ember.computed.alias('parentView'),

    init: function() {
      this._super();
      this.get('parentList').addListItem(this);
    },
    didInsertElement: function() {
      this._hideDragHandle();
    }, 
    showMenu: function() {
      this.set('isMenuVisible', true);
    },
    hideMenu: function() {
      this.set('isMenuVisible', false);
    },
    toggleMenu: function() {
      var cur = this.get('isMenuVisible');
      this.set('isMenuVisible', !cur);
    },

    click: function() {
      this.get('parentList').clearSelection();
      this.set('isSelected', true);
    },
    mouseEnter: function() {
      this._showDragHandle();
    },
    mouseLeave: function() {
      this._hideDragHandle();
    },
    _hideDragHandle: function() {
      this.$('.sortable-handle').css('visibility', 'hidden');
    },
    _showDragHandle: function() {
      this.$('.sortable-handle').css('visibility', 'visible');
    }
    /*
    ,
    actions: {
      newProjectAbove: function() {
        this.sendAction();
      },
      newProjectBelow: function() {
        this.sendAction();
      }
    }
    */
    
  });

  App.IconButtonComponent = Ember.Component.extend({
    tagName: 'a',
    classNameBindings: ['btnClass'],

    btnClass: Ember.computed('btnType', function() {
      return Ember.String.dasherize(this.get('btnType'));
    }),

    click: function() {
      this.get('listItem').toggleMenu();
    }
  });
  Ember.Handlebars.helper('icon-button', App.IconButtonComponent);

  /** Popup Menu Component 
   **/
  App.PopupMenuComponent = Ember.Component.extend({
    tagName: 'ul',
    classNameBindings: ['menuClass'],
      
    menuClass: Ember.computed('menuType', function() {
      return this.get('menuType').dasherize();
    }),

    didInsertElement: function() {
      this.$().menu();
    }
  });
  App.ProjectPopupMenuComponent = App.PopupMenuComponent.extend({
    menuType: 'projectItemMenu',
    layoutName: 'components/popup-menu',
    init: function() {
      this._super();
      this.set('menuEntries', [
          {
            title: 'Add project above',
            action: 'newProjectAbove'
          },
          {
            title: 'Add project below',
            action: 'newProjectBelow'
          }
      ]);
    }
  });
  Ember.Handlebars.helper('project-popup-menu', App.ProjectPopupMenuComponent);
  
  App.PopupMenuEntryComponent = Ember.Component.extend({
    tagName: 'li',
    classNameBindings: ['menuEntryClass'],
    menuEntryClass: Ember.computed('menuEntryType', function() {
      return this.get('menuEntryType').dasherize();
    }),
    actions: {
      entryAction: function() {
        this.sendAction('menuEntryAction');
      }
    }
  });
  App.ProjectPopupMenuEntryComponent = App.PopupMenuEntryComponent.extend({
    menuEntryType: 'projectMenuEntry',
    layoutName: 'components/popup-menu-entry'
  });
  Ember.Handlebars.helper('project-menu-entry', App.ProjectPopupMenuEntryComponent);
  

}(window, window.Ember, window.jQuery));
