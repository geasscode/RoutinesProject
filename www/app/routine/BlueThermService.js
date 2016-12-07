angular.module('app.services')

.factory('BlueThermService',['$interval',
function($interval)
         {
         var stop;
         return {
             takeTemp : function(success,error)
             {
                 if ( angular.isDefined(stop) ) return;
                 stop = $interval(function() {
                                  blueTherm.takeTemp(success,error);
                                  }, 1000);
             },
             stopTakeTemp : function(){
                 blueTherm.stopTakeTemp();
                 if (angular.isDefined(stop)) {
                     $interval.cancel(stop);
                     stop = undefined;
                 }
             }
         };
}]);