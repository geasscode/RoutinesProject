angular.module('app.services')

.service('StartupService',['$cordovaDevice', '$cordovaAppVersion', 'DBMgr', 'IdUtils', function ($cordovaDevice, $cordovaAppVersion, DBMgr, IdUtils) {

	var CLIENT_INFO_KEY_PREFIX = "client.info.";
	AppModel = {
		appVersion: null,
		userId: null,
		clientId: null
	};

	function initClientInfo(){
		var deviceInfo = null;
		var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
		if ( app ) {
		    // PhoneGap application
		    deviceInfo = $cordovaDevice.getDevice();
		    AppModel.appVersion = $cordovaAppVersion.getAppVersion();
		} else {
		    // Web page
		    deviceInfo = {
		    	cordova: 'browser',
		    	uuid: 'BroswerClient',
		    	model: 'model',
		    	version: 'version'
		    };

		    AppModel.appVersion = "unknown";

		}

		var clientInfoKey = CLIENT_INFO_KEY_PREFIX + deviceInfo.uuid;
		AppModel.clientId = deviceInfo.uuid;
		AppModel.userId = "colin.lin";

		console.log("device info = ", deviceInfo);

		return DBMgr.getDB().get(clientInfoKey)
		.then(function(clientInfo){
			console.log("clientInfo found: ", clientInfo);

			// clientInfo.deviceInfo = deviceInfo;
			// clientInfo.appVersion = AppModel.appVersion;

			// return saveClientInfo(clientInfo);
			return clientInfo;
		})
		.catch(function(error){
			console.log("client Info not found: ", error);

			var clientInfo = {
				_id: clientInfoKey,
				clientId: deviceInfo.uuid,
				deviceInfo: deviceInfo,
				appVersion: AppModel.appVersion
			}

			return saveClientInfo(clientInfo);

		});
	};

	function saveClientInfo(clientInfo){
		return DBMgr.getDB().put(clientInfo)
		.then(function(result){
			console.log(result);
			return result;
		})
		.catch(function(error){
			console.log(error);
		});
	};


	this.startup = function(){
		console.log('StartupService.startup...');
		var i = initClientInfo();
		
		return i.then(function(result){
			return DBMgr.init();
		});
	};
}]);