<template>
	<view class="main">
		<view class="mt-5 text-grey">
		      <text class='reason_txt text-xsBlue'>{{date}}心率与血氧统计</text>
		</view>
		<view class="card" v-if="isLoadingHeart && isLoadingOxygen">
			<heart_rate_analysis :overnightHeart="overnightHeart"></heart_rate_analysis>
			<heart_rate_period :awake="awake" :deepSleep="deepSleep" :lightSleep="lightSleep" :rem="rem"> </heart_rate_period>
			<heart_rate_time :startTimestamp="heartTime.startTime" :heartRateData="heartTime.heartValues"></heart_rate_time>
			<blood_oxygen_time :startTimestamp="bloodOxygenObj.startTime" :oxygenData="bloodOxygenObj.oxygenValues" :heartRateData="heartTime.heartValues"></blood_oxygen_time>
			<evaluate_box :diagnosis="diagnosis"></evaluate_box>
		</view>
	</view>
</template>

<script>
	import heart_rate_analysis from '../../../components/heart/heart_rate_analysis/heart_rate_analysis.vue'
	import heart_rate_period from '../../../components/heart/heart_rate_period/heart_rate_period.vue'
	import heart_rate_time from '../../../components/heart/heart_rate_time/heart_rate_time.vue'
	import blood_oxygen_time from '../../../components/blood_oxygen_time/blood_oxygen_time.vue'
	import evaluate_box from '../../../components/evaluate_box/evaluate_box.vue'
	import { request } from "/utils/httpUtils.js";
	import {showToast} from "/utils/ui.js";
	export default {
		components:{
			heart_rate_analysis,
			heart_rate_period,
			heart_rate_time,
			blood_oxygen_time,
			evaluate_box
		},
		data() {
			return {
				reportId:'',
				date:'',
				diagnosis:{},
				overnightHeart:{},
				awake:{},
				deepSleep:{},
				lightSleep:{},
				rem:{},
				heartTime:{},
				isLoadingHeart:false,
				isLoadingOxygen:false,
				startTimestamp: '',
				heartRateData: [],
				bloodOxygenObj:{}
			}
		},
		methods: {
			getHeartData(){
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/heart/getData`,
				  data:{
					reportId:this.reportId
				  },
				  message:"正在获取数据"
				}
				request(obj).then(res=>{
					let resData = res.data
					this.overnightHeart = resData.overnightHeart
					this.awake = resData.awake
					this.deepSleep = resData.deepSleep
					this.lightSleep = resData.lightSleep
					this.rem = resData.rem
					this.heartTime = resData.heartTime
					this.diagnosis.msg = resData.evaluation
					this.diagnosis.title = "心率"
					this.isLoadingHeart = true
				}).catch(err=>{
				  showToast("请稍后重试！",1500)
				});
			},
			getOxygenData() {			
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/oxygen/getData`,
				  data:{
					reportId:this.reportId
				  },
				  message:"正在获取数据"
				}
				request(obj).then(res=>{
					let resData = res.data
					this.bloodOxygenObj = resData
					this.isLoadingOxygen = true
				}).catch(err=>{
				  showToast("请稍后重试！",1500)
				});
			}
		},
		onLoad(getData) {
			this.reportId = getData.reportId
			this.date = getData.date
			this.getOxygenData()
			this.getHeartData()
		}
	}
</script>

<style>
	@import "heart_rate.css";
</style>
