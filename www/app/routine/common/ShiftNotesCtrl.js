angular.module('app.controllers')
    .controller('shiftNotesCtrl', ['$scope', '$state', '$stateParams', 'ShiftNotesService', '$ionicPopup', function ($scope, $state, $stateParams, ShiftNotesService, $ionicPopup) {

    	$scope.shiftnotes = [];
        $scope.isVisible = false;
		//get notes
    	// ShiftNotesService.getShiftNotes().then(function(data){
	    //     $scope.shiftnotes = data.rows.map(function(row){
	    //         return row.doc;
	    //     });
	    //     console.log($scope.shiftnotes);
	    // }).catch(function(err){
	    //     console.log(err);
	    // });
        ShiftNotesService.getShiftNotes().then(function(data){
            $scope.shiftnotes = data.rows.map(function(row){
                return row.doc;
            })
        }).catch(function(err){
            console.log(err);
        })

        $scope._id = ""
            $scope.shiftnote = {
                type:'',
                content:'',
            };

        $scope.showAdd = function(){
            $scope.isVisible = true;
        }

        $scope.saveShiftNotes = function(shiftnote){
            if(shiftnote.content === ""){
                $ionicPopup.alert({
                    title: 'Error',
                    template: 'Please add your note first.'
                })
            }else{
                ShiftNotesService.saveShiftNotes(shiftnote);
                $scope.shiftnote = {
                    type:'',
                    content:'',
                };
                $scope.shiftnotes.push(shiftnote);
                $scope.isVisible = false;
            }
        }

        $scope.deleteNote = function(index,id){
            $scope.index = {value:index};
            console.log(id);
            console.log(index);
            ShiftNotesService.deleteDoc(id);
            $scope.shiftnotes.splice(index,1);
            /*$scope.popoverAppt.hide();*/
        }
	}])
