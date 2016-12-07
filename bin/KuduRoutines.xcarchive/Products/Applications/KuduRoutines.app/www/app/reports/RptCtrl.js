/**
 * Created by Jim on 4/10/15.
 */

angular.module('app.controllers')

.controller('RptCtrl', ['$scope', '$rootScope', '$state', '$ionicModal', '$ionicLoading', 'RoutineService', 'ReportsService', 
function($scope, $rootScope, $state, $ionicModal, $ionicLoading, RoutineService, ReportsService) {

	$scope.currentRoutine = RoutineService.getCurrentRoutine();
	console.log($scope.currentRoutine);

	$scope.configCircularParam = 
		{
			circularNum: 0,					//圆圈进度条占用百分比, 
			circularNumFontSize: '3rem',		//圆圈显示Label的字体大小
			dotSize: '3em',						//白点的大小
			circularWidth: '10rem',				//圆圈的宽度
			circularHeight: '10rem',			//圆圈的高度
			circularFrontColor: '#3598DB'		//前圆圈的颜色
		};

	//CircularParam Value
	$scope.configCircularParam.circularNum = RoutineService.getRoutineProgress();
	
		
	//show or hide Circular Chart
	$scope.showChart = !angular.isUndefined($scope.configCircularParam.circularNum);

	//Overall Rect Progress
	$scope.configOverallRectProgressParams = 
		[{
			progressHeight: '40px', 	//进度条高度, 只能设置有效数字, 不能用百分比.
			frontColor: '#AAD0F0',		//进度条颜色, 可以输入red, #FF0000, rgba(255, 0, 0, 0.7)  
			percentNum: 60, 			//进度条百分比, 比如输入25, 就显示为进度条宽度的25%
			label: 'Temperatures', 		//进度条上显示文本
			labelFontSize: '16px', 		//文本字体大小
			labelPosition: 'center'	//文本显示位置,横型进度条时, left, center, right; 竖型进度条时, top, middle, bottom;
		},
		{
			progressHeight: '40px', 
			frontColor: '#3498DB', 
			percentNum: 70, 
			label: 'Food Safety', 
			labelFontSize: '16px', 
			labelPosition: 'center'
		}];

	//Trend Rect Progress
	$scope.configTrendRectProgressParams = 
		[{
			frontColor: '#E09797',		//进度条颜色, 可以输入red, #FF0000, rgba(255, 0, 0, 0.7)  
			bgColor: 'transparent',		//进度条底色, 可以输入red, #FF0000, rgba(255, 0, 0, 0.7)  
			percentNum: 70, 			//进度条百分比, 比如输入25, 就显示为进度条宽度的25%
			label: '3/3', 				//进度条上显示文本
			labelRotate: 90,			//为0时, 显示为横进度条; 为90时, 显示为竖型进度条;
			border: '0'	//边框
		},
		{
			frontColor: '#99E394', 
			bgColor: 'transparent',  
			percentNum: 75, 
			label: '3/4', 
			labelRotate: 90,
			border: '0'				
		},
		{
			frontColor: '#99E394', 
			bgColor: 'transparent',  
			percentNum: 90, 
			label: '3/5', 
			labelRotate: 90,
			border: '0'				
		},
		{
			frontColor: '#99E394', 
			bgColor: 'transparent',  
			percentNum: 90, 
			label: '3/6', 
			labelRotate: 90,
			border: '0'				
		},
		{
			frontColor: '#99E394', 
			bgColor: 'transparent',  
			percentNum: 90, 
			label: '3/7', 
			labelRotate: 90,
			border: '0'				
		},
		{
			frontColor: '#E09797', 
			bgColor: 'transparent',  
			percentNum: 60, 
			label: '3/8', 
			labelRotate: 90,
			border: '0'				
		},
		{
			frontColor: '#8C8C8C', 
			bgColor: 'transparent',  
			percentNum:50, 
			label: 'Today', 
			labelRotate: 90,
			border: '0'			
		}
		];

	//	templates for reports view
	$scope.templates = [
		{
			index: 0,
			templateUrl: 'app/reports/rpt-overall.html',
			description: "Today's Progress (1/4)"
		}, {
			index: 1,
			templateUrl: 'app/reports/rpt-trend.html',
			description: "Today's Progress (2/4)"
		}, {
			index: 2,
			templateUrl: 'app/reports/rpt-opps-detail.html',
			description: "Today's Progress (3/4)"
		}, {
			index: 3,
			templateUrl: 'app/reports/rpt-badges.html',
			description: "Today's Progress (4/4)"
		}, /*{
			index: 4,
			templateUrl: 'app/reports/rpt-opps-detail.html',
			description: 'Detail (5/6)'
		}, {
			index: 5,
			templateUrl: 'app/reports/rpt-competitive.html',
			description: 'Competitive (6/6)'
		}*/
	];

	$scope.changeUserReportsTempalte = function(index) {
		if(!index) {
			index = 0;
			$state.go('app.reports-template');
		} else if (index >= $scope.templates.length
			|| index < 0) {
			return ;
		}
		$rootScope.reportTemplate = $scope.templates[index];
		// $scope.reportTemplate = $scope.templates[index];
		console.log($rootScope.reportTemplate);
		return ;
	};

	$scope.productSlideChanged = function(index) {
		$rootScope.reportTemplate = $scope.templates[index];
		// $scope.reportTemplate = $scope.templates[index];
		if(index == 0) {

		} else if(index == 1) {

		} else if(index == 2) {
			if(!$scope.rptOppsDates) {
				$scope.showReportsDetailView();
			}
		} else if(index == 3) {
			if(!$scope.rptOpportunities) {
				$scope.showReportsBadgesView();
			}
		} /*else if(index == 4) {
			if(!$scope.rptOppsDetails) {
				$scope.showReportsDetailView();
			}
		} else if(index == 5) {
			if(!$scope.competitiveList) {
				$scope.showReportsCompetitiveView();
			}
		}*/
	};

	$scope.doRefreshTemplateData = function(index) {
		if(index == 0) {
			//	
			$scope.$broadcast('scroll.refreshComplete');
		} else if(index == 1) {
			//	
			$scope.$broadcast('scroll.refreshComplete');
		} else if(index == 2) {
			//	
			$scope.$broadcast('scroll.refreshComplete');
		} else if(index == 3) {
			$scope.doRefreshOpps();
		} else if(index == 4) {
			$scope.doRefreshDetail();
		} else if(index == 5) {
			$scope.doRefreshComp();
		}
	};

	//	reports overall view
	$scope.showReportsOverallView = function() {
	
	};

	//	reports trend view
	$scope.showReportsTrendView = function() {

	};

	//	reports badges view
	$scope.showReportsBadgesView = function() {
		$scope.rptOppsDates = ReportsService.getBadges();
		// $state.go('app.reports-badges');
	};

	//	reports opportunities view
	$scope.showReportsOpportunitiesView = function() {
		// $state.go('app.reports-opps');
        $ionicLoading.show({template: 'loading...'});
		ReportsService.initOpportunities()
		.then(function(result) {
			$scope.rptOpportunities = result;
			// $rootScope.rptOpportunities = result;
			$ionicLoading.hide();
			console.log($scope.rptOpportunities);
		});
	};

	//	pull to refresh opportunities data
	$scope.doRefreshOpps = function() {
		ReportsService.initOpportunities()
		.then(function(result) {
			$scope.rptOpportunities = result;
			// $rootScope.rptOpportunities = result;
            $scope.$broadcast('scroll.refreshComplete');
		});
	};

	//	reports detail view
	$scope.showReportsDetailView = function() {
		// $state.go('app.reports-details');
        $ionicLoading.show({template: 'loading...'});
		ReportsService.initOppsDates()
		.then(function(result) {
			$scope.rptOppsDetailsDates = result[0].details;
			console.log($scope.rptOppsDetailsDates);
			$scope.rptOppsDetails = result;
			// $rootScope.rptOppsDetails = result;
			$ionicLoading.hide();
		});
	};

	//	pull to refresh report detail data
	$scope.doRefreshDetail = function() {
		ReportsService.initOppsDates()
		.then(function(result) {
			$scope.rptOppsDetails = result;
			// $rootScope.rptOppsDetails = result;
            $scope.$broadcast('scroll.refreshComplete');
		});
	};

	//	reports competitive view
	$scope.showReportsCompetitiveView = function() {
		// $state.go('app.reports-competitive');
        $ionicLoading.show({template: 'loading...'});
        ReportsService.getCompetitiveList()
		.then(function(result) {
			$scope.competitiveList = result;
			// $rootScope.competitiveList = result;
			console.log(result[0]);
			$scope.selectCompetitive = result[0];
			// $rootScope.selectCompetitive = result[0];
			$ionicLoading.hide();
		});
	};

	$scope.getSelectCompItem = function(competitive) {
		$scope.selectCompetitive = competitive;
		// $rootScope.selectCompetitive = competitive;
	};

	//	pull to refresh reports competitive data
	$scope.doRefreshComp = function() {
		ReportsService.getCompetitiveList()
		.then(function(result) {
			$scope.competitiveList = result;
			// $rootScope.competitiveList = result;
			$scope.selectCompetitive = result[0];
			// $rootScope.selectCompetitive = result[0];
            $scope.$broadcast('scroll.refreshComplete');
		});


	};

	


}])

.controller('RptAuditorPDFCtrl', ['$scope', '$ionicModal', '$ionicPopup', '$ionicLoading',
function($scope, $ionicModal, $ionicPopup, $ionicLoading) {

	$scope.AuditorPdfView = function(){
        $ionicModal.fromTemplateUrl('app/reports/rpt-auditor-pdf-view.html', {
        	scope: $scope
        }).then(function(modal) {
        	$scope.auditorPdfViewModel = modal;
            $scope.auditorPdfViewModel.show();
        });
    }

	$scope.AuditorPdfEmail = function(){
        $ionicModal.fromTemplateUrl('app/reports/rpt-auditor-pdf-email.html', {
        	scope: $scope
        }).then(function(modal) {
        	$scope.auditorPdfEmailModel = modal;
            $scope.auditorPdfEmailModel.show();
        });
    }

    $scope.hideAuditorPdfView = function() {
        $scope.auditorPdfViewModel.hide();
    }

    $scope.hideAuditorPdfEmail = function() {
        $scope.auditorPdfEmailModel.hide();
    }

    $scope.sendEmail = function() {
      $ionicLoading.show({template:'Send email successfully!', noBackdrop: true, duration: 1500});
			$scope.hideAuditorPdfEmail();
    }
}])

;