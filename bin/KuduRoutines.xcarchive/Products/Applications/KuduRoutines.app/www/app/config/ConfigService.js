angular.module('app.services')

.service('ConfigService',['DBMgr', function (DBMgr) {
    
    this.saveConfig = function(doc){
    	console.log(doc._id);
    	DBMgr.setRestConfig(doc);
    }

}]);