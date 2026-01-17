<template>
	<view class="main">
		<view class="mt-5 text-grey">
		      <text class='reason_txt text-xsBlue'>{{date}}体位体动统计</text>
		</view>
		<view class="card" v-if="isLoading">
			<sleep_position_radar :proportionList="proportionList"></sleep_position_radar>
			<position_time_chart :positionTime="positionTime"></position_time_chart>
			<body_move_chart :moveExtent="moveExtent"></body_move_chart>
			<evaluate_box :diagnosis="diagnosis"></evaluate_box>
		</view>
	</view>
</template>

<script>
	import sleep_position_radar from '../../../components/position/sleep_position_radar/sleep_position_radar.vue'
	import position_time_chart from '../../../components/position/position_time_chart/position_time_chart.vue';
	import evaluate_box from '../../../components/evaluate_box/evaluate_box.vue';
	import body_move_chart from '../../../components/position/body_move_chart/body_move_chart.vue';
	import { request } from "/utils/httpUtils.js";
	import {showToast} from "/utils/ui.js";
	export default {
		components:{
			sleep_position_radar,
			position_time_chart,
			evaluate_box,
			body_move_chart
		},
		data() {
			return {
				reportId:'',
				date:'',
				diagnosis:{},
				proportionList:[],
				positionTime:{},
				moveExtent:{},
				isLoading:false
			}
		},
		methods: {
			getPositionData(){
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/position/getData`,
				  data:{
					reportId:this.reportId
				  },
				  message:"正在获取数据"
				}
				request(obj).then(res=>{
					let resData = res.data
					this.proportionList = resData.proportionList
					this.moveExtent = resData.moveExtent
					this.positionTime = resData.positionTime
					this.diagnosis.msg = resData.evaluation
					this.diagnosis.title = "体位体动"
					this.isLoading = true
				}).catch(err=>{
				  showToast("请稍后重试！",1500)
				});
			}
		},
		onLoad(getData) {
			this.reportId = getData.reportId
			this.date = getData.date
			this.getPositionData()
		}
	}
</script>

<style>
	@import "sleep_position.css"
</style>
