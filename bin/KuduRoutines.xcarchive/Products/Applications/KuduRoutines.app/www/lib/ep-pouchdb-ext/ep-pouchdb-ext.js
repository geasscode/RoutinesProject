
/**
 * Extend PouchDB to add convinent functions
 * 
 * Note: this extension is base on AngularJS $q
 *
 * @author Colin Lin
 * @date 2015/06/02
 */
angular.injector(['ng']).invoke(['$q', function($q) {

	/**
	 * A convinent way to create or update a document,
	 * if the document is not in db, then save it as new, 
	 * otherwise update it with current revision (_rev) and property values.
	 *
	 * For update, this function will check if there are changes on the document properties,
	 * if no changes found, the update will be considered as success but it won't update the DB.
	 *
	 * Use this function when you are not sure if it's a create or update.
	 *
	 * 
	 * 1. putX({Object} sourceObjWithId, {String} fields...) "_id" as id property name
	 * 2. putX({String} _id, {String} propertyName, {Object} propertyValue) for one property
	 * 3. putX({String} _id, {Object} sourceObj, {String} fields...)
	 * 
	 * @return follow the same spec as PouchDB.put, {ok:true} for success, {error:true} or throws error for failure
	 */
	PouchDB.prototype.putX = function(){
		var pouchdb = this;

		// check arguments
		if (arguments.length < 2){
			return $q.reject({error: true, message: "illegal arguments, at least 2 arguments should be provided"});
		}

		var arg1 = arguments[0], arg2 = arguments[1];

		if (typeof(arg1) != "string" && typeof(arg1) != "object" &&
			typeof(arg2) != "string" && typeof(arg2) != "object"){
			return $q.reject({error: true, message: "The 1st and 2nd argument must be string or object"});
		}

		// get _id
		var _id = null;
		var source = {};

		// -- putX({Object} sourceObjWithId, {String} fields...) 
		if (typeof(arg1) == "object"){
			_id = arg1["_id"];
			// source = arg1;
			for (var i = 1; i < arguments.length; i++){
				source[arguments[i]] = arg1[arguments[i]];
			}

		}
		else{
			_id = arg1;
		// -- putX({String} _id, {String} propertyName, {Object} propertyValue)
			if (typeof(arg2) == "string"){
				//TODO should verify the 3rd argument here
				source[arg2] = arguments[2];
			}
		// -- putX({String} _id, {Object} sourceObj, {String} fields...)
			else{
				for (var i = 2; i < arguments.length; i++){
					source[arguments[i]] = arg2[arguments[i]];
				}
			}
		}

		return pouchdb.get(_id)
		.then(function(doc){
			// check if has changes
			var hasChanges = false;
			for (var p in source){
				if (doc[p] != source[p]){
					hasChanges = true;
					console.log("has change: " + doc[p] + ' vs ' + source[p]);
					doc[p] = source[p];
				}
			}

			// update the document if it has change
			if (hasChanges){
				return pouchdb.put(doc);
			}
			else{
				// if no changes, consider the operation is success
				// TODO, think about how to handle this case is better
				return $q.when({ok: true, id: _id, message: "but no changes"});
			}
		})
		.catch(function(error){
			// save as new if the document was not found
			if (error.status == 404){
				source._id = _id;
				return pouchdb.put(source);
			}else{
				throw error;
			}
		});
	};

	/**
	 * create design document in database (persistent view).
	 *
	 * @param {String} name name of the view
	 * @param {Function} mapFunction map function
	 */
	PouchDB.prototype.createDesignDoc = function(name, mapFunction){
		var ddoc = {
			_id: '_design/' + name,
			views: {
			}
		};

		ddoc.views[name] = {map: mapFunction.toString()};

		var db = this;

		db.put(ddoc)
		.catch(function(error){
			console.log(error);
		});
	};
}]);