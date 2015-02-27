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
  


}(window, window.Ember));
