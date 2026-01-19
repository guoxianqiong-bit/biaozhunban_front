<template>
	<view class="main">
	
	<!--top area begin-->
	<view class="upside upside-shadow" bindtap="url" data-url="{{user?'../edit/my_edit':'../reg/my_reg'}}">
	  <view class="user-bar">
	    <view class="detail">
	      <view class="name text-cut">欢迎您，已登录！</view>
	      <view class="desc">
	        <view class="text-cut">数智化离院医疗监测APP</view>
			<view class="text-cut">xxxxxxxxxxx开发</view>
	      </view>
	    </view>
	    <view class="avatar">
	    <view style="border: none; padding-top: 20rpx;" plain="true">
	      <!-- <image mode="aspectFit" src="../../static/images/logo/ynu1.jpg" /> -->
		  <!-- <image mode="aspectFit" src="https://tse3-mm.cn.bing.net/th/id/OIP-C.MInBt74HdmHZmJz4cvyCuwHaHa?w=198&h=197&c=7&r=0&o=5&dpr=2&pid=1.7" /> -->
	    </view>
	    </view>
	  </view>
	</view>
	
	<view wx:if="{{isLogin}}" class="down padding-project">
		
	  <view class="comm-list menu card-project shadow-project">
		  
		  <view class="item arrow" @click="url(`/pages/purchase/purchase`)">
			<view class="content">
			  <text class="icon-activity my-icon-project text-red"></text>
			  <text class="text-black">套餐购买</text>
			</view>
		  </view>
		  
		  <view class="item arrow" bindtap="url">
		    <view class="content">
		      <text class="icon-footprint my-icon-project text-green"></text>
		      <text class="text-black">充值记录</text>
		    </view>
		  </view>
		  	
		  <view class="item arrow" @click="url(`/pages/monitor_record/monitor_record`)">
		    <view class="content">
		      <text class="icon-squarecheck my-icon-project text-project"></text>
		      <text class="text-black">监测记录</text>
		    </view>
		  </view>
		  
	    <view class="item arrow" @click="url(`/pages/editInfo/editInfo`)">
	      <view class="content">
	        <text class="icon-edit my-icon-project text-cyan"></text>
	        <text class="text-black">完善个人信息</text>
	      </view>
	    </view>
	
	    <!-- <view class="item arrow" bindtap="url">
	      <view class="content">
	        <text class="icon-favor my-icon-project text-green"></text>
	        <text class="text-black">待补充</text>
	      </view>
	    </view> -->
		
	  </view>
	
	  <view class="comm-list menu card-project shadow-project">
		  
		  <view class="item arrow" @click="url(`/pages/updatePwd/updatePwd`)">
		    <view class="content">
		      <text class="icon-lock my-icon-project text-blue"></text>
		      <text class="text-black">修改密码</text>
		    </view>
		  </view>
	
	    <view class="item arrow" bindtap="url" data-url="../../about/index/about_index?key=SETUP_CONTENT_ABOUT">
	      <view class="content">
	        <text class="icon-service my-icon-project text-purple"></text>
	        <text class="text-black">关于我们</text>
	      </view>
	    </view>
		<view class="item arrow" @click="url(`/pages/version/version`)">
		      <view class="content">
		        <text class="icon-refresh my-icon-project text-orange"></text>
		        <text class="text-black">版本切换</text>
		      </view>
		      <view class="action">
		         <text class="text-grey text-sm">{{ appVersionName }}</text>
		      </view>
		    </view>
	    <view class="item arrow" @click="bindSetTap">
	      <view class="content">
	        <text class="icon-settings my-icon-project text-grey"></text>
	        <text class="text-black">设置</text>
	      </view>
	    </view>
	
	  </view>
	  <!--sys end -->
	
	</view>
	<!--down area end-->
	
	</view>
</template>

<script>
	import { showToast,showLoading,hideLoading } from "/utils/ui.js";
	export default {
		data() {
			return {
				isLogin:true,
				session: null ,// 存储 ONNX 模型的会话对象
				appVersionName: '标准版' // 用于显示当前状态
			}
		},
		onShow() {
		    // 每次进入页面更新显示的文字
		    const ver = uni.getStorageSync('APP_VERSION_MODE');
		    this.appVersionName = (ver === 'COMMUNITY') ? '社区版' : '标准版';
		  },
		methods: {
			url(url){
				uni.navigateTo({
					url:url
				})
			},
			bindSetTap(){
				let itemList = ['清除缓存', '退出登录'];
				wx.showActionSheet({
					itemList,
					success: async res => {
						let idx = res.tapIndex;
						if (idx == 0) {
							// 获取token和isLogin
							let token = uni.getStorageSync('token');
							let isLogin = uni.getStorageSync('isLogin');
							
							// 清除所有缓存
							uni.clearStorageSync();
			
							// 重新保存token和isLogin
							uni.setStorageSync('token', token);
							uni.setStorageSync('isLogin', isLogin);
			
							// 显示清除成功提示
							uni.showToast({
								title: '缓存清除成功', 
								icon: 'none'
							});
						}
						if (idx == 1) {
							uni.removeStorageSync('token');
							uni.removeStorageSync('isLogin');
							uni.reLaunch({
								url:"/pages/login/login"
							})
							uni.showToast({
								title: '退出登录成功', icon: 'none'
							})
						}
					},
					fail: function (res) {
						
					}
				})
			},
		},
		onLoad() {
			
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
		},
	}
</script>

<style>
	@import url("my.css");
</style>