<template>
	<view class="content">
	  <view class="top">
	  <text class="topic">患者经整夜呼吸睡眠发现:</text>
	  <text class="text-css">1、睡眠分期:{{diagnosis.stateStatistics}}</text>
	  <text class="text-css">2、呼吸及相关事件:{{diagnosis.breatheStatistics}}</text>
	  </view>
	  <view class="bottom">
	  <text class="topic">综上,建议:</text>
	  <view v-for="item in suggestion">
	  	<text>{{item}}</text>
	  </view>
	  </view>
	  <view class="doctor">
	    <view class="text-container">
	      <text>医生：{{doctorName}}</text>
	      <text>日期：{{date}}</text>
	    </view>
	  </view>
	</view>
</template>

<script>
	import { formatTimestamp } from '../../utils/dateUtil';
	import {request} from "../../utils/httpUtils";
	import {showToast} from "../../utils/ui";
	export default {
		name:"final_diagnosis",
		props: {
		    diagnosis: {
		      type: Object,
		      default: () => ({})
		    }
		},
		data() {
			return {
				suggestion:[],
				date:'',
				doctorName:''
			};
		},
		methods:{
			dataProcess(){
				this.suggestion = this.diagnosis.diagnosis.split(/\d+、/).filter(item => item.trim().length > 0);
				this.suggestion = this.suggestion.map((item, index) => `${index + 1}、${item.trim()}`);
				this.date = formatTimestamp(this.diagnosis.diagnosisTimestamp)
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/doctor/getName`,
				  data:{
					doctorId:this.diagnosis.doctorId
				  },
				  message:"正在获取数据"
				}
				request(obj).then(res=>{
					this.doctorName = res.data
				}).catch(err=>{
				  showToast("医生姓名获取失败！",1500)
				});
			}
		},
		mounted() {
			this.dataProcess()
		}
	}
</script>

<style>
	@import "final_diagnosis.css"
</style>