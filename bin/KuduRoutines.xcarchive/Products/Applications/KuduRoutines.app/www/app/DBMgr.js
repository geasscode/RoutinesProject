/**
 * Provide a db instance to operate the database data and provide some convinent functions to update data

 * @author Colin Lin
 */
angular.module('app.services')

.service('DBMgr', ['$rootScope', '$q', 'angularLoad',function ($rootScope, $q, angularLoad) {

	// Local Lib Database
	var localLibDB = new PouchDB("smartdegreeslib", {adapter: 'websql', location: 2});
	// Local Eval Database
	var localEvalDB = new PouchDB("smartdegreeseval", {adapter: 'websql', location: 2});
	// Remote Lib Database
	//var remoteLibDB = new PouchDB("http://10.0.0.97:5984/smartdegrees");
	// var remoteLibDB = new PouchDB("http://testsmartroutinesdb.nextxnow.com/smartdegreeslib");
	var remoteEvalDB = new PouchDB("http://testsmartroutinesdb.nextxnow.com/smartdegreeseval");

	/**
	 * get database config object to retrieve the version value,
	 * then use the version value to determine next version,
	 * for example, if the current version in database is 1,
	 * will lookup the target version 2 and load to database
	 * 
	 * @see loadAndSaveData
	 *
	 */
	function getDBConfig(){
		return localLibDB.get("db_config")
		.then(function(dbConfig){
			console.log('Database config loaded');
			return dbConfig;
		})
		.catch(function(error){
			console.log('No db config found, creating...');
			return {_id: 'db_config', version: 0, config: false};
		})
	};

	function getRestConfig(){
		return localEvalDB.allDocs({
			include_docs: true,
			startkey: "RS_",
			endkey: "RS_\uffff"
		}).then(function(result){
			return result.rows[0].doc;
		})
		// return localLibDB.get("db_config").then(function(dbConfig){
		// 	return dbConfig;
		// }).catch(function(err){
		// 	return err;
		// })
	}

	function setRestConfig(config){
		return saveDoc(config);
		console.log(config);
	}

	function updateRestConfig(config){
		
	}

	/**
	 * try to load next version data and save to database
	 *
	 * @param {Object} dbConfig the current db config retrieved from DB
	 */
	function loadAndSaveData(dbConfig){
		// determine next version number
		var version = dbConfig.version + 1;
		var config = dbConfig.config;

		var d = $q.defer(),
			promise = d.promise;

		// determine prebuilt data file of next version
		var targetFile = 'data/prebuilt_data_v' + version + ".js";
		console.log('trying to load ' + targetFile);

		// make sure _PREBUILT_DATA as deleted before loading the data file
		if (window._PREBUILT_DATA) delete window._PREBUILT_DATA;
		
		// load the file
		angularLoad.loadScript(targetFile)
		// load sucess
		.then(function(){
			console.log('targetFile loaded: ' + targetFile);

			// check if the variable declared
			if (!_PREBUILT_DATA){
				console.log('_PREBUILT_DATA not found');
				d.reject({status: 404, message: 'data node not found'});
			}

			// make sure the version match
			if (_PREBUILT_DATA.version != version){
				d.reject({status: 404, message: 'version mismatch', versionInFile: _PREBUILT_DATA.version, version: version});
			}

			var docs = _PREBUILT_DATA.data;

			//TODO: filter data here by ID
			console.log(docs);

			// start to save the docs (data)
			return saveDocs(docs, 0)
			// then update db config
			.then(function(result){
				console.log("save docs result ", result);
				dbConfig.version = version;

				if (window._PREBUILT_DATA) delete window._PREBUILT_DATA;
				return localLibDB.put(dbConfig);
			})
			// resolve promise
			.then(function(result){
				console.log('saving data success from ' + targetFile);
				d.resolve(result);
			});
		})
		// load failure
		.catch(function(result){
			d.reject({status: 404, message: 'file not found: ' + targetFile});
			if (window._PREBUILT_DATA) delete window._PREBUILT_DATA;
		});

		return promise;
	};

	/**
	 * save data (documents)
	 *
	 * @param {Array} docs the loaded data from prebuilt data js file
	 * @param {Integer} i the index of the element in docs, which will be saved to database
	 */
	function saveDocs(docs, i){
		if (i == docs.length) return {status: "ok", message: "complete"};

		var doc = docs[i];

		return saveDoc(doc)
		.then(function(result){
			var next = i + 1;
			return saveDocs(docs, next);
		});
	};

	/**
	 * save one document
	 *
	 * @param {Object} doc the document to save
	 */
	function saveDoc(doc){
		console.log("saving doc " + doc._id);
		//get doc ID
		return localLibDB.get(doc._id)
		.then(function(result){
			//get doc rev
			doc._rev = result._rev;
			//save to local db
			return localLibDB.put(doc);
		})
		.catch(function(error){
			return localLibDB.put(doc);
		});
	};

	/**
	 * step 1: get db config, use current version number to determine next version (current version + 1)
	 * step 2: try to load next version data and save to db
	 * step 3: invoke doInitData itself again (recursively)
	 *
	 */
	function doInitData(){
		return getDBConfig()
		.then(function(dbConfig){
			console.log('prebuilt data version = ' + dbConfig.version);
			return loadAndSaveData(dbConfig);
		})
		.then(function(result){
			console.log("init db result ", result)
			return doInitData();
		})
		.catch(function(error){
			console.log("init db error ", error)
			// return getRestConfig().then(function(result){
			// 	return result;
			// });
		});
	};

	/**
	 * init design docs
	 *
	 */
	function initDesignDocs(){
		console.log('Initializing design docs...');

		localEvalDB.createDesignDoc(
			'routine_by_date', // view name
			function (doc) {
	            if (doc.docType == "RT"){
	                emit(doc.routineDate);
	            }
			}
		);
	};

	function replicateEvalData2RemoteDB(){
		var opts = {
			live: true,
			retry: true,
			filter: function(doc){
				return !doc._deleted;
			}
		};

		localEvalDB.replicate.to(remoteEvalDB, opts)
		.on('change', function (info) {
			console.log('there is changes replicating to remote database...');
		});		
	};

	/**
	 * replicate from remote lib database
	 *
	 */
	function replicateFromRemoteDB(){
		var opts = {
			live: true,
			retry: true,
			filter: function(doc){
				return !doc._deleted;
			}
		};

		console.log('Start replicating from remote database...');

		var d = $q.defer(),
			promise = d.promise;

		// d.resolve(true);

		localLibDB.replicate.from(remoteLibDB, opts)
		.on('change', function (info) {
			console.log('change replicating from remote database...');
		}).on('paused', function () {
			console.log('paused replicating from remote database...');
			d.resolve(true);
		}).on('active', function () {
			console.log('active replicating from remote database...');
		}).on('denied', function (info) {
		  	console.log('denied replicating from remote database...', info);
		}).on('complete', function (info) {
			console.log('complete replicating from remote database...', info);
			console.log('Finish initializing database...');
			d.resolve(info);
		}).on('error', function (error) {
			console.log('error replicating from remote database...', error);
			d.reject(error);
		});

		return promise;
	};

	// get the underline DB
	this.getDB = function(){
		return localEvalDB;
	};


	this.getEvalDB = function(){
		return localEvalDB;
	};

	this.getLibDB = function(){
		return localLibDB;
	};

	this.getRestConfig = function(){
		return getRestConfig();
	}

	this.setRestConfig = function(config){
		return setRestConfig(config);
	}


	/**
	 * init database: load and save local prebuilt data, then replicate from remote DB
	 *
	 */
	this.init = function(){

		console.log('Start initializing database...');

		replicateEvalData2RemoteDB();

		initDesignDocs();

		return doInitData();
		// .then(replicateFromRemoteDB);

		//localEvalDB.replicate.to(remoteEvalDB, opts);
	};
}]);