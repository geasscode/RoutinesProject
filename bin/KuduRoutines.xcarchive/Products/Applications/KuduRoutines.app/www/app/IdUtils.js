angular.module('epngUtils', [])

.service('IdUtils', function() {
	var seed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	/**
	 * 根据提供的前缀生成随机ID
	 *
	 * @param {String} prefix 前缀
	 * @return 生成的ID
	 */
	this.getId = function(prefix){
		var t = new Date().getTime(),
			i;

		for(i = 0; i < 4; i++){
			t += seed.charAt(Math.floor(Math.random()*26));
		}

		return prefix + t;
	}
});