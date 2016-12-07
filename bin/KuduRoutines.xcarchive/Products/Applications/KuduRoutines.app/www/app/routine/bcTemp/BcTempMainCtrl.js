angular.module('app.controllers')
.controller('BcTempMainCtrl', ['$scope', '$stateParams' ,'$ionicModal', 'RoutineService', '$ionicPopup', '$cordovaCamera', 'BlueThermService', '$ionicSlideBoxDelegate', '$timeout', '$ionicLoading','$ionicPopover','$rootScope',
function($scope, $stateParams ,$ionicModal, RoutineService, $ionicPopup, $cordovaCamera, BlueThermService, $ionicSlideBoxDelegate, $timeout, $ionicLoading,$ionicPopover,$rootScope) {
	//use for switch is start Thermo method
	var isUseThermo = true;
	
  	var PRODUCT_DETAIL_TEMPLATE = 'app/routine/bcTemp/bcTemp-product-detail.html';
  	var PRODUCT_DETAIL_TEMPLATE2 = 'app/routine/bcTemp/bcTemp-product-detail2.html';
  	var PRODUCT_LIST_TEMPLATE = 'app/routine/bcTemp/bcTemp-product-list.html';
    var PRODUCT_RIBBON = 'app/routine/bctemp/bcTemp-ribbon.html';
	// monitor completion bardge
	$scope.lastTemplate = null;
	
	/**
	 * Thermo
	 * */
    var THERMO_MAX_VALUE = 212; //100°
    var THERMO_MIN_VALUE = -32;  //0°
    
    //From routine.css  temp-thermo-img  & temp-thermo-circle
    var THERMO_HEIGHT = 250 +12 ; //height + top
    var THERMO_VALUE_CIRCLE_HEIGHT = 26;
    
    //from view
    var THERMO_CIRCLE_HEIGHT = 40;
    var THERMO_TOP_HEIGHT= 60 -  THERMO_VALUE_CIRCLE_HEIGHT/2;
    var THERMO_CENTER_HEIGHT= 70;
    var THERMO_BOTTOM_HEIGHT= 75;
    
	var THERMO_CIRCLE_DEFAULT_POSITION = THERMO_HEIGHT - THERMO_VALUE_CIRCLE_HEIGHT - (THERMO_CIRCLE_HEIGHT - THERMO_VALUE_CIRCLE_HEIGHT)/2 ;
	var THERMO_CIRCLE_START_POSITION = THERMO_HEIGHT - THERMO_CIRCLE_HEIGHT - (THERMO_VALUE_CIRCLE_HEIGHT)/2 ;
    
	
	$scope.routineService = RoutineService;

	// monitor progress change
	$scope.$watch("routineService.getCurrentActivityProgress()", function(newVal){
		$scope.configCircularParam.circularNum = newVal;
		
		$scope.$broadcast('updateCircularProgress', $scope, $scope.configCircularParam);
	});


	$scope.ribbonBack = function(newVal){
		$scope.template = $scope.lastTemplate;
	};
	
	function refreshTempProductDetail(){
		// $ionicSlideBoxDelegate.update();
		if ($scope.template == PRODUCT_DETAIL_TEMPLATE){
			$scope.template = PRODUCT_DETAIL_TEMPLATE2;
			// $ionicSlideBoxDelegate.update();
		}else if ($scope.template == PRODUCT_DETAIL_TEMPLATE2){
			$scope.template = PRODUCT_DETAIL_TEMPLATE;
			// $ionicSlideBoxDelegate.update();
		}
	};

	function initData(){
		var currentActivityItem = RoutineService.getCurrentActivityItem();

		if (null == currentActivityItem){
			$ionicLoading.show({template:'No take temperature activity for this moment!', noBackdrop: true, duration: 1500});
			return;
		}

		RoutineService.getCombinedTempProductList()
		.then(function(result){

				refreshTempProductDetail();

				$scope.currentTime = RoutineService.getCurrentTimeItem();
				// init temp product data
				$scope.tempActiveSlide = 0;
				$scope.tempProductList = result;
				$scope.currentTempProduct = $scope.tempProductList[0];

				$scope.configCircularParam.circularNum = currentActivityItem.progress || 0;

				initTemperature();
			    if(!isUseThermo){
			   		moveThermo();
			    }
		});
	};

		// current routine
	$scope.currentRoutine = RoutineService.getCurrentRoutine();
 	// circular progress params
	$scope.configCircularParam = {
		circularNum: 0,							//圆圈进度条占用百分比, 
		circularFrontColor: '#DF9E37'			//前圆圈的颜色
	};
	
	//show or hide Circular Chart
	$scope.showChart = !angular.isUndefined($scope.configCircularParam.circularNum);
	$scope.template = PRODUCT_DETAIL_TEMPLATE;
	$scope.tempActiveSlide = 0;

	initData();
	
	// use for change tempFootprintAlertIcon
	$scope.tempFootprintAlertIcon = true;
	
	// $scope.currentDate = RoutineService.getCurrentDate();

    // $scope.restaurantNum = '#123456';
    $scope.deviceInfo = 'Your bluetooth thermometer is not connected. Click on the ' +
		'tile to enter Manual Temperature';
	
	$scope.templateAnimate = '';
	

	$scope.manualTemperature = {value: null};//Manual input temperature
	$scope.temperature = null;//MachineTemperature
    $scope.connectedState = null;

    //thermo line color
    $scope.thermoTopColor = null;
    $scope.thermoCenterColor = null;
	$scope.thermoBottomColor = null;
	
	//CurrentTempProduct validationRule
    $scope.itemMax = null;
    $scope.itemMin = null;
	
    //温度计值 圆  颜色  位置 
    $scope.thermoCircleColor=null;
    $scope.thermoPosition= null;
	
    var initTemperature = function(){
	    $scope.itemMax = $scope.currentTempProduct.validationRule.max;
		$scope.itemMin = $scope.currentTempProduct.validationRule.min;
		updateTempValueColor();
		initThermoValue();
    	if(isUseThermo){
	    	stopTakeTemp();
			startTakeTemp();
    	}
    	
    }
    
    var initThermoValue = function(){
    	//init thermo circle value
    	$scope.thermoPosition = THERMO_CIRCLE_DEFAULT_POSITION +'px';
    	$scope.thermoCircleColor ="grey";
    	
    	//init line color
    	$scope.thermoCenterColor = "green";
    	if($scope.itemMax && $scope.itemMin){
		    $scope.thermoTopColor = "red";
			$scope.thermoBottomColor = "red";
    	}else if($scope.itemMax) {
		    $scope.thermoTopColor = "red";
			$scope.thermoBottomColor = "green";
    	}else if($scope.itemMin){
    		$scope.thermoTopColor = "green";
			$scope.thermoBottomColor = "red";
    	}
    }
    
	$scope.tempValueColor ="black";
	
	var updateTempValueColor = function(){
		if(!$scope.currentTempProduct.temperature){
			$scope.tempValueColor ="black";
			return;
		}
			
		if($scope.itemMax && $scope.itemMin){
			if($scope.currentTempProduct.temperature>$scope.itemMax||$scope.currentTempProduct.temperature<$scope.itemMin){
				$scope.tempValueColor = "red"
			}else{
				$scope.tempValueColor = "green"
			}
    	}else if($scope.itemMax) {
    		if($scope.currentTempProduct.temperature>$scope.itemMax){
    			$scope.tempValueColor = "red"
    		}else{
    			$scope.tempValueColor = "green"
    		}
    	}else if($scope.itemMin){
    		if($scope.currentTempProduct.temperature<$scope.itemMin){
    			$scope.tempValueColor = "red"
    		}else{
    			$scope.tempValueColor = "green"
    		}
    	}
	
	};

	var moveThermo = function(){
    	if(!isUseThermo){
    		$scope.isShowTempEditor = "NC"
    		$scope.connectedState ="NC";
    		HERMO_MAX_VALUE = 212; 
    		THERMO_MIN_VALUE = -32;  
	    	
	    	$scope.temperature = null;
//		    $scope.itemMax = null;
//	   		$scope.itemMin = 80;
    	}
    	if($scope.temperature){
	    	if($scope.itemMax && $scope.itemMin){
			    $scope.thermoTopColor = "red";
				$scope.thermoBottomColor = "red";
		    	if( $scope.temperature < $scope.itemMin){
		    		$scope.thermoPosition = THERMO_CIRCLE_START_POSITION - THERMO_BOTTOM_HEIGHT/($scope.itemMin- THERMO_MIN_VALUE) * ($scope.temperature - THERMO_MIN_VALUE)  + "px";
		    		$scope.thermoCircleColor="red";
		    	}else if($scope.temperature > $scope.itemMax){
					$scope.thermoPosition = THERMO_CIRCLE_START_POSITION -THERMO_BOTTOM_HEIGHT - THERMO_CENTER_HEIGHT -  THERMO_TOP_HEIGHT/(THERMO_MAX_VALUE-$scope.itemMax) * ($scope.temperature - $scope.itemMax)  + "px";
		    		$scope.thermoCircleColor="red";
		    	}else{
			    	$scope.thermoPosition = THERMO_CIRCLE_START_POSITION -THERMO_BOTTOM_HEIGHT - THERMO_CENTER_HEIGHT/($scope.itemMax-$scope.itemMin) * ($scope.temperature - $scope.itemMin)  + "px";
		    		$scope.thermoCircleColor="green";
		    	}
	    	}else if($scope.itemMax) {
			    $scope.thermoTopColor = "red";
			    $scope.thermoCenterColor = "green";
				$scope.thermoBottomColor = "green";
				if($scope.temperature > $scope.itemMax){
					$scope.thermoPosition = THERMO_CIRCLE_START_POSITION -THERMO_BOTTOM_HEIGHT - THERMO_CENTER_HEIGHT -  THERMO_TOP_HEIGHT/(THERMO_MAX_VALUE-$scope.itemMax) * ($scope.temperature - $scope.itemMax)  + "px";
		    		$scope.thermoCircleColor="red";
		    	}else{
			    	$scope.thermoPosition = THERMO_CIRCLE_START_POSITION  - (THERMO_CENTER_HEIGHT+THERMO_BOTTOM_HEIGHT)/($scope.itemMax-THERMO_MIN_VALUE) * ($scope.temperature - THERMO_MIN_VALUE)  + "px";
		    		$scope.thermoCircleColor="green";
		    	}
	    	}else if($scope.itemMin){
	    		$scope.thermoTopColor = "green";
				$scope.thermoBottomColor = "red";
		    	if( $scope.temperature < $scope.itemMin){
		    		$scope.thermoPosition = THERMO_CIRCLE_START_POSITION - THERMO_BOTTOM_HEIGHT/($scope.itemMin- THERMO_MIN_VALUE) * ($scope.temperature - THERMO_MIN_VALUE)  + "px";
		    		$scope.thermoCircleColor="red";
		    	}else{
			    	$scope.thermoPosition = THERMO_CIRCLE_START_POSITION -THERMO_BOTTOM_HEIGHT - (THERMO_CENTER_HEIGHT+THERMO_TOP_HEIGHT)/(THERMO_MAX_VALUE - $scope.itemMin ) * ($scope.temperature - $scope.itemMin)  + "px";
		    		$scope.thermoCircleColor="green";
		    	}
	    	}
    	}

    }
    $scope.isShowTempEditor = "NC";
    //探测温度成功
    var takeTempSuccess = function(value){
    	$scope.$apply(function() {
            if(value == "NC"){
                $scope.alertHide = false;
           		$scope.connectedState = value;
           		initThermoValue();
           		if($scope.isShowTempEditor !="NC")
           			$scope.isShowTempEditor = "NC";
            }else if(value=="C"){
                    $scope.alertHide = true;
                    if($scope.connectedState=="work"){
                        $scope.connectedState = "finish";//use for lock this block
                        $scope.currentTempProduct.temperature = parseFloat($scope.temperature);
                        updateTempValueColor();
                        RoutineService.updateTempProductTemperature($scope.currentTempProduct).
                        then(function(){
                        	if(RoutineService.getCurrentActivityItem().showCompletionBardge){
								$scope.lastTemplate = $scope.template;
								$scope.template = PRODUCT_RIBBON;
                        	}
                        });
                        
                        initThermoValue();
                        $scope.temperature = null;
                    }else{
                        $scope.connectedState = value;
                   		if($scope.isShowTempEditor !="C")
           					$scope.isShowTempEditor = "C";
                    }
            }else{
                $scope.alertHide = true;
                $scope.temperature = value;

                $scope.connectedState = "work";
         		if($scope.isShowTempEditor !="work")
   					$scope.isShowTempEditor = "work";
                moveThermo();
            }
        });
    }
    
    var takeTempFailed = function(){
        alert('take temp failed.');
    }
    
        //开始探测温度
    var startTakeTemp = function(){
        $scope.isStart = true;
        BlueThermService.takeTemp(takeTempSuccess,takeTempFailed);
    }
            
    //停止探测温度
    var stopTakeTemp = function(){
        $scope.connectedState = "";
        $scope.temperature = null;
        $scope.isStart = false;
        BlueThermService.stopTakeTemp();
    }
    
    $scope.productSlideChanged = function(index){

		var item = $scope.tempProductList[index];
		$scope.tempActiveSlide = index;
		
		if (item.imageSrc){
			$scope.currentTempProduct = item;
			initTemperature();
		}else{
			RoutineService.loadItemPictures(item)
			.then(function(){
				$scope.currentTempProduct = item;
				$ionicSlideBoxDelegate.update();
				initTemperature();
			})
		}
	}
    

  	
  	
  	
	$scope.changeCurrentTime = function(isbefore){
		var newTimeItem = RoutineService.changeTime("ActivityTakeTemp",isbefore);//ActivityFSCheck

		if (null == newTimeItem){
			$ionicLoading.show({
				template:'No take temperature activity for ' + (isbefore ? 'previous' : 'next')+ ' time!', 
				noBackdrop: true, 
				duration: 1500
			});
			return;
		}
		initData();
	}
  	
  	/**
  	 * switch between product list view and slide view
  	 *
  	 */
 	$scope.switchProductView = function(item){
 		if($scope.template == PRODUCT_LIST_TEMPLATE){
 			$scope.templateAnimate = '';
			$scope.template = PRODUCT_DETAIL_TEMPLATE;
 		}else{
	 		$scope.templateAnimate = 'temp-slide-animate';
  			$scope.template = PRODUCT_LIST_TEMPLATE;
 		}
		$scope.tempFootprintAlertIcon = true;
 	}	
  	
  	/**
  	 * show device disconnecting alert info
  	 */
	$scope.goToTempDeviceInfo = function(item){
		if($scope.template == 'app/routine/temp/temp-device-info.html'){
			$scope.templateAnimate = '';
			$scope.template = PRODUCT_DETAIL_TEMPLATE;
			$scope.tempFootprintAlertIcon = true;
		}else{
			$scope.templateAnimate = 'temp-slide-animate';
			$scope.template = 'app/routine/temp/temp-device-info.html';
			$scope.tempFootprintAlertIcon = false;
		}
 	}
	
	/**
	 * select a product in list
	 */
	$scope.selectTempProduct = function(index, item){
		$scope.tempActiveSlide = index;
		$scope.templateAnimate = '';
		$scope.tempFootprintAlertIcon = true;
    	$scope.currentTempProduct = item;
		$scope.template = PRODUCT_DETAIL_TEMPLATE;

		if (item.imageSrc){
			 initTemperature();
    	}else{
    		RoutineService.loadItemPictures(item)
			.then(function(result){
				 initTemperature();
			});
    	}   	
    }
   
	/**
	 * takePicture
	 */
	$scope.takePicture = function () {
        var options = {
            quality: 80,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 360,
            targetHeight: 360,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

		var scope = $scope;

        $cordovaCamera.getPicture(options)
        .then(function(imageData) {
	        return RoutineService.saveEvalItemPicture(scope.currentTempProduct, imageData);
        })
		.then(function(result){
			displayProductEvalPicture(scope.currentTempProduct);
		})
		.catch(function(error){
			console.log(error);
		});
    };

   
     //for dialog
	$scope.comments = null;//use for show comment
    $scope.showDialog = function(type){
		$ionicModal.fromTemplateUrl('app/routine/common/'+type+'.html', {
		 	 scope: $scope
		}).then(function(modal) {
			 $scope.modal = modal;
			 if(type == "comment"){
			 	if($scope.currentTempProduct.comments)
			 		$scope.comments = $scope.currentTempProduct.comments;
		 		else
		 			$scope.comments = null;
			 }
			 $scope.modal.show();
		});
    }

	$scope.hideDialog = function() {
//		 $scope.modal.hide();
		 $scope.modal.remove();
	};

	$scope.hideProductSelect = function($event){
	   $scope.productSelectPopover.hide();
	};

	/**
	 * switch between product eval and lib picture
	 */
	$scope.switchPicture = function(){
		var product = $scope.currentTempProduct;

		if (!product.useEvalPicture){
			displayProductEvalPicture(product);
		}else{
			displayProductLibPicture(product);
		}
	};

	/**
	 * display product eval picture
	 *
	 */
	function displayProductEvalPicture(product){
		RoutineService.loadEvalItemPicture(product)
		.then(function(result){
			product.useEvalPicture = true;
			product.imageSrc = product.evalImageSrc;
			$ionicSlideBoxDelegate.update();
		})
		.catch(function(error){
			console.log("eval picture not found for " + product.itemId);
		});
	};

	/**
	 * display product lib picture
	 *
	 */
	function displayProductLibPicture(product){
		product.useEvalPicture = false;
		product.imageSrc = product.libImageSrc;
		$ionicSlideBoxDelegate.update();
	};

	$scope.underConstruction = function(){
		$ionicLoading.show({template:'under construction', noBackdrop: true, duration: 1500});
	};
	
	/**
	 * save routine comments
	 *
	 */
	$scope.saveComments = function(){
		var routineComment  = document.getElementById('routineComment');
		$scope.currentTempProduct.comments = routineComment.value;
		RoutineService.updateTempProductComments($scope.currentTempProduct);
		$scope.hideDialog();
	};
	
	/**
	 * check if current sub view is showing device info, hide it if yes
	 * show temperature manual input dialog
	 */
	$scope.showManualInputDialog = function(){
		if($scope.template == 'app/routine/temp/temp-device-info.html'){
			$scope.templateAnimate = '';
			$scope.template = PRODUCT_DETAIL_TEMPLATE;
			$scope.tempFootprintAlertIcon = true;
		}

		$scope.showTempInput();
	};
	
	/**
	 * show temperature manual input dialog
	 */
	$scope.showTempInput = function() {
	  // init the pop up value
	  if ($scope.currentTempProduct.hasOwnProperty('temperature')){
	  	$scope.manualTemperature.value = parseFloat($scope.currentTempProduct.temperature);
	  }
	  
	  var myPopup = $ionicPopup.prompt({
	    template: '<input type="number" ng-model="manualTemperature.value" autofocus="true">',
	    title: 'Input Temperature',
	    scope: $scope,
	    okText: 'Submit'
	  });
	  
	  myPopup.then(function(res){
	  	if (res === undefined){
	  		$scope.manualTemperature.value = null;
	  	}else{
	      var temperature = $scope.manualTemperature.value;
	      
          if (temperature == null || !isFinite(temperature)) {
			$ionicLoading.show({template:'Please input a number', noBackdrop: true, duration: 1500});
			e.preventDefault();
          } else {
	          $scope.currentTempProduct.temperature = temperature;
	          updateTempValueColor();
	          RoutineService.updateTempProductTemperature($scope.currentTempProduct)
	          .then(function(){
	          	$scope.manualTemperature.value = null;
	          });
  		  }
	    }
	  });
	  
	};
}]);