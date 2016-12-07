angular.module('epngMockup', [])

// 作为制造假数据使用的
.service('MockupService', ['$q', '$timeout',function($q, $timeout) {
	/**
	 * 为 service 制造一个假的 promise 用于做测试
	 * @param  {[type]}  successResult ：promise.success 内 fn 调用的结果。（模拟后端返回的数据）
	 * @param  {[type]}  errorResult   ：promise.error 内 fn 调用的结果。（模拟后端返回的数据）
	 * @param  {Boolean} isSuccess     这次模拟设置 success 还是 error
	 * @param  {[type]}  delay         这次请求延迟多久才执行
	 * @return {[type]}                返回一个 promise
	 */
	this.makePromise = function(successResult, errorResult, isSuccess, delay){
        // 创建一个 promise
        var deferred = $q.defer(),
            promise = deferred.promise;

        // 允许在 deferred 处理之前 cancel 掉
        promise._cancel = function(){
            this._cancelled = true;
        };
        // 定义 promise 的 success function
        promise.success = function(fn){
            promise.then(fn);
            return promise;
        };
        // 定义 promise 的 error function
        promise.error = function(fn){
            promise.then(null, fn);
            return promise;
        };

        if (!deferred.promise._cancelled) {
        	// 格式化延迟时间
        	var delay = angular.isNumber(delay)?delay:0;
        	// 如果 isSuccess 为 true ，那么则模拟成功, 否则模拟失败
        	if (isSuccess) {
        		$timeout(function(){
        			deferred.resolve(successResult);
        		}, delay);
        	}
        	else {
        		$timeout(function(){
        			deferred.reject(errorResult);
        		}, delay);
        	};
        };

        // 返回 promise 做链式调用
        return promise;

	};
}]);
