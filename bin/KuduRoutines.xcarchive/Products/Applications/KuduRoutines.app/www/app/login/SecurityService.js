/**
 * Created by desmond on 6/16/15.
 */

angular.module('app.services')
.service('SecurityService', ['$filter', '$http', '$q','$state', 'appConstant', 'md5', function ($filter, $http, $q,$state, appConstant, md5) {
    //var lastLoginUser = {};
    var currentUser = {
        'userId': '',
        'password': '',
        'token': '',
        'firstName':'',
        'lastName':'',
        'remembered': false
    };

    var getLastUser = function () {
        var ss = localStorage.getItem('lastLoginUser');
        if(null == ss){
            return null;
        }
        var lastLoginUser = JSON.parse(localStorage.getItem('lastLoginUser'));
        lastLoginUser = lastLoginUser || currentUser;
        return lastLoginUser;
    };

    var login = function (user) {
        var encryptedPassword, rememberUser = getLastUser();
        if(!user.passwordEncrypted || rememberUser&&rememberUser.password != user.password){
            encryptedPassword = md5.createHash(user.password + '{' + user.userId.toLowerCase() + '}');
        }else{
            encryptedPassword = user.password;
            //如果和上次登录的userId一样，且有token，无需再用password登录
            //if(rememberUser.token && null != rememberUser.token && user.userId == rememberUser.userId){
            //    return $q.when(1).then(function(){
            //        $http.defaults.headers.common[appConstant.tokenVar.TOKEN_NAME] = rememberUser.token;
            //        return rememberUser;
            //    });
            //}
        }
        var url = appConstant.baseUrl + 'app/login';
        var currUser = {
            userId: user.userId,
            password: encryptedPassword
        };
        //var url = appConstant.baseUrl + 'controller/security/mobileAppLogin?userId=tts.demo&password=bfb28530bddbe75872a6835fbe8967ed';
        delete $http.defaults.headers.common[appConstant.tokenVar.TOKEN_NAME];

        console.log(currUser);

        return $http.post(url, currUser)
            .then(function (userAccess) {

                if(!userAccess.data || userAccess.data.length == 0){
                    var rejection = "login fail!";
                    return $q.reject(rejection);
                }
                currentUser.userId = user.userId;
                currentUser.password = encryptedPassword;

                currentUser.token = userAccess.data.token;
                currentUser.remembered = user.remembered;
                currentUser.passwordEncrypted = true;
                currentUser.firstName = userAccess.data.firstName;
                currentUser.lastName = userAccess.data.lastName;
                currentUser.roles = userAccess.data.roles;
                currentUser.algined = false;
                currentUser.isCSR = false;
                currentUser.commonRole ='';
                currentUser.cipNeed = userAccess.data.cipNeed;
                for(var i=0;i<currentUser.roles.length;i++){
                    if('ROLE_CSR' == currentUser.roles[i]){
                        currentUser.isCSR = true;
                        if(currentUser.roles.length >1){
                            currentUser.algined = true;
                        }
                    }else{
                        currentUser.commonRole =currentUser.roles[i];
                    }
                }
                $http.defaults.headers.common[appConstant.tokenVar.TOKEN_NAME] = currentUser.token;
                //localStorage.clear();
                localStorage.setItem("lastLoginUser", JSON.stringify(currentUser));
                localStorage.setItem("isRemembereUser", JSON.stringify(currentUser.remembered));
                //localStorage.setItem("lastLoginUser", currentUser);
                return currentUser;
            })

            .catch(function (data) {
                //if (data.status === 401 || data.status === 403 || data.status === 404) {
                //}
                return $q.reject(data);
            });
    };

    var logout = function () {
        delete $http.defaults.headers.common[appConstant.tokenVar.TOKEN_NAME];
        delete this.user.token;//去掉token

        //localStorage.setItem("lastLoginUser", JSON.stringify(this.user));
        this.user ={
            'userId': '',
            'password': '',
            'token': '',
            'firstName':'',
            'lastName':'',
            'remembered': false
        };
        console.log(this.user);
        this.user.passwordEncrypted = false;
        //localStorage.clear();
        localStorage.removeItem('lastLoginUser');
        $state.go('login');
    }
    var forgotPassword = function(userId){
        return $http.get(appConstant.baseUrl+'app/forgotPassword',{
            params:{
                userId:userId,
            }
        });
    }

    this.user = currentUser;
    this.login = login;
    this.logout = logout;
    this.getLastUser = getLastUser;
    this.forgotPassword = forgotPassword;
}]);
