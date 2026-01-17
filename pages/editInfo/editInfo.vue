<template>
  <view class="main">
    <view class="form-box shadow-project card-project" style="background-color: aliceblue;">
      <view class="form-group">
        <view class="title must">姓名</view>
        <input type="text" placeholder="填写您的姓名" placeholder-class="phc" maxlength="10" v-model="nickname" style="text-align: right;">
      </view>
	  <view class="form-group">
	    <view class="title must">性别</view>
	    <picker mode="selector" :range="genderOptions" :value="genderIndex" @change="bindGenderChange">
	      <view class="picker">
	        {{ sex || '请选择性别' }}
	      </view>
	    </picker>
	  </view>
      <view class="form-group">
        <view class="title must">身高(cm)</view>
        <input type="number" placeholder="填写您的身高(cm)" placeholder-class="phc" maxlength="5" v-model="height" style="text-align: right;">
      </view>
      
      <view class="form-group">
        <view class="title must">体重(kg)</view>
        <input type="number" placeholder="填写您的体重(kg)" placeholder-class="phc" maxlength="5" v-model="weight" style="text-align: right;">
      </view>

      <view class="form-group">
        <view class="title must">出生日期</view>
        <picker mode="date" start="1900-01-01" end="2100-01-01" :value="date" @change="bindDateChange">
          <view class="picker">
            {{ date || '请选择出生日期' }}
          </view>
        </picker>
      </view>
    </view>
    <button type="primary" size="mini" @click="updateProfile">保存信息</button>
  </view>
</template>

<script>
	import { request } from "/utils/httpUtils.js";
	import {showToast} from "/utils/ui.js";
	import {formatTimestamp_} from "../../utils/dateUtil.js"
	export default {
	  data() {
		return {
		  nickname: '',
		  height: '',
		  weight: '',
		  date: '',
		  genderOptions: ['男', '女'],
		  genderIndex: -1,
		  sex: ''
		};
	  },
	  methods: {
		bindDateChange(event) {
		  this.date = event.detail.value;
		  console.log(this.date)
		},
		bindGenderChange(event) {
		    const index = event.detail.value;
		    this.genderIndex = index;
		    this.sex = this.genderOptions[index];
		},
		updateProfile(){
			let birthTime = new Date(this.date).getTime();
			let obj = {
			  method: "POST",
			  showLoading: true,
			  url:`/user/updateUserInfo`,
			  data:{
				  name:this.nickname,
				  sex:this.sex,
				  birthTime:birthTime,
				  weight:this.weight,
				  height:this.height
			  },
			  message:"正在获取数据"
			}
			request(obj).then(res=>{
				showToast("修改成功",1500)
			}).catch(err=>{
				showToast("请稍后重试！",1500)
			});
		},
		getUserInfo(){
			let obj = {
			  method: "GET",
			  showLoading: true,
			  url:`/user/getUserInfo`,
			  data:{},
			  message:"正在获取数据"
			}
			request(obj).then(res=>{
				let userInfo = res.data
				this.nickname = userInfo.name
				this.height = userInfo.height
				this.weight = userInfo.weight
				this.date = formatTimestamp_(userInfo.birthTime)
				this.sex = userInfo.sex
			}).catch(err=>{
				showToast("请稍后重试！",1500)
			});
		}
	  },
	  onLoad() {
	  	this.getUserInfo()
	  },
	  onPullDownRefresh() {
		this.getUserInfo()
	  	uni.stopPullDownRefresh()
	  },
	};
</script>

<style>
	@import "editInfo.css"
</style>
