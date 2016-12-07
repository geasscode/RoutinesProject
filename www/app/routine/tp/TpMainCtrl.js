/**
 * Food Safety Activity Controller
 *
 * @author Eric Feng, Colin Lin
 */
angular.module('app.controllers')
.controller('TpMainCtrl', ['$scope', '$state', '$stateParams', 'RoutineService', '$ionicModal', '$cordovaCamera', '$ionicLoading', '$ionicScrollDelegate','$timeout','$ionicPopup',
function($scope, $state, $stateParams, RoutineService, $ionicModal, $cordovaCamera, $ionicLoading, $ionicScrollDelegate,$timeout,$ionicPopup) {
	// current FS category
 	$scope.currentTpCatetory =  null;
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
  	$scope.template = 'app/routine/tp/tp-item-list.html';
  	$scope.templateAnimate = '';

	$scope.routineService = RoutineService;

	// monitor progress change
	$scope.$watch("routineService.getCurrentActivityProgress()", function(newVal){
		$scope.configCircularParam.circularNum = newVal;
		
		$scope.$broadcast('updateCircularProgress', $scope, $scope.configCircularParam);
	});

	$scope.currentRoutine = RoutineService.getCurrentRoutine();

	var tpItemListScrollPosition  = {left: 0, top: 0};

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
		RoutineService.getTPCategoryList()
		.then(function(result){

			$scope.currentTime = RoutineService.getCurrentTimeItem();
			$scope.tpGroups = result;
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
					$ionicScrollDelegate.$getByHandle('tpListScroll').scrollTop();
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
 	$scope.onTPQuestionClick = function(item){
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
				tpItemListScrollPosition = $ionicScrollDelegate.$getByHandle('tpListScroll').getScrollPosition();
				$scope.templateAnimate = '';
		  		$scope.template = 'app/routine/tp/tp-item-detail.html';
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
				tpItemListScrollPosition = $ionicScrollDelegate.$getByHandle('tpListScroll').getScrollPosition();
				$scope.templateAnimate = '';
		  		$scope.template = 'app/routine/tp/tp-item-detail.html';
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
			RoutineService.updateTPQuestionAnswer($scope.currentQuestion);
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
	$scope.onTPQuestionAnswerClick = function(item, $event){
		if(item.answer == 'N'){
			$event.stopPropagation();
			item.answer ='Y';
			RoutineService.updateTPQuestionAnswer(item);
		}else{
			//do nothing here, with this click event, onFSQuestionClick will be called
		}
	};
  	
  	/**
  	 * show the menu with comments, picture and help option
  	 *
  	 * @param item the FS category on which the menu will show
  	 */
	$scope.goToTpMenu = function(item){
		// remember the fs item list scroll position, it will be use when go back
		tpItemListScrollPosition = $ionicScrollDelegate.$getByHandle('tpListScroll').getScrollPosition();

		$scope.templateAnimate = 'temp-slide-animate';
  		$scope.template = 'app/routine/tp/tp-menu.html';
  		$scope.currentTpCatetory = item;

//  		$ionicScrollDelegate.$getByHandle('fsListScroll').scrollTop();
 	};
	
	/**
	 * show FS question list
	 *
	 */
	$scope.goToTpItemList = function(){
		$scope.templateAnimate = '';
		$scope.template = 'app/routine/tp/tp-item-list.html';
		 $timeout(function() {
 			$ionicScrollDelegate.$getByHandle('tpListScroll')
			.scrollTo(tpItemListScrollPosition.left, tpItemListScrollPosition.top);
  		}, 50);

    };
 	
 	/**
 	 * change current time
 	 *
 	 * @param isPrevious whether go to previous time or next time
 	 */
	$scope.changeCurrentTime = function(isPrevious){
		var newTimeItem = RoutineService.changeTime("ActivityTPCheck",isPrevious);

		if (null == newTimeItem){
			$ionicLoading.show({
				template:'No food safety check activity for ' + (isPrevious ? 'previous' : 'next')+ ' hour!', 
				noBackdrop: true, 
				duration: 1500
			});
			return;
		}

		// go back to fs item list if currently it's in fs detail UI
		if ($scope.template != 'app/routine/tp/tp-item-list.html'){
			$scope.templateAnimate = '';
			$scope.template = 'app/routine/tp/tp-item-list.html';
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

		RoutineService.updateTPPicklistChecked(question, picklist);
	};
	

	/**
	 * take picture for FS category
	 */
	$scope.tpMenuPictureClick = function(){
//		$ionicLoading.show({template:'Photos can be added to document findings', noBackdrop: true, duration: 1500});
		$scope.showItemPictureDialog();
	};
	
    $scope.showItemPictureDialog = function(){
		$ionicModal.fromTemplateUrl('app/routine/tp/'+'tp-item-image-list.html', {
		 	 scope: $scope
		}).then(function(modal) {
			 $scope.modal = modal;
			 $scope.modal.show();
			 loadTpImage();
		});
    };
	
	
	var loadTpImage= function(){
		RoutineService.loadEvalTPItemPictureList($scope.currentTpCatetory)
			.then(function(itemList){
				$scope.tpPictureList = itemList;
				if($scope.tpPictureList.length>0){
					for(var i = 0; i < $scope.tpPictureList.length; i++){
						RoutineService.loadEvalTpItemPicture($scope.tpPictureList[i].pictureId,$scope.currentTpCatetory.itemId,i)
							.then(function(data){
								$scope.tpPictureList[data.index].evalImageSrc = data.evalImageSrc;
								$scope.$apply();
							});
					}
				}else{
					$scope.takePicture();
				}

			});
	};
	
	var deleteTpPicture = function(item,$index){
		$ionicLoading.show({template: 'Deleting picture...'});
		RoutineService.deleteEvalItemPicture(item).then(function(result){
			$scope.tpPictureList.splice($index,1);
			$ionicLoading.hide();
		})
	};
	
	$scope.takePicture = function () {
		if($scope.tpPictureList && $scope.tpPictureList.length >= 3){
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
	        return RoutineService.saveEvalItemPicture($scope.currentTpCatetory, imageData);
	    })
		.then(function(result){
			loadTpImage();
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
			 	if($scope.currentTpCatetory.comments)
			 		$scope.comments = $scope.currentTpCatetory.comments;
		 		else
		 			$scope.comments = null;
			 }
			 
			 $scope.modal.show();
		});
    };
	
	$scope.saveComments = function(){
		var routineComment  = document.getElementById('routineComment');
		$scope.currentTpCatetory.comments = routineComment.value;
		RoutineService.updateTPCategoryComments($scope.currentTpCatetory);
		$scope.hideDialog();
		$scope.goToTpItemList();
	};
	
    /**
     *
     */
	$scope.hideDialog = function() {
//		 $scope.modal.hide();
		 $scope.modal.remove();
		 $scope.showDialog();
		 $scope.tpPictureList = null;
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
			deleteTpPicture(item,$index);
	     }
		 else {
		 	
	     }
	   });
	};
    
}]);
