/**
 * Status Check Service
 *
 * @author
 */
(function() {
    angular.module('app.controllers')
           .service('StatusCheckService', ['$q', 'DBMgr', StatusCheckService]);
           
    function StatusCheckService($q, db) {
        var evalDB = db.getEvalDB();
        var libDB = db.getLibDB();
        var activityItemTypesList = {
            "ActivityFSCheck": "Food Safety Check",
            "ActivityTakeTemp": "Quality Check",
            "ActivityTPCheck": "Figure 8 Travel Path",
            "ActivityFOHCheck": "FOH Figure 8 Travel Path",
            "ActivityBOHCheck": "BOH Figure 8 Travel Path",
            "DailyTaskCheck": "Daily Task Check",
            "BeefCookoutCheck": "Cookout",
            "BeefCookouts": "Cookout"/*,
            "Checks": "Checks"*/
        };
        
        this.getCategoryList = getCategoryList;
        this.getUploadStatus = function() {};
        this.getHistory = function() {};
        
        
        
        function getItemEval(itemId) {
            return evalDB.allDocs({
                include_docs: true
            }).then(function(evalList) {
                return evalList.find(function(activityItem) {
                    return activityItem.itemId === itemId;
                });
            });
        }
        
        function getCategoryList() {
            return $q.all([
                evalDB.allDocs({
                    include_docs: true
                })
                .then(function(result) {
                    console.log('query evaldb');
                    console.log(result);
                    return result.rows.map(function(evalItem) {
                        return evalItem.doc;
                    });
                }),
                libDB.allDocs({
                    include_docs: true,
                    key: "lib.MST.MST.D002716DEFED40BC.RT"
                })
                .then(function(result) {
                    console.log('query libdb');
                    console.log(result);
                    return result.rows[0].doc.data;
                })
            ])
            .then(function(result) {
                var evalList = result[0];
                var libList = result[1];
                
                return libList.reduce(function(result, timeItem) {
                    var activities, activityItemTypes;
                    
                    activities = result;
                    activityItemTypes = Object.keys(activityItemTypesList);
                    
                    // For each time item
                    timeItem.items.map(function(activityItem) {
                        
                        // For each Activity Item Type
                        activityItemTypes.map(function(activityItemType) {
                            var activityItemCategory, key$;
                            
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
                }, {});
            });
        }
    }
})();
