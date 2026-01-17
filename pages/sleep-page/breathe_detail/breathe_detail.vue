<template>
	<view class="main">
		<view class="mt-5 text-grey">
			<text class='reason_txt text-xsBlue'>{{date}}呼吸统计</text>
		</view>
		<view class="card" v-if="isLoadingBreathe && isLoadingOxygen && isLoadingHeart">
			<!-- <breathe_analysis :breatheStop="breatheStop"></breathe_analysis> -->
			<!-- <breathe_stop_time :breatheStopTime="breatheStopTime"></breathe_stop_time> -->
			<breathe_sort :breatheStopTime="breatheStopTime"></breathe_sort>
			<blood_oxygen_time :startTimestamp="bloodOxygenObj.startTime" :oxygenData="bloodOxygenObj.oxygenValues" :heartRateData="heartTime.heartValues"></blood_oxygen_time>
			<breathe_ahi :ahi="ahi"></breathe_ahi>
			<evaluate_box :diagnosis="diagnosis"></evaluate_box>
		</view>
	</view>
</template>

<script>
	import breathe_ahi from '../../../components/breathe/breathe_ahi/breathe_ahi.vue'
	// import breathe_analysis from '../../../components/breathe/breathe_analysis/breathe_analysis.vue'
	// import breathe_stop_time from '../../../components/breathe/breathe_stop_time/breathe_stop_time.vue'
	import breathe_sort from '../../../components/breathe/breathe_sort/breathe_sort.vue'
	import evaluate_box from '../../../components/evaluate_box/evaluate_box.vue'
	import blood_oxygen_time from '../../../components/blood_oxygen_time/blood_oxygen_time.vue'
	import {
		request
	} from "/utils/httpUtils.js";
	import {
		showToast
	} from "/utils/ui.js";
	export default {
		components: {
			breathe_ahi,
			breathe_sort,
			blood_oxygen_time,
			evaluate_box
		},
		data() {
			return {
				reportId: '',
				date: '',
				diagnosis: {},
				ahi: 0,
				breatheStop: {},
				breatheStopTime: {},
				startTimestamp: '',
				oxygenData: [],
				isLoadingBreathe: false,
				isLoadingOxygen:false,
				isLoadingHeart:false,
				bloodOxygenObj:{}
			}
		},
		methods: {
			getBreatheData() {
				let obj = {
					method: "GET",
					showLoading: true,
					url: `/breathe/getData`,
					data: {
						reportId: this.reportId
					},
					message: "正在获取数据"
				}
				request(obj).then(res => {
					let resData = res.data
					this.ahi = resData.ahi
					// this.breatheStop = resData.breatheStop
					this.breatheStopTime = resData.breatheStopTime
					this.diagnosis.msg = resData.evaluation
					this.diagnosis.title = "呼吸"
					this.isLoadingBreathe = true
				}).catch(err => {
					showToast("请稍后重试！", 1500)
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
			},
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
					this.heartTime = resData.heartTime
					this.isLoadingHeart = true
				}).catch(err=>{
				  showToast("请稍后重试！",1500)
				});
			},
		},
		onLoad(getData) {
			this.reportId = getData.reportId
			this.date = getData.date
			this.getOxygenData()
			this.getHeartData()
			this.getBreatheData()
		}
	}
</script>

<style>
	@import "breathe_detail.css";
</style>