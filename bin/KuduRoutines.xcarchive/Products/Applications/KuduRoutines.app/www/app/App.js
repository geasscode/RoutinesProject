angular.module('app', ['ionic', 'app.controllers', 'app.services', 'epngProgressChart', 'ngCordova', 'epngUtils', 'epngMockup', 'angularLoad', 'ion-affix', 'ionic-timepicker'])

    .run(['$ionicPlatform', 'StartupService', 'DBMgr', '$state', '$ionicLoading', 'angularLoad', '$rootScope', function ($ionicPlatform, StartupService, DBMgr, $state, $ionicLoading, angularLoad, $rootScope) {
        window.angularLoad = angularLoad;
        $ionicPlatform.ready(function () {

            $ionicLoading.show({template: 'Initializing...'});

            StartupService.startup()
                .then(function (result) {
                    console.log('success')
                    if (result !== false) {
                        // $ionicLoading.hide();
                        DBMgr.getRestConfig().then(function(result){
                            $rootScope.restaurant = {
                                _id: result._id,
                                restId: result.restId,
                                name: result.name
                            }
                            $state.go('app.home');
                            $ionicLoading.hide();
                        }).catch(function(err){
                            $state.go('setup');
                            $ionicLoading.hide();
                        })
                    }
                })
                .catch(function (error) {
                    // TODO: show error message here
                    // $ionicLoading.hide();
                    console.log('error');
                    $state.go('setup');
                });

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
                // StatusBar.styleLightContent();
            }
        });
    }])

    .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$compileProvider',function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {
        // Hide the text of nav-back-button for all screens
        $ionicConfigProvider.backButton.previousTitleText(false).text('Back').icon('ion-ios-arrow-back');
        // set image src
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|blob):/);

        $stateProvider
            // Login Page
            .state('login', {
                url: '/login',
                templateUrl: 'app/login/login.html',
                controller: 'LoginCtrl'
            })

            // Side Menu and Content
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "app/menu.html",
                controller: 'AppCtrl'
            })

            .state('config', {
                url: '/config',
                templateUrl: "app/config/config.html",
                controller: 'ConfigCtrl'
            })

            .state('setup', {
                url: '/setup',
                templateUrl: "app/setup/setup.html",
                controller: 'SetupCtrl'
            })

            //-------------------------------------- Routine --------------------------------------
            .state('app.home', {
                url: "/home",
                views: {
                    // Routine Home
                    'menuContent': {
                        templateUrl: "app/home/home.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.routine-home', {
                url: "/routine-home",
                views: {
                    // Routine Home
                    'menuContent': {
                        templateUrl: "app/routine/routine-home.html",
                        controller: 'RoutineHomeCtrl'
                    }
                }
            })

            // Take Temperature main UI
            .state('app.temp-main', {
                url: "/temp-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/temp/temp-main.html",
                        controller: 'TempMainCtrl'
                    }
                }
            })

            // Beef Cookouts main UI
            .state('app.bcTemp-main', {
                url: "/bcTemp-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/bcTemp/bcTemp-main.html",
                        controller: 'BcTempMainCtrl'
                    }
                }
            })

            // Cookouts main UI
            .state('app.cwTemp-main', {
                url: "/cwTemp-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/cwTemp/cwTemp-main.html",
                        controller: 'CwTempMainCtrl'
                    }
                }
            })

            // Food Safety main UI
            .state('app.fs-main', {
                url: "/fs-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/fs/fs-main.html",
                        controller: 'FsMainCtrl'
                    }
                }
            })

            // Travel Path main UI
            .state('app.tp-main', {
                url: "/tp-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/tp/tp-main.html",
                        controller: 'TpMainCtrl'
                    }
                }
            })

            // Travel Path FOH main UI
            .state('app.foh-main', {
                url: "/foh-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/foh/foh-main.html",
                        controller: 'FohMainCtrl'
                    }
                }
            })

            // Travel Path BOH main UI
            .state('app.boh-main', {
                url: "/boh-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/boh/boh-main.html",
                        controller: 'BohMainCtrl'
                    }
                }
            })

            // TDaily Cleaning Task main UI
            .state('app.dc-main', {
                url: "/dc-main",
                views: {
                    'menuContent': {
                        templateUrl: "app/routine/dc/dc-main.html",
                        controller: 'DcMainCtrl'
                    }
                }
            })

            //--------------------------------------  Health Department Home Page -----------------------
            .state('app.hd-home', {
                url: "/hd-home",
                views: {
                    'menuContent': {
                        templateUrl: "app/hd/hd-home.html",
                        controller: 'HDHomeCtrl'
                    }
                }
            })
            .state('app.hd-info', {
                url: "/hd-info",
                views: {
                    'menuContent': {
                        templateUrl: "app/hd/hd-info.html",
                        controller: 'HDHomeCtrl'
                    }
                }
            })

            // Violation List of Health Departement
            .state('app.hd-violations', {
                url: "/hd-violations",
                views: {
                    'menuContent': {
                        templateUrl: "app/hd/hd-violation-list.html",
                        controller: 'HDViolationsCtrl'
                    }
                }
            })

            // Violation status
            // .state('app.hd-violation-status', {
            //     url: "/hd-violation-status/:violationID",
            //     views: {
            //         'menuContent': {
            //             templateUrl: "app/hd/hd-violation-status.html",
            //             controller:'HDViolationsStatusCtrl'
            //         }
            //     }
            // })

            //-------------------------------------------- Reports ---------------------------------------
            .state('app.reports', {
                url: "/reports",
                views: {
                    'menuContent': {
                        templateUrl: "app/reports/rpt-home.html",
                        controller: 'RptCtrl'
                    }
                }
            })

            .state('app.reports-template', {
                url: "/reports-template",
                views: {
                    'menuContent': {
                        templateUrl: "app/reports/rpt-user-reports.html",
                        controller: 'RptCtrl'
                    }
                }
            })

            // reports auditor pdf
            .state('app.reports-auditor-pdf', {
                url: "/reports-auditor-pdf",
                views: {
                    'menuContent': {
                        templateUrl: "app/reports/rpt-auditor-pdf.html",
                        controller: 'RptAuditorPDFCtrl'
                    }
                }
            })

            //-------------------------------------- Settings -----------------------------------
            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: "app/settings/settings.html",
                        controller: 'SettingCtrl'
                    }
                }
            })

            .state('app.settings-change-restaurant', {
                url: "/settings/change-restaurant",
                views: {
                    'menuContent': {
                        templateUrl: "app/settings/changeRestaurant.html",
                        controller: 'SettingCtrl'
                    }
                }
            }); 

        // if none of the above states are matched, use this as the fallback
        // $urlRouterProvider.otherwise('/login');
        // 
    }]);
