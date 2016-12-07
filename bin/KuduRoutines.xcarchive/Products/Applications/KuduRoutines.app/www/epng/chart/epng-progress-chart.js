/**
 * @author 	ArmyQin
 * @date	2015-04-24
 * 
 * 1. Rectangle Progress Chart
 * 2. Circular Progress Chart
 */

(function () {
	angular.module('epngProgressChart', [])
	
    .service('directiveIdUtils', function(){
    	var seed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    	
    	this.getId = function(prefix) {
    		var t = new Date().getTime(),
    			i;
    		
    		for(i = 0; i < 4; i++) {
    			t += seed.charAt(Math.floor(Math.random() * 26));
    		}
    		
    		return prefix + t;
    	};
    })
	
    /**
	 * @name epngProgress
	 * @description
	 * 自定义进度条大小, 颜色, 字体, 使用请看例子.
	 * 
	 * @example
	 * View:
	 * 		<epng-rectangle-progress></epng-rectangle-progress>
	 * Controller:
	 * 		$scope.configRectangleParam = 
			{
				id: 1,						//进度条的唯一性， 比如生成的CSS
				progressWidth: '300px', 	//进度条宽度, 可以设置为百分比.
				progressHeight: '50px',		//进度条高度, 只能设置有效数字, 不能用百分比. 
				frontColor: 'red',			//进度条颜色, 可以输入red, #FF0000, rgba(255, 0, 0, 0.7) 
				bgColor: 'green',  			//进度条底色, 可以输入red, #FF0000, rgba(255, 0, 0, 0.7)
				percentNum: 25, 			//进度条百分比, 比如输入25, 就显示为进度条宽度的25%
				label: 'Progress', 			//进度条上显示文本
				labelFontSize: '14px', 		//文本字体大小
				labelColor: '#FFFFFF',		//文本颜色
				animationDuration: 3,		//动画的持续时间, 单位为秒
				labelPosition: 'center',	//文本显示位置,横型进度条时, left, center, right; 竖型进度条时, top, middle, bottom;
				labelRotate: 0,				//为0时, 显示为水平文本; 为90时, 显示为垂直文本;
				progressRotate: 0, 			//为0时, 显示为水平进度条; 为90时, 显示为垂直进度条;
				border: '1px solid #ccc'	//边框
			};
	 */
    .directive("epngRectangleProgress", ['directiveIdUtils', function (directiveIdUtils) {
    	return {
            restrict: 'E', //E = element, A = attribute, C = class, M = comment  
            scope: {
            	configRectangleParam: '=epngModel'
            },
            templateUrl: 'epng/chart/epng-rectangle-progress.html',
            controller: function($scope) {
            	$scope.configRectangleParam ={
	        			id: directiveIdUtils.getId('Rec'),
	        			progressWidth: '100%', 		//进度条宽度, 可以设置为百分比.
	        			progressHeight: '20px', 	//进度条高度, 只能设置有效数字, 不能用百分比.
	        			frontColor: '#6de67b',		//进度条颜色, 可以输入red, #FF0000, rgba(255, 0, 0, 0.7)  
	        			bgColor: '#DCE0E3',			//进度条底色, 可以输入red, #FF0000, rgba(255, 0, 0, 0.7)  
	        			percentNum: 100, 			//进度条百分比, 比如输入25, 就显示为进度条宽度的25%
	        			label: 'Core', 				//进度条上显示文本
	        			labelFontSize: '12px', 		//文本字体大小
	        			labelColor: 'black',		//文本颜色
	        			animationDuration: 2,		//动画的持续时间, 单位为秒
	        			labelPosition: 'left',	//文本显示位置,横型进度条时, left, center, right; 竖型进度条时, top, middle, bottom;
	        			labelRotate: 0,				//为0时, 显示为横进度条; 为90时, 显示为竖型进度条;
	        			progressRotate: 0, 			//为0时, 显示为水平进度条; 为90时, 显示为垂直进度条;
	        			border: '1px solid #ccc'
	        		}
            	
            	angular.extend($scope.configRectangleParam, $scope.$parent.configRectangleParam);
            	
            	$scope.$on('updateRectangleProgress', function(events, parentScope, configRectangleParam){
//            		$scope.$eval(function(){
            			angular.extend($scope.configRectangleParam, configRectangleParam);
//            		});
            	});
            },
            link: function(scope, el){
            	if (angular.isUndefined(scope.configRectangleParam.percentNum)) {
            		el.remove();
            	}
            }
        }
    }])

    /**
	 * @name epngProgress
	 * @description
	 * 自定义进度条大小, 颜色, 字体, 使用请看例子.
	 * 
	 * @example
	 * 
	 * Update Circular Progress:
	 * 		$scope.$broadcast('updateCircularProgress', $scope, $scope.configCircularParam);
	 * 
	 * View:
	 * 		<epng-circular-progress></epng-circular-progress>
	 * Controller:
	 * 		$scope.configCircularParam = 
			{
				id: 1,								//进度条的唯一性， 比如生成的CSS
				circularNum: 67,					//圆圈进度条占用百分比, 
			  	circularNumFont: 'Trebuchet MS',	//圆圈显示Label的字体
				circularNumColor: '#000000',		//圆圈显示Label的颜色
				circularNumFontSize: '3rem',		//圆圈显示Label的字体大小
				dotSize: '3em',					//白点的大小
				dotTopPosition: '-10px',			//白点距离顶部位置
				dotLeftPosition: '1px',			//白点距离左边位置
				animationDuration: 3,				//动画持续时间， 单位为秒
				circularWidth: '10rem',			//圆圈的宽度
				circularHeight: '10rem',			//圆圈的高度
				circularFrontColor: '#3598DB',		//前圆圈的颜色
				circularFrontSize: 35,				//前圆圈的大小
				circularBgSize: 20,				//后圆圈的大小
				circularBgColor: '#606060'			//后圆圈的颜色
			};
	 */
    .directive("epngCircularProgress", ['directiveIdUtils', function (directiveIdUtils) {
    	return {
            restrict: 'E',
            scope: {
            	configCircularParam: '=epngModel'
            },
            templateUrl: 'epng/chart/epng-circular-progress.html',
            controller: function($scope){
            	$scope.configCircularParam = {
            			id: directiveIdUtils.getId('Cir'),			//进度条的唯一性， 比如生成的CSS
//            			circularNum: 25,					//圆圈进度条占用百分比, 
            		  	circularNumFont: 'Trebuchet MS',	//圆圈显示Label的字体
            			circularNumColor: '#000000',		//圆圈显示Label的颜色
            			circularNumFontSize: '1.4rem',		//圆圈显示Label的字体大小
            			dotSize: '1.4em',					//白点的大小
            			dotTopPosition: '-10px',			//白点距离顶部位置
            			dotLeftPosition: '1px',				//白点距离左边位置
            			animationDuration: 3,				//动画持续时间， 单位为秒
            			circularWidth: '4.5rem',			//圆圈的宽度
            			circularHeight: '4.5rem',			//圆圈的高度
            			circularFrontColor: '#3498DB',		//前圆圈的颜色
            			circularFrontSize: 35,				//前圆圈的大小
            			circularBgSize: 20,					//后圆圈的大小
            			circularBgColor: '#606060'			//后圆圈的颜色
            	};
            	
            	            	
            	angular.extend($scope.configCircularParam, $scope.$parent.configCircularParam);
            	
            	$scope.$on('updateCircularProgress', function(events, parentScope, configCircularParam){
//            		$scope.$eval(function(){
            			angular.extend($scope.configCircularParam, configCircularParam);
//            		});
            	});
            	
            },
            link: function(scope, el, attr){
            	if (angular.isUndefined(scope.configCircularParam.circularNum)) {
            		el.remove();
            	}
            }
    	}
    }]);

}());