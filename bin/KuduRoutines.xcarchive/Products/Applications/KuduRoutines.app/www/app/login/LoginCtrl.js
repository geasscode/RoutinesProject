angular.module('app.controllers')

.controller('LoginCtrl', ['$scope', '$state', '$ionicLoading', 'DBMgr', function($scope, $state, $ionicLoading, DBMgr) {
  	
  	$scope.login = function(user){
		DBMgr.getRestConfig().then(function(dbConfig){
			if(dbConfig.config){
				$ionicLoading.hide();
				$state.go('app.home');
			}else{
				$ionicLoading.hide();
				$state.go('app.home');
			}
		});
  		// $state.go('config');
  	};
}]);