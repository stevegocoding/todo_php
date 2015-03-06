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
    attributeBindings: ['pid:data-item-id'],

    isMenuVisible: false,

    init: function() {
      this._super();
      //this.get('sortableList').registerItem(this);
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
    },
    actions: {
    }
  });

  App.IconButtonComponent = Ember.Component.extend({
    tagName: 'a',
    classNameBindings: ['btnClass'],

    btnClass: Ember.computed('btnType', function() {
      return Ember.String.dasherize(this.get('btnType'));
    }),

    click: function() {
      console.log('button clicked!');
      //this.set('showMenu', !this.get('showMenu'));
      this.get('listItem').toggleMenu();
    }
  });
  Ember.Handlebars.helper('icon-button', App.IconButtonComponent);

  /** Popup Menu Component 
   **/
  App.PopupMenuComponent = Ember.Component.extend({
    tagName: 'ul',
    classNames: ['popup-menu'],

    didInsertElement: function() {
      this.$().menu();
    }
  });
  

}(window, window.Ember, window.jQuery));
