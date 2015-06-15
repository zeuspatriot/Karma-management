'use strict';

angular.module('karmaApp')
  .controller('ProfileCtrl', function ($scope, Auth, User, Log, Rules, $routeParams) {
	$scope.showPerPage = 7;
	var getUser = function (){
		if($routeParams.user){
			$scope.user = User.show({id:$routeParams.user}, function(user){
				$scope.rules = Rules.getByUserId({id:$scope.user._id});
				$scope.log = Log.get({id: $scope.user._id},function(logs){getChartData(logs)});
				$scope.globalRules = Rules.getByUserId({id:"global"});
				console.log("user found");
			});
		}
		else{
			$scope.user = User.get(function(user){
				$scope.rules = Rules.getByUserId({id:$scope.user._id});
				$scope.log = Log.get({id: $scope.user._id},function(logs){getChartData(logs)});
				$scope.globalRules = Rules.getByUserId({id:"global"});	
			});
		};
	};
	getUser();
	$scope.role = Auth.getCurrentUser().role;
	$scope.$watch(function(){
    	return Auth.getCurrentUser().role;
    }, function(role){
    	$scope.role = role;
    });

	var getChartData = function (logs){
		if(!$scope.data){
			$scope.data = [
			  {
					key:"Latest Actions",
					values: []
			  },
			  {
					key:"Karma History",
					values: []
			  }
			];
		}
		var initPoints = 0;
		if(logs.log.length - $scope.data[0].values.length == 1 && $scope.data[0].values.length!=0){
			console.log($scope.data[1].values[$scope.data[1].values.length-1][1] + logs.log[logs.log.length-1].points);
			$scope.data[0].values.push([logs.log.length,logs.log[logs.log.length-1].points, logs.log[logs.log.length-1].date]);
			$scope.data[1].values.push([logs.log.length,$scope.data[1].values[$scope.data[1].values.length-1][1] + logs.log[logs.log.length-1].points, logs.log[logs.log.length-1].date]);	
		}
		else{
			logs.log.forEach(function (log, index){
				initPoints += log.points;
				$scope.data[0].values.push([index,log.points, log.date]);
				$scope.data[1].values.push([index,initPoints, log.date]);
			});
		}
  };
   
  $scope.xFunction = function(d){
			return function(d){
				return d[2] || "empty";
			};
		}

	$scope.ruleCollapse = function (rule){
	  $scope.rules.content.forEach(function(elem){
		elem.active = false;
	  });
	  rule.active =true;
	  $scope.rules.checkboxes = true;
	};

	$scope.changeUserKarma = function(id, karma){
	  karma.negative ? karma.points = karma.points*-1 : karma.points;
	  karma.id = [].concat(id);
	  User.changeUserKarma(karma, function(res){
		console.log("user: ", res);
		getUser();
	  });
	  karma.active = false;
	};

	$scope.newRule = {};
	$scope.addRule = function (){
			Rules.addRules({
				userId:$scope.user._id,
				msg: $scope.newRule.text,
				points: $scope.newRule.points
			}, function(rules){
				$scope.rules = Rules.getByUserId({id:$scope.user._id});
				$scope.newRule = {};
			});
	};

	$scope.removeRule = function (msg){
		var user = $scope.rules.user;
  	Rules.deleteById({userId: user , msg:msg},function(res){
  		getUser();
  	});
  };

  $scope.showMoreLogs = function(){
  	$scope.showPerPage += 10;
  }
});