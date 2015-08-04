'use strict';

angular.module('karmaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/profile', {
        templateUrl: 'app/main/profile/profile.html',
        controller: 'ProfileCtrl'
      });
  });
