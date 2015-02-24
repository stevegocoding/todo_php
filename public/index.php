<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ember Starter App</title>
  <link rel="stylesheet" href="assets/styles/app.css">
</head>
<body>

  <div id="app"></div>

  <script type="text/x-handlebars" data-template-name="index"></script>
  <!-- Sidebar wrapper -->
  <div class="sidebar-wrapper">
    
    <!-- Sidebar banner -->
    <div class="sidebar-banner">
      <div class="sidebar-logo">
        <a href="#" class="sidebar-logo-icon"></a>
      </div>
    </div> <!-- Sidebar banner -->
    
    <!-- Sidebar top section -->
    <div class="sidebar-top-section">
      <ul class="sidebar-top-filters">
        <li class="inbox-filter">
          <a href="#">Inbox</a>
        </li>
        <li class="today-filter">
          <a href="#">Today</a>
        </li>
        <li class="seven-days-filter">
          <a href="#">7 Days</a>
        </li>
      </ul>
    </div> <!-- Sidebar top section -->
    
    <!-- Sidebar tabs menu -->
    <div class="sidebar-menu">
      <ul class="tabs-menu">
        <li class="tabs-menu-item"><a href="#">Projects</a></li>
        <li class="tabs-menu-item"><a href="#">Labels</a></li>
      </ul>
    </div> <!-- Sidebar tabs menu -->
    
    <!-- Sidebar menu list, could be projects or labels -->
    <div class="sidebar-menu-list">
      <ul class="menu-list">
        <li class="menu-list-item"><a href="#">Test Item</a></li>
        <li class="menu-list-item"><a href="#">Test Item 2</a></li>
      </ul>    
     
      <div class="menu-list-action">
        <a href="#">Add Project</a>
      </div>
    </div>
  </div> <!-- Sidebar wrapper -->
    
  <!-- Main content wrapper -->
  <div class="main-wrapper"> 
    <!-- Main top section -->
    <div class="main-top-section">
      <!-- Top search bar -->
      <div class="top-search-bar">
        <!-- <a href="#" class="toggle&#45;sidebar"><i class="fa fa&#45;bars fa&#45;lg"></i></a> -->
        <form id="task-filter-form" class="task-filter-form">
          <input type="text text_box" placeholder="Filter tasks" >
        </form>
      </div> <!-- Top search bar -->
      <!-- Top icons -->
      <ul class="top-icons-list">
        <li class="top-icons-item">
          <a href="#" id="add-task-btn" class="add-task"></a>
        </li>
        <li class="top-icons-item">
          <a href="#" id="options-btn" class="options"></a>
        </li>
      </ul> <!-- Top icons -->
    </div> <!-- Main top section -->
    
    <!-- Dahsboard index template -->
    <h2>Hello From Application Index Template</h2>
    
  </div> <!-- Main content wrapper -->
  </script>
  
  <script type="text/javascript" src="assets/js/vendor.js"></script>
  <script type="text/javascript" src="assets/js/app_bundle.js"></script>

</body>
</html>
