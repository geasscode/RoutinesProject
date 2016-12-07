/**
 * Status Check Service
 *
 * @author
 */
(function() {
    angular.module('app.services')
           .value('activityTypes', {
                "ActivityFSCheck"  : "Food Safety Check",
                "ActivityTakeTemp" : "Quality Check",
                "ActivityTPCheck"  : "Figure 8 Travel Path",
                "ActivityFOHCheck" : "FOH Figure 8 Travel Path",
                "ActivityBOHCheck" : "BOH Figure 8 Travel Path",
                "DailyTaskCheck"   : "Daily Task Check",
                "BeefCookoutCheck" : "Cookout",
                "BeefCookouts"     : "Cookout"/*,
                "Checks"           : "Checks"*/
            })
           .service('StatusCheckService', ['activityTypes', '$q', 'DBMgr', 'RoutineService', StatusCheckService]);
           
    function StatusCheckService(activityItemTypes, $q, db, RoutineService) {
        /* * * * * * * * * * *
         *                   *
         * Public Functions  *
         *                   *
         * * * * * * * * * * */
        this.getUploadStatus      = getUploadStatus;
        this.getCategoryList      = getCategoryList;
        this.getUploadHistoryList = getUploadHistoryList;
        
        /* * * * * * * * * *
         *                 *
         * Implementation  *
         *                 *
         * * * * * * * * * */
        var evalDB               = db.getEvalDB(),
            libDB                = db.getLibDB(),
            activityItemTypeKeys = Object.keys(activityItemTypes);
        
        function getItemEval(itemId) {
            return evalDB.allDocs({
                include_docs: true
            }).then(function(evalList) {
                return evalList.find(function(activityItem) {
                    return activityItem.itemId === itemId;
                });
            });
        }
        
        function getUploadStatus() {
            var percentage = $q.reject("Error"),
                status     = $q.reject("Error");
            
            percentage = $q.when(RoutineService.getRoutineProgress());
            
            return $q.all([percentage])
            .then(function(result) {
                return {
                    percentage : result[0]
                };
            });
        }
        
        function getCategoryList() {
            var currentRoutine = RoutineService.getCurrentRoutine();

            return $q.all([
                evalDB.allDocs({
                    include_docs: true,
                    startkey: 'RI_' + currentRoutine._id,
                    endkey: 'RI_' + currentRoutine._id + '\uffff'
                }).then(function(result) {
                    console.log('query evaldb');
                    console.log(result);
                    return result.rows.map(function(evalItem) {
                        return evalItem.doc;
                    });
                }),
                libDB.allDocs({
                    include_docs: true,
                    key: "lib.MST.MST.D002716DEFED40BC.RT"
                }).then(function(result) {
                    console.log('query libdb');
                    console.log(result);
                    return result.rows[0].doc.data;
                })
            ]).then(function(result) {
                var evalList = result[0],
                    libList  = result[1];
                
                return libList.reduce(function(activitiesList, timeItem) {
                    // for each Time Item
                    return timeItem.items.reduce(function(activitiesList, activityItem) {
                        // For each activity Item Type key
                        return activityItemTypeKeys.reduce(function(activitiesList, activityItemTypeKey) {
                            var activityEvalItem,
                                activityItemCategoryList,
                                activityItemCategoryDesc,
                                isActivityItemType;
                            
                            isActivityItemType = (activityItem.dataType === activityItemTypeKey);
                                
                            if(isActivityItemType) {
                                activityEvalItem = evalList.find(function(item){
                                    return item.itemId === activityItem.itemId;
                                });
                                
                                activityItemCategoryDesc                 = activityItemTypes[activityItemTypeKey];
                                activityItemCategoryList                 = (activitiesList[activityItemCategoryDesc] || [])
                                                                           .concat([
                                                                               Object.assign({}, timeItem, {
                                                                                   items    : [activityItem],
                                                                                   evalItem : activityEvalItem
                                                                               })
                                                                           ]);
                                activitiesList[activityItemCategoryDesc] = activityItemCategoryList;
                            }
                            
                            return Object.assign({}, activitiesList);
                        }, activitiesList);
                    }, activitiesList);
                }, {});
                
                
                /*return libList.reduce(function(activities, timeItem) {
                    // For each Activity Item in each Time Item
                    timeItem.items.map(function(activityItem) {
                        
                        // For each Activity Item Type
                        activityItemTypes.map(function(activityItemType) {
                            var activityItemCategory, activityEvalItem, key$;
                            
                            // Check activity item type
                            if(activityItem.dataType === activityItemType) {
                                key$ = activityItemTypesList[activityItemType]
                                
                                // Create new Array with concatinated new item
                                activityEvalItem = evalList.find(function(Item) {
                                    return Item.itemId === activityItem.itemId;
                                });
                                
                                activityItemCategory = activities[key$] || (activities[key$] = []);
                                activityItemCategory = activityItemCategory.concat([
                                
                                    // Create new item object
                                    Object.assign({}, timeItem, {
                                        items: [activityItem],
                                        evalItem: activityEvalItem
                                    })
                                    
                                ]);
                                
                                activities[key$] = activityItemCategory;
                            }
                        });
                    });
                    
                    return Object.assign({}, activities);
                }, {});*/
            });
        }
        
        function getUploadHistoryList() {
            return $q.all([
                RoutineService.getRoutineList(),
                evalDB.allDocs({
                    include_docs: true,
                    startkey    : 'UP_',
                    endkey      : 'UP_\uffff'
                }).then(function(result) {
                    return result.rows.map(function(uploadDateItem) {
                        console.log(uploadDateItem);
                        return uploadDateItem.doc;
                    });
                })
            ]).then(function(result) {
                var routineList    = result[0],
                    uploadDateList = result[1];
                    
                console.log(uploadDateList);
                    
                return uploadDateList.reduce(function(historyList, uploadDateListItem) {    
                    return routineList.reduce(function(historyList, routineListItem) {
                    
                        var historyListDate,
                            routineListItemDate,
                            routineListItemProgress,
                            isRoutineItemUploadDate;
                        
                        isUploadDateOfRoutineListItem = (routineListItem._id === uploadDateListItem.routineId);
                        
                        if(isUploadDateOfRoutineListItem) {
                            routineListItemDate              = routineListItem.routineDate;
                            routineListUploadDate            = uploadDateListItem.uploadDate
                            routineListItemProgress          = (routineListItem.progress || 0);
                            historyListDate                  = (historyList[routineListItemDate] || [])
                                                               .concat([
                                                                   Object.assign({}, {
                                                                       date     : routineListUploadDate,
                                                                       progress : routineListItemProgress    
                                                                   })
                                                               ]);
                            historyList[routineListItemDate] = historyListDate;
                        }
                        
                        return Object.assign({}, historyList);
                    }, historyList);
                }, {});
            });
        }
    }
})();
