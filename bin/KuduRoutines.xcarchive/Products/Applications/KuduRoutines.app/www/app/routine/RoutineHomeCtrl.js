/**
 * Routine Home Controller
 *
 * @author Eric Feng, Colin Lin
 */
angular.module('app.controllers')

.controller('RoutineHomeCtrl', ['$scope', '$rootScope', '$ionicPopup', '$state','RoutineService', 'StatusCheckService', '$ionicModal', '$ionicLoading','$location','$ionicScrollDelegate', 
function($scope, $rootScope, $ionicPopup, $state, RoutineService, StatusCheckService, $ionicModal, $ionicLoading, $location, $ionicScrollDelegate) {
	var currenthour = "";
	var correctedhour = "";
	var meridian = "";

	// init FS categories and product list of first category

	$scope.goToRoutineTime = function(){
		currenthour = new Date();
		correctedhour = currenthour.getHours();
		meridian = (correctedhour >= 12) ? "PM" : "AM";
		console.log(correctedhour + ':00 ' + meridian);
		$location.hash(((correctedhour + 11) % 12) + 1 + ':00 ' + meridian);
		$ionicScrollDelegate.anchorScroll(true);
  	}

	$scope.$on('$ionicView.enter', function(e, d){
		if (!RoutineService.getCurrentRoutine()){
			initData();
			// $scope.goToRoutineTime();
		} else {
			initData();
			// $scope.goToRoutineTime();
		}
	});

	$scope.currentTime = null;    // current selected time
	$scope.timeItems = null;      // time items of current routine
	$scope.currentRoutine = null; // current opened routine
 	// circular progress params
	$scope.configCircularParam = {
		circularNum: 0,						//圆圈进度条占用百分比,
		circularFrontColor: '#C9E604'		//前圆圈的颜色
	};


	$scope.routineService = RoutineService;
	// monitor progress change
	$scope.$watch("routineService.getRoutineProgress()", function(newVal){
		$scope.configCircularParam.circularNum = newVal;
		$scope.$broadcast('updateCircularProgress', $scope, $scope.configCircularParam);
	});

	//show or hide Circular Chart
	$scope.showChart = !angular.isUndefined($scope.configCircularParam.circularNum);

	function initData(){
		$ionicLoading.show({template: 'Loading...'});
		// init routine data for current date
		RoutineService.initRoutineForToday()
		.then(function(result){
			console.log(result);
			// console.log(currenthour);
			// console.log(correctedhour);
			$scope.timeItems = result.timeItems;
			$scope.currentRoutine = result.routine;

			$scope.configCircularParam = {
				circularNum: result.routine.progress || 0,	//圆圈进度条占用百分比,
				circularFrontColor: '#3498DB'				//前圆圈的颜色
			};
		
			$ionicLoading.hide();
		
			//show or hide Circular Chart
			$scope.showChart = !angular.isUndefined($scope.configCircularParam.circularNum);
		})
		.catch(function(err){
			if (err.status == 404){
				$ionicLoading.show({template:'Library data is unavailable.', noBackdrop: true, duration: 1500});
			}
		});
	};


	/**
	 * expand the time item
	 *
	 */
	$scope.expandTimeItem = function(item){
		if ($scope.currentTime == item && $scope.currentTime != null) {
			collapseTimeItem();
			return;
		}
	  	
	  	$scope.currentTime = item;
    };  

    /**
     * expand "now" item
     *
     */
    $scope.expandNowTimeItem = function(){
    	var item = RoutineService.getNowTimeItem();
    	$scope.expandTimeItem(item);
    	//TODO handle the scrolling for rows not in the visible area
    	// $ionicScrollDelegate.scrollTo(0, item.index * 25, true);
    	// console.log(item, $ionicScrollDelegate.getScrollPosition());
    };

    /**
     * open an acitity item 
     *
     */
	$scope.changeCurrentTime = function(timeItem, activityItem){
		RoutineService.setCurrentActivityItem(timeItem, activityItem);
		$scope.currentTime = timeItem;
		$scope.currentQuestion = activityItem;

		if (activityItem.dataType == 'Checks'){
				var answer = $scope.currentQuestion.answer;
				var shouldUpdateAnswer = false;
				// if original answer is blank or null, update FS question answer to Y
				if(answer == null || answer == ''){
					$scope.currentQuestion.answer = 'Y';
					shouldUpdateAnswer = true;
					// RoutineService.updateRTQuestionAnswer($scope.currentQuestion);
				}
				// if original answer is Y
				else if (answer == 'Y'){
					// go to picklist page if it has picklist items
					if (activityItem.items != null && activityItem.items.length > 0){
					}
					// update answer to N if it does not have picklist items
					else{
						$scope.currentQuestion.answer = 'N';
						shouldUpdateAnswer = true;
						// RoutineService.updateRTQuestionAnswer($scope.currentQuestion);
					}
				}
				// if original answer is N
				else if (answer == 'N'){
					// go to picklist page if it has picklist items
					if (activityItem.items != null && activityItem.items.length > 0){
					}
					// update answer to Y if it does not have picklist items
					else{
						$scope.currentQuestion.answer = 'Y';
						shouldUpdateAnswer = true;
						// RoutineService.updateRTQuestionAnswer($scope.currentQuestion);
					}
				}

				if (shouldUpdateAnswer){
					RoutineService.updateRTQuestionAnswer($scope.currentQuestion);
					// .then(function(result){
					// 	$scope.$eval(function(){
					// 		$scope.configCircularParam.circularNum = result;
					// 	})
					// })
				}
		}else if (activityItem.dataType == 'ActivityTakeTemp'){
			$state.go('app.temp-main');
		}else if (activityItem.dataType == 'ActivityFSCheck'){
			$state.go('app.fs-main');
		}else if (activityItem.dataType == 'ActivityTPCheck'){
			$state.go('app.tp-main');
		}else if (activityItem.dataType == 'ActivityFOHCheck'){
			$state.go('app.foh-main');
		}else if (activityItem.dataType == 'ActivityBOHCheck'){
			$state.go('app.boh-main');
		}else if (activityItem.dataType == 'DailyTaskCheck'){
			$state.go('app.dc-main');
		}else if (activityItem.dataType == 'BeefCookoutCheck'){
			$state.go('app.bcTemp-main');
		}else if (activityItem.dataType == 'BeefCookouts'){
			$state.go('app.cwTemp-main');
		}
	};

	$scope.onRTQuestionAnswerClick = function(child, $event){
		if(child.answer == 'N'){
			$event.stopPropagation();
			child.answer ='Y';
			RoutineService.updateRTQuestionAnswer(child);
		}else{
			//do nothing here, with this click event, onFSQuestionClick will be called
		}
	};
	
	/**
	 * collapse time item
	 *
	 */
	var collapseTimeItem = function(item){
		$scope.currentTime = null;
//		$event.stopPropagation();
	};
	
	/**
	 * show routine list modal
	 *
	 */
	$scope.showStatusListModal = function(){
		// $scope.routineList = RoutineService.getRoutineList();
        
        StatusCheckService.getCategoryList()
        .then(function(result) {
            console.log(result);
            $scope.routineCategoryLists = result;
            
            return StatusCheckService.getUploadStatus();
        })
        .then(function(result) {
            console.log(result);
            
            return StatusCheckService.getUploadHistoryList();
        })
		.then(function(result){
            console.log(result);
			$scope.uploadHistoryList = result;

			if (!$scope.statusListModal){
				$ionicModal.fromTemplateUrl('app/routine/common/status-check.html', {
				 	 scope: $scope
				}).then(function(modal) {
					 $scope.statusListModal = modal;
					 $scope.statusListModal.show();
				});
			}else{
				$scope.statusListModal.show();
			}
		})
	};

	$scope.showRoutineListModal = function(){
		// $scope.routineList = RoutineService.getRoutineList();
		RoutineService.getRoutineList()
		.then(function(result){
			$scope.routineList = result;

			if (!$scope.routineListModal){
				$ionicModal.fromTemplateUrl('app/routine/common/date-list.html', {
				 	 scope: $scope
				}).then(function(modal) {
					 $scope.routineListModal = modal;
					 $scope.routineListModal.show();
				});
			}else{
				$scope.routineListModal.show();
			}
		})
	};

	$scope.hideRoutineListModal = function(){
		$scope.routineListModal.hide();
	};

	$scope.hideStatusListModal = function(){
		$scope.statusListModal.hide();
	};

	/**
	 * open the specific routine record, load routine and all the items
	 *
	 */
	$scope.openRoutine = function(routine){
		// RoutineService.setCurrentDate(routine.routineDate);
		// $scope.currentDate = RoutineService.getCurrentDate();

		RoutineService.openRoutine(routine)
		.then(function(result){
			$scope.hideRoutineListModal();
			$scope.timeItems = result.timeItems;
			$scope.currentRoutine = result.routine;
			// var currentTime = null;
			// RoutineService.setCurrentTime(currentTime);
			// $scope.currentTime = currentTime;
		})
		.catch(function(err){
			if (err.status == 404){
				$ionicLoading.show({template:'Library data is unavailable.', noBackdrop: true, duration: 1500});
			}
		});

	};

	/**
	 * show dialog
	 *
	 */
    $scope.showDialog = function(type){
    	if (!$scope.modals){
    		$scope.modals = {};
    	}

    	var targetModal = $scope.modals[type];

    	if (!targetModal){
			$ionicModal.fromTemplateUrl('app/routine/common/'+type+'.html', {
			 	 scope: $scope
			}).then(function(modal) {
				 $scope.modals[type] = modal;
				 modal.show();
			});
		}else{
			targetModal.show();
		}
    }

	$scope.hideDialog = function(type) {
		 $scope.modals[type].hide();
	};

    /* 
     * Upload to Server 
     *
     */
	$scope.uploadToServer = function() {
        $ionicLoading.show({template: 'uploading...'});
        RoutineService.uploadToServer()
        .then(function(success){
            // Success
            $ionicLoading.hide();
            $scope.showAlert('Complete');
            console.log(success.data);
        })
        .catch(function(err) {
            // Error
            $scope.showAlert('Failed');
            $ionicLoading.hide();
            console.log(err);
        });
    };

    $scope.showConfirm = function(){
    	var confirmPopup = $ionicPopup.confirm({
    		title: 'Upload to Server',
    		template: 'Upload current routine to server?'
    	});

    	confirmPopup.then(function(res){
    		if(res){
    			$scope.uploadToServer();
    		}
    	})
    }

    $scope.showAlert = function(res){
    	var alertPopup = $ionicPopup.alert({
    		title: 'Upload to Server',
    		template: 'Upload ' + res +  '!'
    	})

    	alertPopup.then(function(res){
    		console.log(res);
    	})
    }


}]);
