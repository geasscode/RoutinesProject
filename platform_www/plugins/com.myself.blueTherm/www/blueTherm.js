cordova.define("com.myself.blueTherm.blueTherm", function(require, exports, module) {

var argscheck = require('cordova/argscheck'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec');
module.exports = {
    takeTemp : function(success,error) {
    	exec(success, error, "BlueThermPlugin", "takeTemp", []);
    },
    stopTakeTemp : function(){
    	exec(null, null, "BlueThermPlugin", "stopTakeTemp", []);
    }
};


});
