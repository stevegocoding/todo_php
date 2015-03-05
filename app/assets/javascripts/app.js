(function(window, Ember) {
  
  /***************************************
   * Adapters 
   **************************************/
  
  
  /***************************************
   * Application 
   **************************************/
  App = Ember.Application.create({
  });

  App.Router.map(function() {
    this.route('dashboard', {path: '/dashboard'});
  });
  
  /***************************************
   * Models 
   **************************************/
  App.Project = Ember.Model.extend({
    desc: Ember.attr(),
  });
  App.Project.adapter = Ember.RESTAdapter.create();
  App.Project.url = '/projects';
  App.Project.rootKey = 'project';
  App.Project.collectionKey = 'projects';

  /***************************************
   * Routes 
   **************************************/
  App.DashboardRoute = Ember.Route.extend({
    model: function() {
      return Ember.RSVP.hash({
        projects: App.Project.find()
      });
    },
    setupController: function(controller, model) {
      this.controllerFor('projects').set('model', model.projects);
    }
  });
  
  /***************************************
   * Controllers 
   **************************************/
  App.ProjectController = Ember.ObjectController.extend({
  });
  
  App.ProjectsController = Ember.ArrayController.extend({
    itemController: 'project'
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
  App.SortableListItemComponent = Ember.Component.extend({
    tagName: 'li',
    classNames: ['ui-sortable-handle', 'sortable-list-item'],
    attributeBindings: ['id:data-item-id'],
      //sortableList: Ember.computed.alias('parentView'),

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
    classNameBindings: ['btnClassName'],

    btnClassName: Ember.computed('btnType', function() {
      return Ember.String.dasherize(this.get('btnType'));
    }),

    click: function() {
      console.log('button clicked!');
      //this.set('showMenu', !this.get('showMenu'));
      this.get('listItem').toggleMenu();
    }
  });

  App.PopupMenuComponent = Ember.Component.extend({
    tagName: 'ul',
    classNames: ['popup-menu'],

    didInsertElement: function() {
      this.$().menu();
    }
  });


}(window, window.Ember));
