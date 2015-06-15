'use strict';

angular.module('karmaApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    getUsers();
    $scope.changes = {};
    function getUsers (){
      $scope.users = User.query(function(users){
        $scope.teams = [];
        $scope.jobCodes = [];
        $scope.users.forEach(function(user){
          if(user.team && $scope.teams.indexOf(user.team) == -1) $scope.teams.push(user.team);
          if(user.jobCode && $scope.jobCodes.indexOf(user.jobCode) == -1) $scope.jobCodes.push(user.jobCode);
        });
      });
    };
    
    $scope.promote = function(id){
      User.update({id:id, update:{role:'admin'}}, function(user){
        getUsers();
      });
    };
    $scope.changeData = function(id, update, option){
      option == 'team' ? update = {team: update.team} 
                      : update = {jobCode: update.jobCode};
      User.update({id:id, update: update}, function(user){
        getUsers();
        $scope.changes = {};
      });
    };
    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });
