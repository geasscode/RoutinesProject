/**
 * Food Safety Activity Controller
 *
 * @author Eric Feng, Colin Lin
 */
angular.module('app.controllers')
.controller('FsMainCtrl', ['$scope', '$state', '$stateParams', 'RoutineService', '$ionicModal', '$cordovaCamera', '$ionicLoading', '$ionicScrollDelegate','$timeout','$ionicPopup',
function($scope, $state, $stateParams, RoutineService, $ionicModal, $cordovaCamera, $ionicLoading, $ionicScrollDelegate,$timeout,$ionicPopup) {
	// current FS category
 	$scope.currentFsCatetory =  null;
 	// current FS question
 	$scope.currentQuestion = null;
 	// circular progress params
	$scope.configCircularParam = {
		circularNum: 0,						//圆圈进度条占用百分比,
		circularFrontColor: '#C9E604'		//前圆圈的颜色
	};
	
	//show or hide Circular Chart
	$scope.showChart = !angular.isUndefined($scope.configCircularParam.circularNum);
 	
  	//init template state
  	$scope.template = 'app/routine/fs/fs-item-list.html';
  	$scope.templateAnimate = '';

	$scope.routineService = RoutineService;

	// monitor progress change
	$scope.$watch("routineService.getCurrentActivityProgress()", function(newVal){
		$scope.configCircularParam.circularNum = newVal;
		
		$scope.$broadcast('updateCircularProgress', $scope, $scope.configCircularParam);
	});

	$scope.currentRoutine = RoutineService.getCurrentRoutine();

	var fsItemListScrollPosition  = {left: 0, top: 0};

	/**
	 * init data
	 */
	var initData = function(){
		var currentActivityItem = RoutineService.getCurrentActivityItem();

		if (null == currentActivityItem){
			$ionicLoading.show({
				template:'No food safety check activity at this hour!', 
				noBackdrop: true, 
				duration: 1500
			});
			return;
		}

		// init FS categories and product list of first category
		RoutineService.getFSCategoryList()
		.then(function(result){

			$scope.currentTime = RoutineService.getCurrentTimeItem();
			$scope.fsGroups = result;
//			RoutineService.saveEvalItemPicture($scope.fsGroups[2],"aaaa");
			
//			var item = {};
//			item.pictureId = "RTPIC_RI_RT_1431915154748SVHU_FCT0000015_FS_1431933658878WTDD";
//			item.dataType = "FSCategory";
//			RoutineService.deleteEvalItemPicture(item);
			
//			RoutineService.loadEvalItemPicture($scope.fsGroups[2]);
			
//			RoutineService. loadEvalItemPictureList($scope.fsGroups[1]);//.then(function(result){
//				if(result[0] &&result[0].evalImageSrc)
//					$scope.testImageSrc = result[0].evalImageSrc;
//			});
			// configuration of the circular progress bar
			$scope.configCircularParam.circularNum = currentActivityItem.progress || 0;
			
			$timeout(function() {
					$ionicScrollDelegate.$getByHandle('fsListScroll').scrollTop();
			}, 50);
		
		  	return result;
		});
	};

	// initialize data
	initData();
  	
  	/**
  	 * when the question text clicked
  	 *
  	 */
 	$scope.onFSQuestionClick = function(item){
		$scope.currentQuestion =  item;
		var answer = $scope.currentQuestion.answer;

		var shouldUpdateAnswer = false;
		// if original answer is blank or null, update FS question answer to Y
		if(answer == null || answer == ''){
			$scope.currentQuestion.answer = 'Y';
			shouldUpdateAnswer = true;
			// RoutineService.updateFSQuestionAnswer($scope.currentQuestion);
		}
		// if original answer is Y
		else if (answer == 'Y'){
			// go to picklist page if it has picklist items
			if (item.items != null && item.items.length > 0){
				// remember the fs item list scroll position, it will be use when go back
				fsItemListScrollPosition = $ionicScrollDelegate.$getByHandle('fsListScroll').getScrollPosition();
				$scope.templateAnimate = '';
		  		$scope.template = 'app/routine/fs/fs-item-detail.html';
//		  		$ionicScrollDelegate.$getByHandle('fsListScroll').scrollTop();
			}
			// update answer to N if it does not have picklist items
			else{
				$scope.currentQuestion.answer = 'N';
				shouldUpdateAnswer = true;
				// RoutineService.updateFSQuestionAnswer($scope.currentQuestion);
			}
		}
		// if original answer is N
		else if (answer == 'N'){
			// go to picklist page if it has picklist items
			if (item.items != null && item.items.length > 0){
				// remember the fs item list scroll position, it will be use when go back
				fsItemListScrollPosition = $ionicScrollDelegate.$getByHandle('fsListScroll').getScrollPosition();
				$scope.templateAnimate = '';
		  		$scope.template = 'app/routine/fs/fs-item-detail.html';
//		  		$ionicScrollDelegate.$getByHandle('fsListScroll').scrollTop();
			}
			// update answer to Y if it does not have picklist items
			else{
				$scope.currentQuestion.answer = 'Y';
				shouldUpdateAnswer = true;
				// RoutineService.updateFSQuestionAnswer($scope.currentQuestion);
			}
		}

		if (shouldUpdateAnswer){
			RoutineService.updateFSQuestionAnswer($scope.currentQuestion);
			// .then(function(result){
			// 	$scope.$eval(function(){
			// 		$scope.configCircularParam.circularNum = result;
			// 	})
			// })
		}
 	};


	/**
	 * when question answer icon clicked
	 * if the original answer is N, just toggle the answer to Y and stop the even propagation
	 * otherwise pass the event to onFSQuestionClick
	 * 
	 * @param {Object} item the food safety question which get clicked
	 * @param {Object} event
	 */
	$scope.onFSQuestionAnswerClick = function(item, $event){
		if(item.answer == 'N'){
			$event.stopPropagation();
			item.answer ='Y';
			RoutineService.updateFSQuestionAnswer(item);
		}else{
			//do nothing here, with this click event, onFSQuestionClick will be called
		}
	};
  	
  	/**
  	 * show the menu with comments, picture and help option
  	 *
  	 * @param item the FS category on which the menu will show
  	 */
	$scope.goToFsMenu = function(item){
		// remember the fs item list scroll position, it will be use when go back
		fsItemListScrollPosition = $ionicScrollDelegate.$getByHandle('fsListScroll').getScrollPosition();

		$scope.templateAnimate = 'temp-slide-animate';
  		$scope.template = 'app/routine/fs/fs-menu.html';
  		$scope.currentFsCatetory = item;

//  		$ionicScrollDelegate.$getByHandle('fsListScroll').scrollTop();
 	};
	
	/**
	 * show FS question list
	 *
	 */
	$scope.goToFsItemList = function(){
		$scope.templateAnimate = '';
		$scope.template = 'app/routine/fs/fs-item-list.html';
		 $timeout(function() {
 			$ionicScrollDelegate.$getByHandle('fsListScroll')
			.scrollTo(fsItemListScrollPosition.left, fsItemListScrollPosition.top);
  		}, 50);

    };
 	
 	/**
 	 * change current time
 	 *
 	 * @param isPrevious whether go to previous time or next time
 	 */
	$scope.changeCurrentTime = function(isPrevious){
		var newTimeItem = RoutineService.changeTime("ActivityFSCheck",isPrevious);

		if (null == newTimeItem){
			$ionicLoading.show({
				template:'No food safety check activity for ' + (isPrevious ? 'previous' : 'next')+ ' hour!', 
				noBackdrop: true, 
				duration: 1500
			});
			return;
		}

		// go back to fs item list if currently it's in fs detail UI
		if ($scope.template != 'app/routine/fs/fs-item-list.html'){
			$scope.templateAnimate = '';
			$scope.template = 'app/routine/fs/fs-item-list.html';
		}
		initData();
	};
	
	/**
	 * toggle pick list checked
	 *
	 * @param {Object} picklist picklist item
	 */
	$scope.onPicklistClick = function(picklist){
		
		if(!picklist.checked){
			picklist.checked = true;
		}else{
			picklist.checked = false;
		}

		var question = $scope.currentQuestion;

		RoutineService.updateFSPicklistChecked(question, picklist);
	};
	

	/**
	 * take picture for FS category
	 */
	$scope.fsMenuPictureClick = function(){
//		$ionicLoading.show({template:'Photos can be added to document findings', noBackdrop: true, duration: 1500});
		$scope.showItemPictureDialog();
	};
	
    $scope.showItemPictureDialog = function(){
		$ionicModal.fromTemplateUrl('app/routine/fs/'+'fs-item-image-list.html', {
		 	 scope: $scope
		}).then(function(modal) {
			 $scope.modal = modal;
			 $scope.modal.show();
			 loadFsImage();
		});
    };
	
	
	var loadFsImage= function(){
		RoutineService.loadEvalItemPictureList($scope.currentFsCatetory)
			.then(function(itemList){
				$scope.fsPictureList = itemList;
				if($scope.fsPictureList.length>0){
					for(var i = 0; i < $scope.fsPictureList.length; i++){
						RoutineService.loadEvalFsItemPicture($scope.fsPictureList[i].pictureId,$scope.currentFsCatetory.itemId,i)
							.then(function(data){
								$scope.fsPictureList[data.index].evalImageSrc = data.evalImageSrc;
								$scope.$apply();
							});
					}
				}else{
					$scope.takePicture();
				}

			});
	};
	
	var deleteFsPicture = function(item,$index){
		$ionicLoading.show({template: 'Deleting picture...'});
		RoutineService.deleteEvalItemPicture(item).then(function(result){
			$scope.fsPictureList.splice($index,1);
			$ionicLoading.hide();
		})
	};
	
	$scope.takePicture = function () {
		if($scope.fsPictureList && $scope.fsPictureList.length >= 3){
			$ionicLoading.show({template:'You can have maximum 3 pictures', noBackdrop: true, duration: 1500});
			return;
		}

	    var options = {
	        quality: 50,
	        destinationType: Camera.DestinationType.DATA_URL,
	        sourceType: Camera.PictureSourceType.CAMERA,
	        allowEdit:false,
	        encodingType: Camera.EncodingType.JPEG,
	        targetWidth: 480,
	        targetHeight: 360,
	        popoverOptions: CameraPopoverOptions,
	        saveToPhotoAlbum: false
	    };

	    $cordovaCamera.getPicture(options).then(function(imageData) {
	        return RoutineService.saveEvalItemPicture($scope.currentFsCatetory, imageData);
	    })
		.then(function(result){
			loadFsImage();
		})
		.catch(function(error){
			console.log(error);
		});
    };
    
    /**
     *	comments
     */
    $scope.comments = null;//use for show comment
    $scope.showDialog = function(type){
		$ionicModal.fromTemplateUrl('app/routine/common/'+type+'.html', {
		 	 scope: $scope
		}).then(function(modal) {
			 $scope.modal = modal;
 			 
 			 if(type == "comment"){
			 	if($scope.currentFsCatetory.comments)
			 		$scope.comments = $scope.currentFsCatetory.comments;
		 		else
		 			$scope.comments = null;
			 }
			 
			 $scope.modal.show();
		});
    };
	
	$scope.saveComments = function(){
		var routineComment  = document.getElementById('routineComment');
		$scope.currentFsCatetory.comments = routineComment.value;
		RoutineService.updateFSCategoryComments($scope.currentFsCatetory);
		$scope.hideDialog();
		$scope.goToFsItemList();
	};
	
    /**
     *
     */
	$scope.hideDialog = function() {
//		 $scope.modal.hide();
		 $scope.modal.remove();
		 $scope.showDialog();
		 $scope.fsPictureList = null;
	};

	$scope.underConstruction = function(){
		$ionicLoading.show({template:'under construction', noBackdrop: true, duration: 1500});
	};
	
	$scope.showConfirmDelete = function(item,$index) {
	   var confirmPopup = $ionicPopup.confirm({
	     title: 'Confirm',
		 template: 'Are you sure you want to delete this picture?'
	   });
	   confirmPopup.then(function(res) {
	     if(res) {
			deleteFsPicture(item,$index);
	     }
		 else {
		 	
	     }
	   });
	};
    
}]);
