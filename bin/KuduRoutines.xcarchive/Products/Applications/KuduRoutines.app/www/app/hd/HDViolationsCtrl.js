/**
 * Created by desmond on 4/28/15.
 */

angular.module('app.controllers')

    .controller('HDViolationsCtrl', ['$scope', '$ionicModal', '$stateParams', '$ionicLoading',
        '$ionicPopup', '$cordovaDialogs', '$timeout', 'HDService', 'IdUtils',
        function ($scope, $ionicModal, $stateParams, $ionicLoading,
                  $ionicPopup, $cordovaDialogs, $timeout, HDService, IdUtils) {

            HDService.getViolationList()
                .then(function (result) {
                    $scope.violations = result;
                    console.log($scope.violations);
                });

            //$scope.violationOptions = HDService.getViolationOptions();

            $scope.violationData = {
                showDelete: false
            };

            $scope.newViolation = {
                violation: "",
                owner: "",
                dueDate: null,
                actions: ""
            };

            /*
             *   popup dialog make sure to delete violation
             *
             */
            $scope.onItemDelete = function (violation) {
                /* var confirmPopup = $ionicPopup.confirm({
                 title: 'Delete Violation( ' + violation.violation + ' )',
                 template: 'Are you sure to delete this violation?'
                 });
                 confirmPopup.then(function (res) {
                 if (res) {
                 var removeResult = HDService.removeViolation(violation._id, violation._rev);
                 console.log(removeResult);
                 if (removeResult) {
                 $scope.violations.splice($scope.violations.indexOf(violation), 1);
                 $ionicLoading.show({
                 template: 'Delete violation successfully!',
                 noBackdrop: true,
                 duration: 1500
                 });
                 }
                 } else {
                 return;
                 }
                 });*/

                $cordovaDialogs.confirm('Are you sure to delete this violation?',
                    'Delete Violation', ['Yes', 'No'])
                    .then(function (buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        if (buttonIndex == 1) {
                            var removeResult = HDService.removeViolation(violation._id, violation._rev);
                            if (removeResult) {
                                $scope.violations.splice($scope.violations.indexOf(violation), 1);

                            }
                        }

                    });
            };

            /*
             *   showViolationModal
             *
             */
            $scope.showViolationModal = function () {
                $scope.newViolation = {
                    violation: "",
                    owner: "",
                    dueDate: null,
                    actions: ""
                };

                $ionicModal.fromTemplateUrl('app/hd/hd-violation-edit.html', {

                    //animation: 'slide-in-right',
                    scope: $scope
                }).then(function (modal) {
                    $scope.violationModal = modal;
                    // $scope.violation = HDService.prepareNewViolation();
                    $scope.violationModal.show();
                });
            };

            $scope.closeViolationModal = function () {
                //$scope.violationModal.hide();
                $scope.violationModal.remove();
            };

            $scope.saveViolation = function () {

                var newViolation = $scope.newViolation;
                console.log(newViolation);

                if (!newViolation || !newViolation.violation
                    || !newViolation.owner || !newViolation.dueDate
                    || !newViolation.actions) {
                    //var alertPopup = $ionicPopup.alert({
                    //    title: 'Please finish all the fields.'
                    //});

                    $ionicLoading.show({template: 'Please complete all the fields.', noBackdrop: true, duration: 1500});

                    return;
                }

                HDService.addViolation(newViolation)
                    .then(function () {
                        $scope.newViolation = {
                            violation: "",
                            owner: "",
                            dueDate: null,
                            actions: ""
                        };
                        $ionicLoading.show({
                            template: 'Save violation successfully!',
                            noBackdrop: true,
                            duration: 1500
                        });
                        $scope.closeViolationModal();

                        return HDService.getViolationList();

                    })
                    .then(function (result) {
                        $scope.violations = result;
                    });

            };

            $scope.refreshViolationList = function () {

                console.log('Refreshing!');
                $timeout(function () {
                    //Stop the ion-refresher from spinning
                    HDService.getViolationList()
                        .then(function (result) {
                            $scope.violations = result;
                        });
                    $scope.$broadcast('scroll.refreshComplete');

                }, 1000);
            };

            //  from HDViolationsStatusCtrl.js
            $scope.getViolationById = function (violationID) {
                console.log(violationID);

                $scope.noStart = false;
                $scope.inProgress = false;
                $scope.completed = false;

                HDService.getViolation(violationID)
                    .then(function (result) {
                        $scope.currentViolation = result;
                        if ($scope.currentViolation.status == 'N') {
                            $scope.noStart = true;
                        } else if ($scope.currentViolation.status == 'P') {
                            $scope.inProgress = true;
                        } else {
                            $scope.completed = true;
                        }
                        $ionicModal.fromTemplateUrl('app/hd/hd-violation-status.html', {

                            scope: $scope
                        }).then(function (modal) {
                            $scope.modal = modal;
                            modal.show();
                        });
                    });
            };

            $scope.showCurrentStatus = function (violationId, status) {

                //$scope.color = $scope.violation.color;
                if (status == 'NotStart') {
                    $scope.currentViolation.status = 'N';
                    $scope.noStart = true;
                    $scope.inProgress = false;
                    $scope.completed = false;
                }
                else if (status == 'InProgress') {
                    $scope.currentViolation.status = 'P';
                    $scope.noStart = false;
                    $scope.inProgress = true;
                    $scope.completed = false;
                }
                else {
                    $scope.currentViolation.status = 'C';
                    $scope.noStart = false;
                    $scope.inProgress = false;
                    $scope.completed = true;
                }

                HDService.updateViolationStatus(violationId, $scope.currentViolation.status);
            };

            $scope.closeViolationStatusModal = function () {
                HDService.getViolationList()
                    .then(function (result) {
                        $scope.violations = result;
                    });
                $scope.modal.remove();
            };

            /*      $scope.showPic = function()
             {
             HDService.getHDPicture();
             };
             */
        }]);

