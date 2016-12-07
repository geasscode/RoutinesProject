angular.module('app.services')
    .service('ShiftNotesService', ['DBMgr', 'IdUtils', function (DBMgr, IdUtils) {
        var db = DBMgr.getDB();

        this.saveShiftNotes = function(shiftnote){
            shiftnote._id = IdUtils.getId('NT_');
            console.log(shiftnote);

            db.put(shiftnote).then(function(data){
                console.log(data);
            }).catch(function(err){
                console.log(err);
            });
        }

        this.getDocById = function(id){
            db.get(id).then(function(doc){
                return doc;
            });
        }

        this.getShiftNotes = function(){
            return db.allDocs({
                include_docs: true,
                startkey: "NT_",
                endkey: "NT_\uffff"
            });
        };

        this.deleteDoc = function(id){
            db.get(id).then(function(doc){
                return db.remove(doc);
            });
        };
    }])
