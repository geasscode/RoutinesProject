angular.module('app.services')

	.service('BackendService', ['$http', function ($http) {
		
		// var url = "/routines"; // for browser testing
		var url = "http://kuduroutines.nextxnow.com"; // for live testing
		var restaurantLists = [];

        //get restaurant lists
		function getRestaurantList(){
			return $http.get(url + "/getRestaurantList.php").then(function(result){
				return result.data;
			});
		}
                
        //upload activity items
        function postActivityItems(data) {
        	return $http.post(url + "/uploadActivityItems.php", data).then(function(result){
        		return result;
        	});
        }
        
        //save current routine
        function postCurrentRoutine(data) {
        	return $http.post(url + "/saveCurrentRoutineData.php", data).then(function(result){
        		return result;
        	});
        }

        //load more restaurants 
        function getMoreRestaurants(pointer){
            return $http.get(url + "/getMoreRestaurants.php?data=" + pointer).then(function(result){
                return result.data;
            });
        }
        
        // PUBLIC FUNCTION
		this.getRestaurantList = function(){
			return getRestaurantList();
		}

        this.getMoreRestaurants = function(pointer){
            return getMoreRestaurants(pointer);
        }

                
        this.postActivityItems = function(data) {
            return postActivityItems(data);
        }
        
        this.postCurrentRoutine = function(data) {
            return postCurrentRoutine(data);
        }

	}])
