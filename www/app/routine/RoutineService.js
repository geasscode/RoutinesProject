/**
 * Routine Service
 *
 * @author Eric Feng, Colin Lin
 */
angular.module('app.services')

    .service('RoutineService',['$rootScope', 'DBMgr', 'IdUtils', '$filter', '$cordovaAppVersion', '$cordovaFile', 'BackendService', 'MockupService', '$q', 
    function ($rootScope, DBMgr, IdUtils, $filter, $cordovaAppVersion, $cordovaFile, BackendService, MockupService, $q) {
        // reference of DBMgr, for debug only
    	window.DBMgr = DBMgr;
        // reference of $q, for debug only
        // window.$q = $q;
        // eval DB
    	var db = DBMgr.getDB();
        // lib DB
        var libDB = DBMgr.getLibDB();

    	// The current opened routine
    	var currentRoutine = null;
        // root of lib items
    	var itemRoot = null;
        // time items
        var timeItems = null;

        // current account number
    	var accountNumber = null;

        // current time item
        var currentTimeItem = null;
        // current activity item
        var currentActivityItem = null;

        // current routine date
    	var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');

        /**
         * check if the given time is before current local time
         * 
         * @param {String} time in format mm:ss AM/PM, e.g.: 6:00 AM, 11:00 PM...
         */
	    function isBeforeLocalTime(time){
				// init local time
	    		var localDate = new Date();
				var localHours = localDate.getHours();
				var localMinutes = localDate.getMinutes();
                // total minutes of current time
                var currentMinutes = localHours * 60 + localMinutes;

				// init compare time
				var timeArrays = time.split(' ');
                var ampmMarker = timeArrays[1];
				var timeHours = timeArrays[0].split(':')[0];
				var timeMinutes = timeArrays[0].split(':')[1];

                if (timeHours.indexOf("0") == 0){
                    timeHours = timeHours.charAt(1);
                }

                if (timeMinutes.indexOf("0") == 0){
                    timeMinutes = timeMinutes.charAt(1);
                }

                timeHours = parseInt(timeHours);
                timeMinutes = parseInt(timeMinutes);
                
                /*if ("PM" == ampmMarker){
                    timeHours = timeHours + 12;
                }*/
                
                if ("PM" == ampmMarker && timeHours != 12 || "AM" == ampmMarker && timeHours == 12){
                    timeHours = timeHours + 12;
                }

                /*console.log(timeHours + ": " + timeMinutes);
                console.log(currentMinutes);
                console.log(ampmMarker);*/

                // total minutes of given time
                var timesMinutes = timeHours * 60 + timeMinutes;

                return timesMinutes < currentMinutes;
		};

        /**
         * resolve _id of eval item (for storing eval item data in NoSQL DB)
         */
        function resolveEvalItemId(routineId, libItemId){
            return "RI_" + routineId + "_" + libItemId;
        };

        /**
         * resolve _id of eval item (for storing eval item data in NoSQL DB)
         */
        function resolveEvalPictureId(routineId, libItemId){
            return "RTPIC_" + resolveEvalItemId(currentRoutine._id, libItemId);
        }

        /**
         * load pictures of an item
         *
         */
        function loadItemPictures(item){
            var _id = "pic." + "MST.MST.D002716DEFED40BC.PIC." + item.pictureId

            //query and copy eval item properties to lib item
            return libDB.get(_id)
            .then(function(result){
                item.libImageSrc = "data:"+ result.content_type +";base64," + result.data;
                item.imageSrc = item.libImageSrc;
                return item;
            })
            //not found
            .catch(function(error){
                if (error.status == 404){
                    console.log("pic item " + _id + " not found -> " + item.itemId);
                }else{
                    console.log(error);    
                }
                
            });
        };

        function calcProgress(totalCount, completeCount){
            var progress = $filter('number')(completeCount * 100 / totalCount, 0);

            return parseInt(progress);
        };

        function updateRoutineProgress(){
            console.log("updateRoutineProgress");
            var overallActivityTotalCount = 0;
            var overallActivityCompleteCount = 0;
            var countDataTypeChecks = 0;

            for (var i = 0; i < timeItems.length; i++){
                var timeItem = timeItems[i];
                var activityItems = timeItem.items;

                var timeActivityTotalCount = 0;
                var timeActivityCompleteCount = 0;

                for (var j = 0; j < activityItems.length; j++){
                    
                    if(activityItems[j].dataType == "Checks"){
                        if(activityItems[j].answer == 'Y' || activityItems[j].answer == 'N'){
                            activityItems[j].progress = 100;

                        }
                    }

                    if(activityItems[j].dataType == "Default" || activityItems[j].dataType == "Question"){
                        countDataTypeChecks++;
                    }
                    else{
                        overallActivityTotalCount++;
                        timeActivityTotalCount++;

                        if (activityItems[j].progress == 100){
                            overallActivityCompleteCount++;
                            timeActivityCompleteCount++;
                        }
                    }
                    
                }

                // calculate progress
                var progress = (timeActivityTotalCount > 0)?calcProgress(timeActivityTotalCount, timeActivityCompleteCount, countDataTypeChecks):0;
                // set to time
                timeItem.progress = progress;

                var id = resolveEvalItemId(currentRoutine._id, timeItem.itemId);

                db.putX(id, timeItem, "itemId", "progress");
            }
            // calculate progress
            var progress = calcProgress(overallActivityTotalCount, overallActivityCompleteCount);
            // set to current activity
            currentRoutine.progress = progress;

            db.putX(currentRoutine, "progress");
        };
 		

        /**
         * load and set eval values to lib items
         *
         */
        function loadEvalValues(libItems){
            // prepare keys for eval items data that were store in eval DB
            var keys = [];
            for (var i = 0; i < libItems.length; i++){
                keys.push(resolveEvalItemId(currentRoutine._id, libItems[i].itemId));
            }

            // perform allDocs query by the given keys
            return db.allDocs({
                keys: keys,
                include_docs: true
            })
            .then(function(result){
                var rows = result.rows;

                for (var j = 0; j < rows.length; j++){

                    if (rows[j].error != "not_found"){
                        var doc = rows[j].doc;
                        var libItem = libItems[j];
                        for (var p in doc){
                            if (p == "_id" || p == "itemId") continue;
                            libItem[p] = doc[p];
                        }
                    }
                }

                return libItems;
            });
        };
        
        /**
         * update question answer
         *
         * @param {Object} questionItem question item, property "answer" should be provided
         */
        function updateQuestionAnswer(questionItem, notUpdatePicklist) {
            var id = resolveEvalItemId(currentRoutine._id, questionItem.itemId);

            var self = this;

            // 1. save the properties
            return db.putX(
                id, 
                {
                    itemId: questionItem.itemId, 
                    answer: questionItem.answer
                },
                "itemId", "answer"
            )
            // 2. if answer is Y, set all downstream picklist to unchecked (checked = false)
            .then(function(result){
                if (notUpdatePicklist === true) return;

                if (questionItem.answer == "Y"){
                    var items = questionItem.items;
                    for(var i = 0; i < items.length; i++){
                        var pickListItem = items[i];
                        if(pickListItem.checked){
                            pickListItem.checked = false;
                            var picklistDocId = resolveEvalItemId(currentRoutine._id, pickListItem.itemId);
                            db.putX(
                                picklistDocId, 
                                {itemId: pickListItem.itemId, checked: pickListItem.checked},
                                "itemId", "checked"
                            );
                        }
                    }
                }
            })
            // 3. calculate and save progress of current activity item
            .then(function(result){

                // loop all products in all category of current food safety check activity
                var categoryList = currentActivityItem.items;

                var totalCount = 0, completeCount = 0;
                for (var i = 0; i < categoryList.length; i++){
                    var questions = categoryList[i].items;
                    if (questions == null) continue;

                    for (var j = 0; j < questions.length; j++){
                        totalCount++;
                        if ('Y' == questions[j].answer 
                            || 'N'  == questions[j].answer){
                            completeCount ++;
                        }
                    }
                }
                // calculate progress
                var progress = calcProgress(totalCount, completeCount);
                // set to current activity
                currentActivityItem.progress = progress;
                // set time completed to current activity
                var localTime, localHour, localMin, AMPM;
                if (progress === 100 && currentActivityItem.timeCompleted == null) {
                    localTime = new Date();
                    localHour = localTime.getHours();
                    localMin = localTime.getMinutes();
                    AMPM = localHour < 12 ? 'AM' : 'PM';
                    function pad(num, size) {
                        var s = num+"";
                        while (s.length < size) s = "0" + s;
                        return s;
                    }
                    localHour = AMPM === 'PM' ? localHour - 12 : localHour;
                    currentActivityItem.timeCompleted = localHour + ":" + pad(localMin, 2) + " " + AMPM;
                }

                var id = resolveEvalItemId(currentRoutine._id, currentActivityItem.itemId);
                // save progress to db
                return db.putX(

                    id, 
                    currentActivityItem,
                    "itemId", "progress", "timeCompleted"
                )
                .then(function(result){
                    return progress;
                });

            })
            .then(function(result){
                if(currentActivityItem.dataType == 'Checks'){
                    var resultChecks = 0;
                    var answer = currentActivityItem.answer;
                    if(answer == 'N' || answer == 'Y'){
                        resultChecks =100;
                        currentActivityItem.progress =100;

                        if (resultChecks == 100 ) updateRoutineProgress();
                            $rootScope.$apply();
                            return questionItem;
                    }
                }
                if (result == 100 ) updateRoutineProgress();
                $rootScope.$apply();
                return questionItem;
            });

        }

        /**
         * public functions
         */
        return {
            /**
             * try to init the routine data for current day, then open the routine
             *
             * @see #openRoutine
             */
            initRoutineForToday: function(){
                //get alignment data here

                var params = {
                    accountNumber: $rootScope.restaurant.restId, // use current account number
                    routineDate: $filter('date')(new Date(), 'yyyy-MM-dd')
                    // routineDate: "2015-04-29"
                };

                var self = this;

                return self.createRoutine(params)
                .then(function(routine){
                    if (!routine.progress) routine.progress = 0; //add progress object
                    console.log(routine);
                    currentRoutine = routine;
                    return self.openRoutine(currentRoutine);
                });
            },
        	/**
        	 * create routine. First to check whether the routine was created in DB, if not then create it.
        	 *
        	 */
        	createRoutine: function(params){
        		// Query to check if today's routine was created
				var p = db.query('routine_by_date', 
					{	
						key: params.routineDate,
                        include_docs: true
					}
				)
				// check the query result
        		.then(function(result){
                    console.log(result);
        			// if no rows found, create a routine and save to DB
        			if (result.rows.length == 0){
        				console.log("no routine found for " + params.routineDate + ", create a new one");
        				var routine = {
        					_id: IdUtils.getId("RT_"),
                            docType: 'RT',
							accountNumber: params.accountNumber,
							createDate: new Date(),
							routineDate: params.routineDate,
							clientId: AppModel.clientId,
							appVersion: AppModel.appVersion,
							createdBy: AppModel.userId, //TODO: change to Restaurant Name
							bmu: params.bmu,
							concept: params.concept,
							versionId: 'MST.MST.D002716DEFED40BC.RT' //TODO: get from lib.config
        				};
        				// // save routine to DB
        				return db.put(routine)
                        // use result.id to get the routine object
                        .then(function(result){
                            BackendService.postCurrentRoutine(routine).then(function(result){
                                console.log(result.data); 
                            }).catch(function(err){
                                console.log(err);
                            });        
                            return db.get(result.id);
                        });                        
        			}
        			// if rows found, return the first row
        			else{
        				console.log("routine found for " + params.routineDate);
                        console.log(result);
        				return result.rows[0].doc;
        			}
        		})
                .catch(function(error){
                    console.log(error);
                });
        		// set the result to current routine
        		// .then(function(result){
        		// 	currentRoutine = result;
        		// 	return currentRoutine;
        		// });

                return p;
        	},

        	/**
        	 * get routine list
        	 *
        	 */
        	getRoutineList: function(){
				var p = db.allDocs(
                {
                    startkey: 'RT_\uffff',
                    endkey: 'RT_',
                    descending: true,
					include_docs: true
                })
                .then(function(result){
					if (result.rows.length == 0) return [];

					var data = [];

					for (var i = 0; i < result.rows.length; i++){
						data.push(result.rows[i].doc)
					}
					return data;
				});

				return p;
        	},

        	/**
        	 * get restaurant list
        	 *
        	 */
        	getRestaurantList: function(){
        		return MockupService.makePromise(
        			[
        				{accountNumber: '000001', address: 'address 1', city: 'Austin', state: 'TX', zip: '73337', bmu: 'MST', concept: 'MST'},
        				{accountNumber: '000002', address: 'address 2', city: 'Austin', state: 'TX', zip: '33433', bmu: 'MST', concept: 'MST'}
        			],
        			null,
        			true
        		);
        	},
            /**
             * get current account number
             */
        	getAccountNumber: function(){
        		return accountNumber;
        	},

            /**
             * set current account number
             *
             * @param an account number
             */
        	setAccountNumber: function(an){
        		accountNumber = an;
        	},

        	/**
        	 * open the given routine, load the item tree from db then set to itemRoot and timeItems
        	 *
        	 */
        	openRoutine: function(routine){
                currentRoutine = routine;
                currentDate = routine.routineDate;

                var self = this;
        		var docId = "lib." + routine.versionId;

                // query by docId
        		var p = libDB.get(docId)
                // extract time items
	    		.then(function(doc){
					itemRoot = doc;
                    timeItems = doc.data;
					return timeItems;
	    		})
                // set eval values for all time items
                .then(function(timeItems){
                    return loadEvalValues(timeItems);
                })
                // set eval values and alert status for activity items of each time item
                .then(function(timeItems){
                    var allActivityItems = [];

                    for (var i = 0; i < timeItems.length; i++){
                        var timeItem = timeItems[i];

                        if((!timeItem.progress || timeItem.progress < 100) 
                            && isBeforeLocalTime(timeItem.desc0)){
                            timeItem.showAlert = true;
                        }
                        /*console.log(timeItem);*/
                     

                        allActivityItems = allActivityItems.concat(timeItem.items);
                    }

                    // set eval values for all activity items
                    return loadEvalValues(allActivityItems);

                })
                .then(function(){
                    return {
                        routine: currentRoutine,
                        timeItems: timeItems
                    };
                })
                .catch(function(error){
                    console.log(error);
                });

        		return p;
        	},

            // /**
            //  * get overall progress
            //  *
            //  */
            // getOverallProgress: function(){
            //     var timeItems = itemRoot.data;

            //     var completeCount = 0;

            //     for (var i = 0; i < timeItems.length; i++){
            //         if (timeItems[i].complete === true) completeCount++;
            //     }

            //     return 100 * completeCount / timeItems.length;
            // },

            /**
             * get temperature product category list for current activity item
             */
            getTempCategoryList: function(){
                var tempCategoryList = currentActivityItem.items;

                var promises = [];
                promises.push(loadEvalValues(tempCategoryList));


                for (var i = 0; i < tempCategoryList.length; i++){
                    var tempProductList = tempCategoryList[i].items;
                    var p = promises.push(loadEvalValues(tempProductList));
                }

                return $q.all(promises)
                .then(function(data){
                    return tempCategoryList;
                })
            },

            /**
             * load item pictures
             */
            loadItemPictures: loadItemPictures,

            /**
             * get temperature product list for the given category
             *
             * @param {Object} tempCategoryItem product category item
             */
            getTempProductList: function (tempCategoryItem) {
                var tempProductList = tempCategoryItem.items;

                var p = loadEvalValues(tempProductList)
                .then(function(tempProductList){
                    var firstProduct = tempProductList[0];
                    return loadItemPictures(firstProduct);
                })
                .then(function(){
                    return tempProductList;
                });

                return p;
            },

            /**
             * get combined temperature product list of all temp categories of current time
             *
             */
            getCombinedTempProductList: function(){
                var tempCategoryList = currentActivityItem.items;

                var tempProductList = [];

                // loop all categories
                for (var i = 0; i < tempCategoryList.length; i++){
                    var products = tempCategoryList[i].items;

                    // loop products in per category
                    for (var j = 0; j < products.length; j++){
                        // set category description to each product item
                        products[j].category = tempCategoryList[i].desc0;
                        // add to temp product list
                        tempProductList.push(products[j]);
                    }
                }

                // set eval values and load picture of first product
                var p = loadEvalValues(tempProductList)
                .then(function(tempProductList){
                    var firstProduct = tempProductList[0];
                    return loadItemPictures(firstProduct);
                })
                .then(function(){
                    return tempProductList;
                });

                return p;
            },

            /**
             * get food safety category list for current activity item
             *
             */
            getFSCategoryList: function(){
                var fsCategoryList = currentActivityItem.items;

                var d = $q.defer(),
                promise = d.promise;

                // TODO: revise below nested loop
                loadEvalValues(fsCategoryList)
                .then(function(fsCategoryList){

                    for (var i = 0; i < fsCategoryList.length; i++){
                        var questions = fsCategoryList[i].items;

                        if (questions && questions.length > 0){

                            loadEvalValues(questions)
                            .then(function(questions){

                                for (var j = 0; j < questions.length; j++){
                                    var picklists = questions[j].items;
                                    if (picklists && picklists.length > 0){
                                        loadEvalValues(picklists);
                                    }
                                }
                            });
                        }
                    }
                });

                d.resolve(fsCategoryList);

                return promise;
            },

            /**
             * get Travel Path category list for current activity item
             *
             */
            getTPCategoryList: function(){
                var tpCategoryList = currentActivityItem.items;

                var d = $q.defer(),
                promise = d.promise;

                // TODO: revise below nested loop
                loadEvalValues(tpCategoryList)
                .then(function(tpCategoryList){

                    for (var i = 0; i < tpCategoryList.length; i++){
                        var questions = tpCategoryList[i].items;

                        if (questions && questions.length > 0){

                            loadEvalValues(questions)
                            .then(function(questions){

                                for (var j = 0; j < questions.length; j++){
                                    var picklists = questions[j].items;
                                    if (picklists && picklists.length > 0){
                                        loadEvalValues(picklists);
                                    }
                                }
                            });
                        }
                    }
                });

                d.resolve(tpCategoryList);

                return promise;
            },

            /**
             * get Travel Path FOH category list for current activity item
             *
             */
            getFOHCategoryList: function(){
                var fohCategoryList = currentActivityItem.items;

                var d = $q.defer(),
                promise = d.promise;

                // TODO: revise below nested loop
                loadEvalValues(fohCategoryList)
                .then(function(fohCategoryList){

                    for (var i = 0; i < fohCategoryList.length; i++){
                        var questions = fohCategoryList[i].items;

                        if (questions && questions.length > 0){

                            loadEvalValues(questions)
                            .then(function(questions){

                                for (var j = 0; j < questions.length; j++){
                                    var picklists = questions[j].items;
                                    if (picklists && picklists.length > 0){
                                        loadEvalValues(picklists);
                                    }
                                }
                            });
                        }
                    }
                });

                d.resolve(fohCategoryList);

                return promise;
            },

            /**
             * get Travel Path FOH category list for current activity item
             *
             */
            getBOHCategoryList: function(){
                var bohCategoryList = currentActivityItem.items;

                var d = $q.defer(),
                promise = d.promise;

                // TODO: revise below nested loop
                loadEvalValues(bohCategoryList)
                .then(function(bohCategoryList){

                    for (var i = 0; i < bohCategoryList.length; i++){
                        var questions = bohCategoryList[i].items;

                        if (questions && questions.length > 0){

                            loadEvalValues(questions)
                            .then(function(questions){

                                for (var j = 0; j < questions.length; j++){
                                    var picklists = questions[j].items;
                                    if (picklists && picklists.length > 0){
                                        loadEvalValues(picklists);
                                    }
                                }
                            });
                        }
                    }
                });

                d.resolve(bohCategoryList);

                return promise;
            },

             /**
             * get Travel Path FOH category list for current activity item
             *
             */
            getDCCategoryList: function(){
                var dcCategoryList = currentActivityItem.items;

                var d = $q.defer(),
                promise = d.promise;

                // TODO: revise below nested loop
                loadEvalValues(dcCategoryList)
                .then(function(dcCategoryList){

                    for (var i = 0; i < dcCategoryList.length; i++){
                        var questions = dcCategoryList[i].items;

                        if (questions && questions.length > 0){

                            loadEvalValues(questions)
                            .then(function(questions){

                                for (var j = 0; j < questions.length; j++){
                                    var picklists = questions[j].items;
                                    if (picklists && picklists.length > 0){
                                        loadEvalValues(picklists);
                                    }
                                }
                            });
                        }
                    }
                });

                d.resolve(dcCategoryList);

                return promise;
            },

            /**
             * get current time
             *
             */
            getCurrentTimeItem:function(){
                return currentTimeItem;
                
            },

            /**
             * set current time
             */
            setCurrentTimeItem:function(timeItem){
                currentTimeItem = timeItem;
            },

            /**
             * get current activity
             */
            getCurrentActivityItem: function(){
                return currentActivityItem;
            },
            /**
             * set current activity
             */
            setCurrentActivityItem: function(timeItem, activityItem, questionItem){
                currentTimeItem = timeItem;
                currentActivityItem = activityItem;
                currentQuestion = questionItem;
            },
            /**
             * get current routine
             */
            getCurrentRoutine: function(){
                return currentRoutine;
            },
            /**
             * get current routine date
             */
            getCurrentDate:function(){
            	return currentDate;
            	
            },
            /**
             * set current routine date
             */
            setCurrentDate:function(value){
           		currentDate = value;
            },

            /**
             * change time
             */
            changeTime:function(activityType, isPrevious){
                var targetIndex = -1;

                // determine current target index by comparing the item id of time
                for(var i = 0;i < timeItems.length; i++){
                    if(currentTimeItem.itemId == timeItems[i].itemId){
                        targetIndex = i;
                    }
                }

                // activity item
                var activityItem = null;
                // target time item
                var targetTimeItem = null;

                // loop to find the first available activity item to determine the time item
                // previous or next
                while (!activityItem){
                    // move back if it's previous
                    if(isPrevious){
                        targetIndex--;
                    }
                    // move forward if it's not previous
                    else{
                        targetIndex++;
                    }

                    // make sure the target index is not out of boundary
                    if (targetIndex == -1){
                        targetIndex = timeItems.length-1;
                    }
                    else if (targetIndex == timeItems.length){
                        targetIndex = 0;
                    }

                    targetTimeItem = timeItems[targetIndex];
                    var activityItems = targetTimeItem.items;

                    for (var i = 0; i < activityItems.length; i++){
                        if (activityItems[i].dataType == activityType){
                            activityItem = activityItems[i];
                            break;
                        }
                    }
                }

                // go to the target time
                var self = this;
                self.setCurrentActivityItem(targetTimeItem, activityItem);

                return targetTimeItem;
            },

            /**
             * update product temperature
             *
             * @param {Object} tempProductItem temperature product item, property "temperature" should be provided
             */
            updateTempProductTemperature: function(tempProductItem){
                var id = resolveEvalItemId(currentRoutine._id, tempProductItem.itemId);

                return db.putX(
                    id, 
                    {
                        itemId: tempProductItem.itemId, 
                        temperature: tempProductItem.temperature
                    },
                    "itemId", "temperature"
                )
                .then(function(result){
                    // loop all products in all category of current take temperature activity
                    var tempCategoryList = currentActivityItem.items;

                    var totalCount = 0, completeCount = 0;

                    for (var i = 0; i < tempCategoryList.length; i++){
                        var products = tempCategoryList[i].items;
                        if (products == null) continue;

                        for (var j = 0; j < products.length; j++){
                            var product = products[j];
                            totalCount++;
                            console.log(product.temperature , isFinite(product.temperature));
                            if (null != product.temperature && isFinite(product.temperature)){
                                completeCount++;
                            }
                        }
                    }
                    // calculate progress
                    var progress = calcProgress(totalCount, completeCount);
                    // set to current activity
                    currentActivityItem.progress = progress;
                    
                    // set time completed to current activity
                    var localTime, localHour, localMin, AMPM;
                    if (progress === 100 && currentActivityItem.timeCompleted == null) {
                        localTime = new Date();
                        localHour = localTime.getHours();
                        localMin = localTime.getMinutes();
                        AMPM = localHour < 12 ? 'AM' : 'PM';
                        function pad(num, size) {
                            var s = num+"";
                            while (s.length < size) s = "0" + s;
                            return s;
                        }
                        localHour = AMPM === 'PM' ? localHour - 12 : localHour;
                        currentActivityItem.timeCompleted = localHour + ":" + pad(localMin, 2) + " " + AMPM;
                    }

                    var id = resolveEvalItemId(currentRoutine._id, currentActivityItem.itemId);
                    // save progress to db
                    return db.putX(
                        id, 
                        currentActivityItem,
                        "itemId", "progress", "timeCompleted"
                    )
                    .then(function(result){
                        return progress;
                    });
                })
                .then(function(result){
                    if (result == 100) updateRoutineProgress();
                    $rootScope.$apply();

                    // completion badge
                    if (result >= 90) {
                        if (!currentActivityItem.hasCompletionBadge){
                            currentActivityItem.hasCompletionBadge = true;
                            currentActivityItem.showCompletionBardge = true;
                        }else{
                            currentActivityItem.showCompletionBardge = false;
                        }
                    }
                    return tempProductItem;
                });
            },

            /**
             * update temperature product comments
             *
             * @param {Object} tempProductItem temperature product item, property "comments" should be provided
             */
            updateTempProductComments: function(tempProductItem){
                var id = resolveEvalItemId(currentRoutine._id, tempProductItem.itemId);

                return db.putX(
                    id, 
                    {itemId: tempProductItem.itemId, comments: tempProductItem.comments},
                    "itemId", "comments"
                );
            },

             /**
             * update dataType safety question answer
             *
             * @param {Object} rtQuestionItem, property "answer" should be provided
             */
            updateRTQuestionAnswer: function(rtQuestionItem, notUpdatePicklist){
                return updateQuestionAnswer(rtQuestionItem, notUpdatePicklist);

            },

            /**
             * update food safety question answer
             *
             * @param {Object} fsQuestionItem food safety question item, property "answer" should be provided
             */
            updateFSQuestionAnswer: function(fsQuestionItem, notUpdatePicklist) {
                return updateQuestionAnswer(fsQuestionItem, notUpdatePicklist);
            },

            /**
             * update food safety category comments
             *
             * @param {Object} fsCategory food safety category, property "comments" should be provided
             */
            updateFSCategoryComments: function(fsCategory){
                var id = resolveEvalItemId(currentRoutine._id, fsCategory.itemId);

                return db.putX(
                    id, 
                    {itemId: fsCategory.itemId, comments: fsCategory.comments},
                    "itemId", "comments"
                );
            },

            /**
             * update travel path question answer
             *
             * @param {Object} tpQuestionItem travel path question item, property "answer" should be provided
             */
            updateTPQuestionAnswer: function(tpQuestionItem, notUpdatePicklist){
                return updateQuestionAnswer(tpQuestionItem, notUpdatePicklist);
            },

            /**
             * update travel path category comments
             *
             * @param {Object} tpCategory travel path category, property "comments" should be provided
             */
            updateTPCategoryComments: function(tpCategory){
                var id = resolveEvalItemId(currentRoutine._id, tpCategory.itemId);

                return db.putX(
                    id, 
                    {itemId: tpCategory.itemId, comments: tpCategory.comments},
                    "itemId", "comments"
                );
            },

            /**
             * update travel path question answer
             *
             * @param {Object} tpQuestionItem travel path question item, property "answer" should be provided
             */
            updateFOHQuestionAnswer: function(fohQuestionItem, notUpdatePicklist) {
                return updateQuestionAnswer(fohQuestionItem, notUpdatePicklist);
            },

            /**
             * update travel path category comments
             *
             * @param {Object} tpCategory travel path category, property "comments" should be provided
             */
            updateFOHCategoryComments: function(fohCategory){
                var id = resolveEvalItemId(currentRoutine._id, fohCategory.itemId);

                return db.putX(
                    id, 
                    {itemId: fohCategory.itemId, comments: fohCategory.comments},
                    "itemId", "comments"
                );
            },

            /**
             * update travel path question answer
             *
             * @param {Object} tpQuestionItem travel path question item, property "answer" should be provided
             */
            updateBOHQuestionAnswer: function(bohQuestionItem, notUpdatePicklist) {
                return updateQuestionAnswer(bohQuestionItem, notUpdatePicklist);
            },

            /**
             * update travel path category comments
             *
             * @param {Object} tpCategory travel path category, property "comments" should be provided
             */
            updateBOHCategoryComments: function(bohCategory){
                var id = resolveEvalItemId(currentRoutine._id, bohCategory.itemId);

                return db.putX(
                    id, 
                    {itemId: bohCategory.itemId, comments: bohCategory.comments},
                    "itemId", "comments"
                );
            },

            /**
             * update travel path question answer
             *
             * @param {Object} tpQuestionItem travel path question item, property "answer" should be provided
             */
            updateDCQuestionAnswer: function(questionItem, notUpdatePicklist) {
                //return updateQuestionAnswer(dcQuestionItem, notUpdatePicklist);
                
                var id = resolveEvalItemId(currentRoutine._id, questionItem.itemId);

                var self = this;

                // 1. save the properties
                return db.putX(
                    id, 
                    {
                        itemId: questionItem.itemId, 
                        answer: questionItem.answer
                    },
                    "itemId", "answer"
                )
                // 2. if answer is Y, set all downstream picklist to unchecked (checked = false)
                .then(function(result){
                    if (notUpdatePicklist === true) return;

                    if (questionItem.answer == "Y"){
                        var items = questionItem.items;
                        for(var i = 0; i < items.length; i++){
                            var pickListItem = items[i];
                            if(pickListItem.checked){
                                pickListItem.checked = false;
                                var picklistDocId = resolveEvalItemId(currentRoutine._id, pickListItem.itemId);
                                db.putX(
                                    picklistDocId, 
                                    {itemId: pickListItem.itemId, checked: pickListItem.checked},
                                    "itemId", "checked"
                                );
                            }
                        }
                    }
                })
                // 3. calculate and save progress of current activity item
                .then(function(result){

                    // loop all products in all category of current food safety check activity
                    var categoryList = currentActivityItem.items;
                    
                    var dcDate = $filter('date')(new Date(), 'EEEE');
                    
                    categoryList = categoryList.filter(function(item) {
                        return item.desc0 == dcDate;
                    });

                    var totalCount = 0, completeCount = 0;
                    for (var i = 0; i < categoryList.length; i++){
                        var questions = categoryList[i].items;
                        
                        if (questions == null) continue;

                        for (var j = 0; j < questions.length; j++){
                            totalCount++;
                            if ('Y' == questions[j].answer 
                                || 'N'  == questions[j].answer){
                                completeCount ++;
                            }
                        }
                    }
                    // calculate progress
                    var progress = calcProgress(totalCount, completeCount);
                    // set to current activity
                    currentActivityItem.progress = progress;
                    // set time completed to current activity
                    var localTime, localHour, localMin, AMPM;
                    if (progress === 100 && currentActivityItem.timeCompleted == null) {
                        localTime = new Date();
                        localHour = localTime.getHours();
                        localMin = localTime.getMinutes();
                        AMPM = localHour < 12 ? 'AM' : 'PM';
                        function pad(num, size) {
                            var s = num+"";
                            while (s.length < size) s = "0" + s;
                            return s;
                        }
                        localHour = AMPM === 'PM' ? localHour - 12 : localHour;
                        currentActivityItem.timeCompleted = localHour + ":" + pad(localMin, 2) + " " + AMPM;
                    }

                    var id = resolveEvalItemId(currentRoutine._id, currentActivityItem.itemId);
                    // save progress to db
                    return db.putX(
                        id, 
                        currentActivityItem,
                        "itemId", "progress", "timeCompleted"
                    )
                    .then(function(result){
                        return progress;
                    });

                })
                .then(function(result){
                    if (result == 100) updateRoutineProgress();
                    $rootScope.$apply();
                    return questionItem;
                });
                
            },

            /**
             * update travel path category comments
             *
             * @param {Object} tpCategory travel path category, property "comments" should be provided
             */
            updateDCCategoryComments: function(dcCategory){
                var id = resolveEvalItemId(currentRoutine._id, dcCategory.itemId);

                return db.putX(
                    id, 
                    {itemId: dcCategory.itemId, comments: dcCategory.comments},
                    "itemId", "comments"
                );
            },

             /**
             * save item picture
             *
             */
            saveEvalItemPicture: function (item, attachment) {

                var pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);
                // clear item.evalImageSrc, make it reloadable when user switch to the product or fs category
                item.evalImageSrc = null;

                // check if the picture document exists
                return db.get(pictureId)
                .then(function(result){
                    // update the picture if it exists
                    // TODO check item.dataType (FOH, BOH, DC, BC)
                   	if(item.dataType == "FSCategory"){
                		return db.putAttachment(pictureId+"_"+IdUtils.getId("FS_"), item.itemId + '.jpeg', result._rev, attachment, 'image/jpeg');
                	}else if(item.dataType == "FOHCategory"){
                        return db.putAttachment(pictureId+"_"+IdUtils.getId("FOH_"), item.itemId+ '.jpeg', result._rev, attachment, 'image/jpeg');
                    }else if(item.dataType == "BOHCategory"){
                        return db.putAttachment(pictureId+"_"+IdUtils.getId("BOH_"), item.itemId+ '.jpeg', result._rev, attachment, 'image/jpeg');
                    }else if(item.dataType == "TPCategory"){
                        return db.putAttachment(pictureId+"_"+IdUtils.getId("TP_"), item.itemId+ '.jpeg', result._rev, attachment, 'image/jpeg');
                    }else if(item.dataType == "DCCategory"){
                        return db.putAttachment(pictureId+"_"+IdUtils.getId("DC_"), item.itemId+ '.jpeg', result._rev, attachment, 'image/jpeg');
                    }else{
                		return db.putAttachment(pictureId, item.itemId + '.jpeg', result._rev, attachment, 'image/jpeg');
                	}
                })
                .catch(function(error){
                    // save as new if the picture does not exist
                    if (error.status = 404){
	                   	if(item.dataType == "FSCategory"){
	                		return db.putAttachment(pictureId+"_"+IdUtils.getId("FS_"), item.itemId + '.jpeg', attachment, 'image/jpeg');
	                	}else if(item.dataType == "FOHCategory"){
                            return db.putAttachment(pictureId+"_"+IdUtils.getId("FOH_"), item.itemId+ '.jpeg', attachment, 'image/jpeg');
                        }else if(item.dataType == "BOHCategory"){
                            return db.putAttachment(pictureId+"_"+IdUtils.getId("BOH_"), item.itemId+ '.jpeg', attachment, 'image/jpeg');
                        }else if(item.dataType == "TPCategory"){
                            return db.putAttachment(pictureId+"_"+IdUtils.getId("TP_"), item.itemId+ '.jpeg', attachment, 'image/jpeg');
                        }else if(item.dataType == "DCCategory"){
                            return db.putAttachment(pictureId+"_"+IdUtils.getId("DC_"), item.itemId+ '.jpeg', attachment, 'image/jpeg');
                        }else{
	                		return db.putAttachment(pictureId, item.itemId + '.jpeg', attachment, 'image/jpeg');
	                	}
                    }else{
                        console.log(error);
                    }
                });
            },
            
            /* 
             * Upload to Server 
             *
             */
            uploadToServer: function() {

                var routine    = currentRoutine,
                    routineId  = routine._id,
                    uploadId   = 'UP_' + routineId + IdUtils.getId("_"),
                    uploadDate = new Date(),
                    progress   = (routine.progress || 0),
                    
                    evalDB     = DBMgr.getEvalDB(),
                    libDB      = DBMgr.getLibDB()
                    // console.log(timestamp);
                
                return fetchActivityItems()
                .then(uploadActivityItemsToServer)
                .then(uploadCurrentRoutine)
                .then(putXNewUploadDate);
                
                function fetchActivityItems() {
                    return evalDB.allDocs({
                        include_docs : true,
                        startkey     : 'RI_' + routineId,
                        endkey       : 'RI_' + routineId + '\uffff'
                    }).then(function(result) {
                        return result.rows;
                    });
                }
                
                function uploadActivityItemsToServer(activityItems) {
                    return BackendService.postActivityItems(activityItems)
                    .then(function(result) {
                        console.log("Uploading Activity Items Successful.");
                        return result;
                    });
                }
                
                function uploadCurrentRoutine(uploadItems) {
                    return BackendService.postCurrentRoutine(routine)
                    .then(function(result) {
                        console.log("Uploading Current Routine Successful.");
                        return result;
                    });
                }
                
                function putXNewUploadDate() {
                    console.log("Putting New Upload Date in local database");
                    return evalDB.putX(uploadId, {
                        routineId  : routineId,
                        uploadDate : uploadDate,
                        progress   : progress
                    }, 'routineId', 'uploadDate', 'progress');
                }
            },
            
            /**
             * delete item picture
             *
             */
            deleteEvalItemPicture: function (item) {
            	var pictureId = "";
            	if(item.dataType == "FSCategory"){
                    pictureId = item.pictureId;
                }else if(item.dataType == "FOHCategory"){
                    pictureId = item.pictureId;
                }else if(item.dataType == "BOHCategory"){
                    pictureId = item.pictureId;
                }else if(item.dataType == "TPCategory"){
                    pictureId = item.pictureId;
                }else if(item.dataType == "DCCategory"){
            		pictureId = item.pictureId;
            	}else{
            		pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);
            	}
				return db.get(pictureId)
                .then(function(result){
                    return db.remove(pictureId, result._rev); 
                })
                .catch(function(error){
                    console.log(error);
                });
            },
			 /**
             * get picture list of an item in FS
             *
             */
            loadEvalItemPictureList: function (item) {
                console.log("item: " + item.itemId);

                var pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);
                var p = db.allDocs({
                    include_docs: true,
                    // attachments: true,
                    // descending: true,
                    startkey: pictureId,
                    endkey: pictureId + '\uffff'
                }).then(function(result) {
                    if (result.rows.length == 0) return [];

                    var data = [];

                    for (var i = 0; i < result.rows.length; i++) {
                    	var pictureItem  = {};
                    	pictureItem.doc = result.rows[i].doc;
                    	pictureItem.pictureId =  result.rows[i].id;
                    	pictureItem.dataType = "FSCategory";
                    	pictureItem.itemId = item.itemId;
                    	data.push(pictureItem);
                    }
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                });
                return p;
            },
			
            loadEvalFsItemPicture:function(pictureId,itemId,index){
            	return db.getAttachment(pictureId, itemId + '.jpeg')
                .then(function(blob){
                    var data = {};
                    data.evalImageSrc = URL.createObjectURL(blob);
                    data.index = index;
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                });	
            },
             /**
             * get picture list of an item in FOH
             *
             */
            loadEvalFOHItemPictureList: function (item) {
                console.log("item: " + item.itemId);

                var pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);
                var p = db.allDocs({
                    include_docs: true,
                    // attachments: true,
                    // descending: true,
                    startkey: pictureId,
                    endkey: pictureId + '\uffff'
                }).then(function(result) {
                    if (result.rows.length == 0) return [];

                    var data = [];

                    for (var i = 0; i < result.rows.length; i++) {
                        var pictureItem  = {};
                        pictureItem.doc = result.rows[i].doc;
                        pictureItem.pictureId =  result.rows[i].id;
                        pictureItem.dataType = "FOHCategory";
                        pictureItem.itemId = item.itemId;
                        data.push(pictureItem);
                    }
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                });
                return p;
            },
            
            loadEvalFoHItemPicture:function(pictureId,itemId,index){
                return db.getAttachment(pictureId, itemId + '.jpeg')
                .then(function(blob){
                    var data = {};
                    data.evalImageSrc = URL.createObjectURL(blob);
                    data.index = index;
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                }); 
            },

            /**
             * get picture list of an item in BOH
             *
             */
            loadEvalBOHItemPictureList: function (item) {
                console.log("item: " + item.itemId);

                var pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);
                var p = db.allDocs({
                    include_docs: true,
                    // attachments: true,
                    // descending: true,
                    startkey: pictureId,
                    endkey: pictureId + '\uffff'
                }).then(function(result) {
                    if (result.rows.length == 0) return [];

                    var data = [];

                    for (var i = 0; i < result.rows.length; i++) {
                        var pictureItem  = {};
                        pictureItem.doc = result.rows[i].doc;
                        pictureItem.pictureId =  result.rows[i].id;
                        pictureItem.dataType = "BOHCategory";
                        pictureItem.itemId = item.itemId;
                        data.push(pictureItem);
                    }
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                });
                return p;
            },
            
            loadEvalBohItemPicture:function(pictureId,itemId,index){
                return db.getAttachment(pictureId, itemId + '.jpeg')
                .then(function(blob){
                    var data = {};
                    data.evalImageSrc = URL.createObjectURL(blob);
                    data.index = index;
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                }); 
            },

            /**
             * get picture list of an item in TP
             *
             */
            loadEvalTPItemPictureList: function (item) {
                console.log("item: " + item.itemId);

                var pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);
                var p = db.allDocs({
                    include_docs: true,
                    // attachments: true,
                    // descending: true,
                    startkey: pictureId,
                    endkey: pictureId + '\uffff'
                }).then(function(result) {
                    if (result.rows.length == 0) return [];

                    var data = [];

                    for (var i = 0; i < result.rows.length; i++) {
                        var pictureItem  = {};
                        pictureItem.doc = result.rows[i].doc;
                        pictureItem.pictureId =  result.rows[i].id;
                        pictureItem.dataType = "TPCategory";
                        pictureItem.itemId = item.itemId;
                        data.push(pictureItem);
                    }
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                });
                return p;
            },
            
            loadEvalTpItemPicture:function(pictureId,itemId,index){
                return db.getAttachment(pictureId, itemId + '.jpeg')
                .then(function(blob){
                    var data = {};
                    data.evalImageSrc = URL.createObjectURL(blob);
                    data.index = index;
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                }); 
            },

            /**
             * get picture list of an item in TP
             *
             */
            loadEvalDCItemPictureList: function (item) {
                console.log("item: " + item.itemId);

                var pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);
                var p = db.allDocs({
                    include_docs: true,
                    // attachments: true,
                    // descending: true,
                    startkey: pictureId,
                    endkey: pictureId + '\uffff'
                }).then(function(result) {
                    if (result.rows.length == 0) return [];

                    var data = [];

                    for (var i = 0; i < result.rows.length; i++) {
                        var pictureItem  = {};
                        pictureItem.doc = result.rows[i].doc;
                        pictureItem.pictureId =  result.rows[i].id;
                        pictureItem.dataType = "DCCategory";
                        pictureItem.itemId = item.itemId;
                        data.push(pictureItem);
                    }
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                });
                return p;
            },
            
            loadEvalDcItemPicture:function(pictureId,itemId,index){
                return db.getAttachment(pictureId, itemId + '.jpeg')
                .then(function(blob){
                    var data = {};
                    data.evalImageSrc = URL.createObjectURL(blob);
                    data.index = index;
                    return data;
                })
                .catch(function(error){
                    console.log(error);
                }); 
            },

             /**
             * get picture of an item
             *
             */
            loadEvalItemPicture: function (item) {
                console.log("item: " + item.itemId);

                var pictureId = resolveEvalPictureId(currentRoutine._id, item.itemId);

                return db.getAttachment(pictureId, item.itemId + '.jpeg')
                .then(function(blob){
                    item.evalImageSrc = URL.createObjectURL(blob);
                    return item;
                })
                .catch(function(error){
                    console.log(error);
                });
            },

            /**
             * update food safety picklist checked
             *
             */
            updateFSPicklistChecked: function(fsQuestionItem, fsPicklistItem){
                var id = resolveEvalItemId(currentRoutine._id, fsPicklistItem.itemId);
                var checked = fsPicklistItem.checked;
                var self = this;

                return db.putX(
                    id, 
                    {
                        itemId: fsPicklistItem.itemId, 
                        checked: checked
                    },
                    "itemId", "checked"
                )
                .then(function result(){
                    /**
                     * reflect the change of picklist item to it's enclosed question,
                     * if current picklist is checked, the enclosed question answer will be "N"
                     * otherwise all the silbing picklist items will be evaluated to determine
                     * the answer of the enclosed question.
                     */
                    if(checked){
                        fsQuestionItem.answer = 'N';
                    }
                    else{
                        for(var i = 0; i < fsQuestionItem.items.length; i++){
                            if(fsQuestionItem.items[i].checked){
                                fsQuestionItem.answer = 'N';
                                return;
                            }
                        }
                        fsQuestionItem.answer = 'Y';
                    }

                    return self.updateFSQuestionAnswer(fsQuestionItem, true);
                });
            },

            /**
             * update travel path picklist checked
             *
             */
            updateTPPicklistChecked: function(tpQuestionItem, tpPicklistItem){
                var id = resolveEvalItemId(currentRoutine._id, tpPicklistItem.itemId);
                var checked = tpPicklistItem.checked;
                var self = this;

                return db.putX(
                    id, 
                    {
                        itemId: tpPicklistItem.itemId, 
                        checked: checked
                    },
                    "itemId", "checked"
                )
                .then(function result(){
                    /**
                     * reflect the change of picklist item to it's enclosed question,
                     * if current picklist is checked, the enclosed question answer will be "N"
                     * otherwise all the silbing picklist items will be evaluated to determine
                     * the answer of the enclosed question.
                     */
                    if(checked){
                        fsQuestionItem.answer = 'N';
                    }
                    else{
                        for(var i = 0; i < tpQuestionItem.items.length; i++){
                            if(tpQuestionItem.items[i].checked){
                                tpQuestionItem.answer = 'N';
                                return;
                            }
                        }
                        tpQuestionItem.answer = 'Y';
                    }

                    return self.updateTPQuestionAnswer(tpQuestionItem, true);
                });
            },

             /**
             * update dataType checks picklist checked
             *
             */

            updateRTPicklistChecked: function(rtQuestionItem, rtPicklistItem){
                var id = resolveEvalItemId(currentRoutine._id, rtPicklistItem.itemId);
                var checked = rtPicklistItem.checked;
                var self = this;

                return db.putX(
                    id, 
                    {
                        itemId: rtPicklistItem.itemId, 
                        checked: checked
                    },
                    "itemId", "checked"
                )
                .then(function result(){
                    /**
                     * reflect the change of picklist item to it's enclosed question,
                     * if current picklist is checked, the enclosed question answer will be "N"
                     * otherwise all the silbing picklist items will be evaluated to determine
                     * the answer of the enclosed question.
                     */
                    if(checked){
                        rtQuestionItem.answer = 'N';
                    }
                    else{
                        for(var i = 0; i < rtQuestionItem.items.length; i++){
                            if(rtQuestionItem.items[i].checked){
                                rtQuestionItem.answer = 'N';
                                return;
                            }
                        }
                        rtQuestionItem.answer = 'Y';
                    }

                    return self.updateRTQuestionAnswer(rtQuestionItem, true);
                });
            },

             /**
             * update Front of House picklist checked
             *
             */
            updateFOHPicklistChecked: function(fohQuestionItem, fohPicklistItem){
                var id = resolveEvalItemId(currentRoutine._id, fohPicklistItem.itemId);
                var checked = fohPicklistItem.checked;
                var self = this;

                return db.putX(
                    id, 
                    {
                        itemId: fohPicklistItem.itemId, 
                        checked: checked
                    },
                    "itemId", "checked"
                )
                .then(function result(){
                    /**
                     * reflect the change of picklist item to it's enclosed question,
                     * if current picklist is checked, the enclosed question answer will be "N"
                     * otherwise all the silbing picklist items will be evaluated to determine
                     * the answer of the enclosed question.
                     */
                    if(checked){
                        fohQuestionItem.answer = 'N';
                    }
                    else{
                        for(var i = 0; i < fohQuestionItem.items.length; i++){
                            if(fohQuestionItem.items[i].checked){
                                fohQuestionItem.answer = 'N';
                                return;
                            }
                        }
                        fohQuestionItem.answer = 'Y';
                    }

                    return self.updateTPQuestionAnswer(fohQuestionItem, true);
                });
            },

            /**
             * update Back of House picklist checked
             *
             */
            updateBOHPicklistChecked: function(bohQuestionItem, bohPicklistItem){
                var id = resolveEvalItemId(currentRoutine._id, bohPicklistItem.itemId);
                var checked = bohPicklistItem.checked;
                var self = this;

                return db.putX(
                    id, 
                    {
                        itemId: bohPicklistItem.itemId, 
                        checked: checked
                    },
                    "itemId", "checked"
                )
                .then(function result(){
                    /**
                     * reflect the change of picklist item to it's enclosed question,
                     * if current picklist is checked, the enclosed question answer will be "N"
                     * otherwise all the silbing picklist items will be evaluated to determine
                     * the answer of the enclosed question.
                     */
                    if(checked){
                        bohQuestionItem.answer = 'N';
                    }
                    else{
                        for(var i = 0; i < bohQuestionItem.items.length; i++){
                            if(bohQuestionItem.items[i].checked){
                                bohQuestionItem.answer = 'N';
                                return;
                            }
                        }
                        bohQuestionItem.answer = 'Y';
                    }

                    return self.updateBOHQuestionAnswer(bohQuestionItem, true);
                });
            },

            /**
             * update Daily Cleaning Task picklist checked
             *
             */
            updateDCPicklistChecked: function(dcQuestionItem, dcPicklistItem){
                var id = resolveEvalItemId(currentRoutine._id, dcPicklistItem.itemId);
                var checked = dcPicklistItem.checked;
                var self = this;

                return db.putX(
                    id, 
                    {
                        itemId: dcPicklistItem.itemId, 
                        checked: checked
                    },
                    "itemId", "checked"
                )
                .then(function result(){
                    /**
                     * reflect the change of picklist item to it's enclosed question,
                     * if current picklist is checked, the enclosed question answer will be "N"
                     * otherwise all the silbing picklist items will be evaluated to determine
                     * the answer of the enclosed question.
                     */
                    if(checked){
                        dcQuestionItem.answer = 'N';
                    }
                    else{
                        for(var i = 0; i < dcQuestionItem.items.length; i++){
                            if(dcQuestionItem.items[i].checked){
                                dcQuestionItem.answer = 'N';
                                return;
                            }
                        }
                        dcQuestionItem.answer = 'Y';
                    }

                    return self.updateDCQuestionAnswer(dcQuestionItem, true);
                });
            },

            /**
             * get the nearest time item that is before current time
             *
             */
        	getNowTimeItem: function(){
                var index = -1;

                for(var i = 0; i < timeItems.length; i++){
                    if(!isBeforeLocalTime(timeItems[i].desc0)){
                        index = i;
                        break;
                    }
                }

                if (index == -1 || index == 0) index = 0;
                else index = index - 1;

                return timeItems[index];
        	},

            /**
             * get progress of current activity
             *
             */
            getCurrentActivityProgress: function(){
                if (!currentActivityItem || !currentActivityItem.progress) return 0;

                return currentActivityItem.progress;
            },

            /**
             * get overall progress of the open routine
             *
             */
            getRoutineProgress: function(){
                if (!currentRoutine || !currentRoutine.progress) return 0;

                return currentRoutine.progress;
            },

            /**
             * reset current routine
             * 1. delete the eval values
             * 2. delete the eval pictures
             * 3. reset routine progress to 0
             * 4. reset these variables to null: currentRoutine, itemRoot, timeItems, currentTimeItem, currentActivityItem
             *
             */
            resetCurrentRoutine: function(){
                // return success if this is not current routine loaded
                if (!currentRoutine) {
                    return $q.when({success: true, message: 'no current routine'});
                }
                // get current routine id
                var routineId = currentRoutine._id;

                // find out all eval items
                var p1 = db.allDocs({
                    startkey: 'RI_' + routineId + "_",
                    endkey: 'RI_' + routineId + "_\uffff"
                })
                // delete eval items
                .then(function(result){
                    console.log(result);
                    // get the rows
                    var rows = result.rows;

                    // prepare docs which will be deleted, set _delete to true
                    var docsToDel = [];
                    for (var i = 0; i < rows.length; i++){
                        docsToDel.push({_id: rows[i].id, _rev: rows[i].value.rev, _deleted: true});
                    }

                    // use bulkDocs to update docs to deleted, good performance
                    return db.bulkDocs(docsToDel);
                });

                // find out all eval pictures
                var p2 = db.allDocs({
                    startkey: 'RTPIC_RI_' + routineId + "_",
                    endkey: 'RTPIC_RI_' + routineId + "_\uffff"
                })
                // delete all eval pictures
                .then(function(result){
                    console.log(result);
                    var rows = result.rows;

                    // prepare doccs to be deleted
                    var docsToDel = [];
                    for (var i = 0; i < rows.length; i++){
                        docsToDel.push({_id: rows[i].id, _rev: rows[i].value.rev, _deleted: true});
                    }
                    // batch delete pictures
                    return db.bulkDocs(docsToDel);
                });

                var self = this;

                // do p1 and p2
                return $q.all([p1, p2])
                // reset routine progress to 0
                .then(function(result){
                    currentRoutine.progress = 0;
                    db.putX(currentRoutine, "progress");
                })
                // reset memory variables
                .then(function(result){
                    // The current opened routine
                    currentRoutine = null;
                    // root of lib items
                    itemRoot = null;
                    // time items
                    timeItems = null;
                    // current time item
                    currentTimeItem = null;
                    // current activity item
                    currentActivityItem = null;

                    return {success: true};
                })
                .catch(function(error){
                    return {success: false, error:error};
                });

            }
        };

    }]);
