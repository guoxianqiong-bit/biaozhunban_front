import {
	showToast,
	showLoading,
	hideLoading 
} from "/utils/ui.js"
// const BASE_URL = 'http://42.193.14.241:9999';
// const BASE_URL = 'http://127.0.0.1:9999';
// const BASE_URL = "http://132.232.152.65:9999"
   // const BASE_URL = 'http://192.168.31.219:9998';
   // const BASE_URL ='http://42.193.14.241:21611';
   const BASE_URL = 'http://10.141.129.242:9999';


/**
 * 网络请求request
 * obj.data 请求接口需要传递的数据
 * obj.showLoading 控制是否显示加载Loading 默认为false不显示
 * obj.contentType 默认为 application/json
 * obj.method 请求的方法  默认为GET
 * obj.url 请求的接口路径 
 * obj.message 加载数据提示语
 */
export const request = function(obj) { 
	return new Promise(function(resolve, reject) {
		if (obj.showLoading) {
			showLoading(obj.message ? obj.message : '加载中...');
		}
		var data = {};
		if (obj.data) {
			data = obj.data;
		}
		var contentType = 'application/json';
		if (obj.contentType) {
			contentType = obj.contentType;
		}
		var method = 'GET';
		if (obj.method) {
			method = obj.method;
		}
		uni.request({
			url: BASE_URL + obj.url,
			data: data,
			method: method,
			//添加请求头
			header: {
				'Content-Type': contentType,
				'token': uni.getStorageSync('token') //获取保存的token
			},
			//请求成功
			success: function(res) {
				console.log("📌 [httpUtils] 请求成功 =", res);
				res = res.data
				if (res.code == 200) {
					resolve(res);
				} else if (res.code == 401) { //授权失效
					reject("登录已过期");
					// jumpToLogin();//跳转到登录页
				} else {
					//请求失败
					reject(res.msg)
				}
			},
			fail: function(err) {
				console.error("❌ [httpUtils] 请求失败 =", err, "url =", BASE_URL + obj.url);
				reject("服务器连接异常，请检查网络再试");
			},
			complete: function() {
				if (obj.showLoading) {
					hideLoading();
				}
			}
		})
	});
}


//跳转到登录页
function jumpToLogin() {
	wx.reLaunch({
		url: '/pages/login/login',
	})
}