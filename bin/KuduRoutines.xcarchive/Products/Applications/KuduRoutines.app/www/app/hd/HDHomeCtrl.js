/**
 * Created by desmond on 4/28/15.
 */
angular.module('app.controllers')


    .controller('HDHomeCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$ionicModal', '$ionicLoading',
        '$ionicNavBarDelegate', 'IdUtils', 'HDService', '$cordovaCamera',
        '$cordovaDialogs', '$ionicPopup',
        function ($scope, $state, $stateParams, $timeout, $ionicModal, $ionicLoading,
                  $ionicNavBarDelegate, IdUtils, HDService, $cordovaCamera,
                  $cordovaDialogs, $ionicPopup) {


            $scope.hdDateList = null;
            $ionicLoading.show({template: 'loading...'});

            HDService.getHDList()
                .then(function (result) {
                    $scope.hdDateList = result;
                    $ionicLoading.hide();
                });
            $scope.searchHD = HDService.searchHD();
            $scope.hdList = {};
            $scope.showImage = false;

            $scope.hdData = {
                showDelete: false
            };

            $scope.newHD = {
                _id: "",
                picture: "",
                visitDate: null,
                managerOnDuty: "",
                grade: "",
                nextVisitDate: null,
                createDate: null,
                createdBy: ""
            };
            $scope.currentHD = HDService.getCurrentHD();

            $scope.deleteHDConfirm = function (item) {

                $cordovaDialogs.confirm('Are you sure to delete this HD?',
                    'Delete HD', ['YES', 'NO'])
                    .then(function (buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        if (buttonIndex == 1) {
                            $scope.hdDateList.splice($scope.hdDateList.indexOf(item), 1);
                            HDService.removeHD(item)
                                .then(function (result) {
                                    $ionicLoading.show({
                                        template: 'Delete HD successfully!',
                                        noBackdrop: true,
                                        duration: 1500
                                    });
                                })

                                .catch(function (err) {
                                    $ionicLoading.show({
                                        template: 'Delete HD Failed!',
                                        noBackdrop: true,
                                        duration: 1500
                                    });
                                    console.log(err);
                                });
                        }
                    });
            }

            $scope.onItemDelete = function (item) {

                $scope.deleteHDConfirm(item);
            };

            $scope.doRefresh = function () {
                console.log('Refreshing!');
                $timeout(function () {
                    //Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');

                }, 1000);
            };

            $scope.deleteHD = function (item) {
                $scope.deleteHDConfirm(item);
            };

            $scope.takePhoto = function () {

                var options = {
                    quality: 80,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 480,
                    targetHeight: 270,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false
                };

                $cordovaCamera.getPicture(options)
                    .then(function (imageData) {

                        $scope.cameraImage = "data:image/jpeg;base64," + imageData;
                        $scope.hdImageData = imageData;
                        $scope.$eval(function () {
                            $scope.showImage = true;
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            };

            $scope.gotoHDInfoPage = function (hd) {
                console.log(hd);
                HDService.loadHD(hd)
                    .then(function (result) {
                        console.log('will be go to hd-info page');
                        $state.go('app.hd-info');
                    });
            };

            $scope.gotoViolations = function () {
                console.log('will be go to violations page.');
                $state.go('app.hd-violations');
            }

            $scope.showHDModal = function () {

                $ionicModal.fromTemplateUrl('app/hd/hd-add.html', {

                    //animation: 'slide-in-right',
                    scope: $scope
                }).then(function (modal) {
                    $scope.modal = modal;
                    //$scope.hd = {hdDate: null};
                    modal.show();
                });
            };

            $scope.closeHDModal = function () {

                $scope.showImage = false;
                $scope.hdImageData = null;
                //$scope.modal.hide();
                $scope.modal.remove();

                $scope.newHD = {
                    _id: "",
                    picture: "",
                    visitDate: null,
                    managerOnDuty: "",
                    grade: "",
                    nextVisitDate: null,
                    createDate: null,
                    createdBy: ""
                };
            };

            $scope.finishAddHDInfo = function () {
                var HDParams = $scope.newHD;

                HDParams.imageData = $scope.hdImageData;

                //if (!HDParams.imageData) {
                //    $cordovaDialogs.alert('', 'Please take a picture', 'OK');
                //    return;
                //}

                if (!HDParams || !HDParams.managerOnDuty || !HDParams.grade || !HDParams.visitDate || !HDParams.nextVisitDate) {
                    //var alertPopup = $ionicPopup.alert({
                    //    title: 'Please finish all the fields.'
                    //});

                    $cordovaDialogs.alert('', 'Please complete all the fields.', 'OK');
                    return;
                }

                HDService.createHD(HDParams)
                    .then(function (result) {

                        $ionicLoading.show({
                            template: 'Save Health Department successfully!',
                            noBackdrop: true,
                            duration: 1500
                        });
                        //}
                        //$scope.newHD = null;

                        $scope.newHD = {
                            _id: "",
                            picture: "",
                            visitDate: null,
                            managerOnDuty: "",
                            grade: "",
                            nextVisitDate: null,
                            createDate: null,
                            createdBy: ""
                        };
                        $scope.showImage = false;
                        //$scope.modal.hide();
                        $scope.modal.remove();
                        return HDService.getHDList();
                    })
                    .then(function (result) {
                        $scope.hdDateList = result;
                    });

            };

        }]);
