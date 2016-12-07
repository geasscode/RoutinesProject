angular.module('app.controllers', [])

.controller('AppCtrl', ['$scope', '$rootScope', '$state', '$ionicHistory', 'RoutineService', '$ionicModal', function($scope, $rootScope, $state, $ionicHistory, RoutineService, $ionicModal) {
 /* $scope.currentRontineHour = null;	 

  $scope.$on('hourChangeEvent', function (event, data) {
  	console.log(data); 
  	$scope.currentRontineHour = data;;	 
  });*/

	$scope.gotoReportsHome = function(){
		$ionicHistory.nextViewOptions({historyRoot: true});
		$state.go('app.reports');
	}

}]);