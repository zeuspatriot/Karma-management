'use strict';

angular.module('karmaApp')
	.controller('MainCtrl', function ($scope, $http, $location, $window, User, Log, Rules, Auth, $timeout, $mdSidenav, $mdUtil, $log) {
		$scope.toggleRight = buildToggler('right');
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                $log.debug("toggle " + navID + " is done");
              });
          },200);
      return debounceFn;
    }
    $scope.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };


		$scope.users = User.query(function(users){
			// chartData.processChartData(users);
			$scope.filters = {teams:[],jobCodes:[]}
			filterUsers(users, $scope.filters);
			$scope.teams = [];
			$scope.jobCodes = [];
			$scope.users.forEach(function(user){
				if(user.team && $scope.teams.indexOf(user.team) == -1) $scope.teams.push(user.team);
				if(user.jobCode && $scope.jobCodes.indexOf(user.jobCode) == -1) $scope.jobCodes.push(user.jobCode);
			});
		});
		$scope.filteredUsers = [];
		$scope.filteredChartData = [];
		$scope.newRuleFlag = false;
	
		$scope.rules = Rules.getByUserId({id: "global"});

		$scope.role = Auth.getCurrentUser().role;
		$scope.$watch(function(){
			return Auth.getCurrentUser().role;
		}, function(role){
			$scope.role = role;
		});
		$scope.$watch(function(){
			return $scope.changeKarma;
		}, function(karma){
			$scope.changeKarma = karma;
		})

		// $scope.changeKarma = {
		// 	users : [],
		// 	ids : []
		// };
		$scope.changeKarma = [];
		// Users are filtered with the help of checkboxes.
		var filterUsers = function(users, filters){
			$scope.filteredUsers = users;
			$scope.filteredChartData = [];

			var isUnique = function(arr, name){
				var unique = true;
				arr.forEach(function(elem){
					if(elem.key == name) unique = false;
				});
				return unique;
			};

			if(filters.teams.length){
				$scope.filteredUsers = users.filter(function(user){
					return filters.teams.indexOf(user.team) > -1;
				}) 
			}
			if(filters.jobCodes.length){
				$scope.filteredUsers = $scope.filteredUsers.filter(function(user){
					return filters.jobCodes.indexOf(user.jobCode) > -1;
				})
			}
			$scope.filteredUsers.forEach(function(user, index){
				if(isUnique($scope.filteredChartData, user.name)){
					$scope.filteredChartData.push({
						key: user.name,
						values : [[1, user.points, user.name, user._id]]
					})
				}
				else{
					$scope.filteredChartData[index].values[0][1]= user.points;
				}
			})
		} // END of filterUsers(users, filters)

		$scope.xFunction = function(d){
			return function(d){
				return "Points";
			};
		}

		$scope.clearTmp = function (){
			$scope.changeKarma = [];
			$scope.rules.content.forEach(function(elem){
				elem.active = false;
			});
			$scope.rules.checkboxes = false;
		};

		//Prefilment of Users who will recieve karma change
		$scope.selDeSelUserForKarmaChange = function(name, id){
			var karmaBeforeSort = $scope.changeKarma,
					karmaAfterSort = $scope.changeKarma.filter(function(user){
					return user.name != name;
				});
			if(karmaBeforeSort.length == karmaAfterSort.length){
				$scope.changeKarma.push({name:name, id:id});
			}
			else{
				$scope.changeKarma = karmaAfterSort;
			}
		};

		$scope.isUserSelected = function(name){
			var presence = false;
			$scope.changeKarma.forEach(function(user){
				if(user.name == name){
					presence = true;
				}
			});
			return presence;
		};

		$scope.ruleCollapse = function (rule){
			$scope.rules.content.forEach(function(elem){
				elem.active = false;
			});
			rule.active = true;
			$scope.rules.checkboxes = true;
		};

		$scope.changeUserKarma = function(usersToChange, karma){
			karma.id = [];
			usersToChange.forEach(function(user){
				karma.id.push(user.id);
			});
			User.changeUserKarma(karma, function(res){
				// console.log(res);
				fetchUsersAfterSave($scope.users, karma.id, karma);
			});
			$scope.clearTmp();
			$scope.close();
		};

		var fetchUsersAfterSave = function(users, ids, update){
			users.forEach(function(user){
				if(ids.indexOf(user._id) >= 0){
					user.points += update.points;
					user.recent = {
						points: update.points,
						date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
						msg: update.msg,
						note: update.note,
						updatedBy: Auth.getCurrentUser().name
					}
				}
				filterUsers(users, $scope.filters);
			})
		};

		$scope.newRule = {};
		$scope.addRule = function(){
			Rules.addRules({
				userId:'global',
				msg: $scope.newRule.text,
				points: $scope.newRule.points
			}, function(rules){
				$scope.rules = Rules.getByUserId({id:"global"});
				$scope.newRule = {};
				$scope.newRuleFlag = false;
			});
		};

		$scope.removeRule = function (msg){
			var user = $scope.rules.user;
			Rules.deleteById({userId: user , msg:msg},function(res){
				$scope.rules = Rules.getByUserId({id: "global"});
			});
		};

		$scope.filtersChange = function(change, attr){
			if(attr == "team"){
				if($scope.filters.teams.indexOf(change) == -1){
					$scope.filters.teams.push(change);
				}
				else{
					var ind = $scope.filters.teams.indexOf(change);
					$scope.filters.teams.splice(ind, 1);
				}
			}
			if(attr == "jobCode"){
				if($scope.filters.jobCodes.indexOf(change) == -1){
					$scope.filters.jobCodes.push(change);
				}
				else{
					var ind = $scope.filters.jobCodes.indexOf(change);
					$scope.filters.jobCodes.splice(ind, 1);
				}	
			}
			filterUsers($scope.users, $scope.filters);
		};
		$scope.$on('elementClick.directive', function(angularEvent, event){
			$window.location.replace("/profile?user="+event.point[3]);

			
			// console.log(event);
		});
		$scope.newRuleTogle = function(){
			$scope.newRuleFlag = !$scope.newRuleFlag;
		};

		$scope.getActiveRule = function(){
			return $scope.rules.content.filter(function(rule){return rule.active})[0];
		}
})