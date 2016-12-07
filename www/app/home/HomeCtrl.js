angular.module('app.controllers')

.controller('HomeCtrl', ['$rootScope', '$scope','$ionicModal', function ($rootScope, $scope,$ionicModal) {
    
        $scope.$on('$ionicView.enter', function(e, d){        
            $scope.user = {
                userId: $rootScope.restaurant.name
            }   
        });

		$scope.pageData = {
            showLoading: false
        };
         
        
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


     
        $scope.isSelect = false;
        $scope.$on('$ionicView.enter', function(e, d){
            if('forward' == d.direction){
                $scope.isSelect = false;
            }
            emptyLabel();
            initData();
        });
        $scope.getTitleName = function(){
            var title ="";
            if(!$scope.isSelect){
                title = "<i class='icon ion-ios-home cip-title-icon'></i>Home";
            }else{
                title="<i class='icon ion-android-alert cip-title-icon'></i>Alert";
            }
            return title;
        }

        var emptyLabel = function(){
            $scope.cipData = null;
            $scope.oerData = null;
            $scope.pteData = null;
            $scope.overdue = null;
        }

        function initData(){
            $scope.pageData.showLoading = true;
            // $scope.user = SecurityService.getLastUser();
            var result = {"pteData":[{"value":"13003","desc0":"# Average Survey per Restaurant","increase":-1,"isGood":-1},{"value":"18.5","desc0":"Taste of Food Score","increase":-1,"isGood":-1},{"value":"56%","desc0":"Top Box","increase":-1,"isGood":-1}],"cipData":[{"value":"1.3","desc0":"Overall Completion","increase":0,"isGood":0},{"value":"50.7","desc0":"FS Checklist Completion","increase":-1,"isGood":-1},{"value":"57%","desc0":"On Time","increase":-1,"isGood":-1}],"oerData":[{"value":"C","desc0":"Average Grade","increase":0,"isGood":0},{"value":"1.1","desc0":"Average FS Critical","increase":-1,"isGood":1},{"value":"54%","desc0":"Past Due","increase":-1,"isGood":-1}],"overDue":0};
            $scope.oerData = result.oerData;
            $scope.cipData = result.cipData;
            $scope.pteData = result.pteData;
            $scope.overdue = result.overDue ? result.overDue: 0;
            $scope.pageData.showLoading = false;
        };

        $scope.goOverdue = function () {
            return;
        }

        $scope.goHome = function () {
            $scope.isSelect = false;
        }
}])