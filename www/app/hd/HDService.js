/**
 * Created by desmond on 4/10/15.
 */

angular.module('app.services')


    .service('HDService', ['DBMgr', 'IdUtils', '$filter', function (DBMgr, IdUtils, $filter) {

        window.DBMgr = DBMgr;
        var db = DBMgr.getDB();
        var currentHD = null;
        var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');

        function resolveHDPictureId(hd){
            return "HDPIC_" + hd._id;
        };

        return {

            searchHD: function (param) {
                console.log("searchHD...");
                return param;
            },
            /**
             * create HD
             *
             */
            createHD: function (params) {

                var hd = {
                    _id: IdUtils.getId("HD_"),
                    visitDate: $filter('date')(params.visitDate, 'yyyy-MM-dd'),
                    managerOnDuty: params.managerOnDuty,
                    grade: params.grade,
                    nextVisitDate: $filter('date')(params.nextVisitDate, 'yyyy-MM-dd'),
                    createDate: new Date(),
                    createdBy: AppModel.userId
                    //,
                    //pictureID: '',
                    //pictureData: "data:image/jpeg;base64," + params.imageData
                };

                var pictureID = resolveHDPictureId(hd);
                //hd.pictureID = pictureID;


                // 1. save HD data
                return db.put(hd)
                    .then(function (result) {
                        return db.putAttachment(pictureID, hd._id + '.jpeg', params.imageData, 'image/jpeg');
                    })
                    // 2. save HD picture
                    .then(function (result) {
                     
                        return db.get(hd._id);

                    })
                    // 3. get HD and set to current HD
                    .then(function (result) {
                        currentHD = result;
                        return currentHD;
                    });
            },


            /**
             * addViolation
             *
             */
            addViolation: function (violationParams) {
                if (!currentHD) {
                    return null;
                }
                //self = this;
                currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');

                var violation = {
                    _id: IdUtils.getId("VL_" + currentHD._id + "_"),
                    violation: violationParams.violation,
                    owner: violationParams.owner,
                    actions: violationParams.actions,
                    status: 'N',
                    dueDate: violationParams.dueDate,
                    createDate: currentDate,
                    createdBy: AppModel.userId
                };
                // save violation to DB
                var p = db.put(violation)
                    .then(function (result) {
                        console.log("Save violation successfully!");
                        return db.get(result.id);
                    });
                return p;

            },

            /**
             * updateViolationStatus
             *
             */
            updateViolationStatus: function (currentViolationId, currentStatus) {
                console.log("ready to updateViolationStatus...");
                console.log("currentViolationId: " + currentViolationId);
                console.log("currentStatus: " + currentStatus);
                //get violation by violationParams._id
                return db.putX(currentViolationId, "status", currentStatus);
            },

            /**
             * removeViolation
             *
             */
            removeViolation: function (id, rev) {
                return db.remove(id, rev);
            },

            /**
             * get HD list
             *
             */
            getHDList: function () {
                var p = db.allDocs({
                    include_docs: true,
                    startkey: 'HD_',
                    endkey: 'HD_\uffff'
                }).then(function (result) {
                    if (result.rows.length == 0) return [];

                    var data = [];

                    for (var i = 0; i < result.rows.length; i++) {
                        data.push(result.rows[i].doc)
                    }
                    return data;
                });

                return p;
            },

            /**
             * delete hd
             *
             */
            removeHD: function (item) {
                return db.remove(item._id, item._rev);
            },

            /**
             * get violation list
             *
             */
            getViolationList: function () {

                if (!currentHD) {
                    return null;
                }
                console.log("currentHDId: " + currentHD._id);
                var p = db.allDocs({
                    include_docs: true,
                    startkey: 'VL_' + currentHD._id,
                    endkey: 'VL_' + currentHD._id + '\uffff'
                }).then(function (result) {
                    if (result.rows.length == 0) return [];

                    var data = [];

                    for (var i = 0; i < result.rows.length; i++) {
                        data.push(result.rows[i].doc)
                    }
                    return data;
                });

                return p;
            },
            /**
             * get violation by id
             *
             */
            getViolation: function (violationID) {

                return db.get(violationID);
            },

            loadHD: function (hd) {
                var pictureId = resolveHDPictureId(hd);

                return db.getAttachment(pictureId, hd._id + '.jpeg')
                    .then(function(blob){
                        hd.pictureUrl = URL.createObjectURL(blob);
                        currentHD = hd;
                        console.log(currentHD);
                        return hd;
                    });
            },

            getCurrentHD: function () {
                return currentHD;
            }

        };


    }]);