
angular.module('app.controllers')
.controller('SettingCtrl', ['$scope', '$rootScope', '$state', '$ionicPopup', 'RoutineService' ,'SettingService', '$ionicModal', '$ionicLoading', 'BackendService', 'IdUtils', function($scope, $rootScope, $state, $ionicPopup, RoutineService ,SettingService, $ionicModal, $ionicLoading, BackendService, IdUtils) {
	
    var pointer = 0;
    $scope.versionNumber = "";
    $scope.btnDisabled = true;
    localDB = DBMgr.getDB();
    $scope.restaurantLists = [];
    $scope.hasMoreData = true;      

	var loadRestaurantList = function(){
        $scope.hasMoreData = true;      
        $ionicLoading.show({template: 'Loading Restaurants...'});        
        BackendService.getRestaurantList().then(function(data){
            $scope.restaurantLists = data;
            $ionicLoading.hide();
            //TODO: add get variables to http URL
            console.log($scope.restaurantLists);
        }).catch(function(err){
            $ionicLoading.hide();
            $scope.showAlert();
            $scope.hasMoreData = true;      
        });
    }

    var getMoreRestaurants = function(pointer){
        BackendService.getMoreRestaurants(pointer).then(function(data){
            $scope.restaurantLists = $scope.restaurantLists.concat(data);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            console.log(data);
        }).catch(function(err){
            $scope.hasMoreData = false;
        })
    } 

	$scope.resetData = function(){
		RoutineService.resetCurrentRoutine()
			.then(function(result){
				if(result.success){
					$ionicLoading.show({template:'Reset data success ', noBackdrop: true, duration: 1500});
				}else{
					$ionicLoading.show({template:'Reset data faild', noBackdrop: true, duration: 1500});
				}	
			})
	}

	$scope.changeRestaurant = function(){
		$state.go('app.settings-change-restaurant');
	}

    $scope.$on('$ionicView.enter', function(e, d){
        // $scope.appVersion = StartupService.getAppVersion();
    
          var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
            if ( app ) {
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                cordova.getAppVersion.getVersionNumber().then(function (version) {
                    $scope.versionNumber = "V." + version;
                    $ionicLoading.hide();
                });
            }
    });

	$scope.chooseRestaurant = function(id,restaurant){
		console.log('restaurant:' + id + ',' + restaurant);
        $scope.btnDisabled = false;

        console.log($rootScope);

        if($rootScope.restaurant._id){
        	$rootScope.restaurant = {
        		_id: $rootScope.restaurant._id,
        		restId: id,
        		name: restaurant
        	}
        }else{
	        $rootScope.restaurant = {
		        _id: IdUtils.getId("RS_"),
		        restId: id,
		        name: restaurant
		    };
        }

        $scope.modal.hide();
	}

    $scope.showRestoSetup = function(){
        $ionicModal.fromTemplateUrl('app/setup/setup-resto.html', {
                scope: $scope,
                controller: 'SetupCtrl'
           }).then(function (modal) {
               $scope.modal = modal;
               loadRestaurantList();
               modal.show();
            });
        };

    $scope.hideRestoSetup = function(){
        $scope.modal.hide();
    };

    $scope.saveRestaurant = function(doc){
        localDB.get(doc._id)
        .then(function(result){
            //get doc rev
            doc._rev = result._rev;
            $rootScope.restaurant = {
            	restId: doc.restId,
            	name: doc.name,
            	_id: doc._id
            }
            //save to local db
            return localDB.put(doc);
        })
        .catch(function(error){
            return localDB.put(doc);
        });
        $state.go('app.home');
    }

    $scope.refreshList = function(){
        $scope.restaurantLists = [];        
        loadRestaurantList();
    }

    $scope.loadMore = function(){
        console.log(pointer);
        console.log($scope.hasMoreData);
        if(pointer <= 291){
            getMoreRestaurants(pointer);
            pointer = pointer + 16;
        }else{

            $scope.hasMoreData = false;
        }
    }

    $scope.showAlert = function(){
        var alertPopup = $ionicPopup.alert({
            title: 'Restaurant List',
            template: 'Loading failed. Please check your connection.'
        })

        alertPopup.then(function(){
            console.log(res);
        })
    }
}]);