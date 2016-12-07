angular.module('app.controllers')
.controller('SetupCtrl', ['$rootScope', '$scope','$ionicPopup', '$ionicLoading', '$state', 'BackendService', 'StartupService', '$ionicModal', '$cordovaNetwork', 'DBMgr', 'IdUtils', function($rootScope, $scope, $ionicPopup, $ionicLoading, $state, BackendService, StartupService, $ionicModal, $cordovaNetwork, DBMgr, IdUtils) {

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
            $scope.restaurantLists = (data);
            $ionicLoading.hide();
            //TODO: add get variables to http URL
            console.log($scope.restaurantLists);
            pointer = 51;
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

    $scope.$on('$ionicView.enter', function(e, d){
        loadRestaurantList();
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
        $rootScope.restaurant = {
            _id: IdUtils.getId("RS_"),
            restId: id,
            name: restaurant
        };
        AppModel.userId = $rootScope.restaurant.name;
        $scope.modal.hide();
		//TODO: save to local db
		// $state.go('app.home');
	}

    $scope.showRestoSetup = function(){
        $ionicModal.fromTemplateUrl('app/setup/setup-resto.html', {
                scope: $scope,
                controller: 'SetupCtrl'
           }).then(function (modal) {
               $scope.modal = modal;
               modal.show();
            });
        };

    $scope.hideRestoSetup = function(){
        $scope.modal.hide();
    };

    $scope.saveRestaurant = function(doc){
        console.log($rootScope.restaurant.restId);
        localDB.get(doc._id)
        .then(function(result){
            //get doc rev
            doc._rev = result._rev;
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
        $scope.moredata=true;
    }

    $scope.loadMore = function(){
        console.log(pointer);
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

