angular.module('app.controllers')
.controller('ConfigCtrl', ['$scope', '$state', '$parse', '$ionicModal', 'ionicTimePicker', 'ConfigService', 'DBMgr', function ($scope, $state, $parse, $ionicModal, ionicTimePicker, ConfigService, DBMgr) {
	var targetElement = '';

	$scope.restConfigs = {
		_id: 'rest_config',
		mon: {
			startTime: '6:00AM',
			endTime: '10:30AM',
			filters: {
				dt: false,
				dr: false,
				rr: false,
				fs: false
			}
		},
		tue: {
			startTime: '6:00AM',
			endTime: '10:30AM',
			filters: {
				dt: false,
				dr: false,
				rr: false,
				fs: false
			}
		},
		wed: {
			startTime: '6:00AM',
			endTime: '10:30AM',
			filters: {
				dt: false,
				dr: false,
				rr: false,
				fs: false
			}
		},
		thu: {
			startTime: '6:00AM',
			endTime: '10:30AM',
			filters: {
				dt: false,
				dr: false,
				rr: false,
				fs: false
			}
		},
		fri: {
			startTime: '6:00AM',
			endTime: '10:30AM',
			filters: {
				dt: false,
				dr: false,
				rr: false,
				fs: false
			}
		},
		sat: {
			startTime: '6:00AM',
			endTime: '10:30AM',
			filters: {
				dt: false,
				dr: false,
				rr: false,
				fs: false
			}
		},
		sun: {
			startTime: '6:00AM',
			endTime: '10:30AM',
			filters: {
				dt: false,
				dr: false,
				rr: false,
				fs: false
			}
		}
	}

	$scope.dayPart = new Date().getDay();

	$scope.hrsOps = {
		openHours: '6:00AM',
		closingHours: '12:00AM'
	}


	if($scope.dayPart === 'Breakfast'){
		$scope.restConfigs.mon.startTime = "6:00AM"
		$scope.restConfigs.mon.endTime = "12:00AM"
	}


	$scope.saveRestConfig = function(){
		//TODO: save restaurant config
		// console.log($scope.restConfigs);
		ConfigService.saveConfig($scope.restConfigs);
		$state.go('app.home');

	}

	$scope.timePicker = {
		callback: function (val) {      //Mandatory
		  if (typeof (val) === 'undefined') {
		    console.log('Time not selected');
		  } else {
		    var selectedTime = new Date(val * 1000);
		    var hour = selectedTime.getUTCHours();
            var meridian = hour >= 12? "PM" : "AM";
            var zero = selectedTime.getUTCMinutes() >= 10 ? "" : "0";
            selectedTime = ((hour +11) % 12 + 1) + ":" + zero + selectedTime.getUTCMinutes() + ' ' + meridian;
		    var el = $parse(targetElement);
		    el.assign($scope, selectedTime);
		    console.log($scope.dayPart);
		  }
	},
		// inputTime: 50400,   //Optional
		format: 12,         //Optional
		step: 1,           //Optional
		setLabel: 'Set'    //Optional
	};

	$scope.openTimePicker = function(val){
		ionicTimePicker.openTimePicker($scope.timePicker);
		targetElement = val
	};
   
}]);