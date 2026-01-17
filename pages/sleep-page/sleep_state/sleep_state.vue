<template>
	<view class="main">
		<view class="mt-5 text-grey">
		      <text class='reason_txt text-xsBlue'>{{date}}睡眠状态统计</text>
		</view>
		<view class="card" v-if="isLoading">
			<sleep_proportion :proportionList="proportionList"></sleep_proportion>
			<sleep_analysis :stateInfo="stateInfo"> </sleep_analysis>
			<sleep_time :stateTime="stateTime"></sleep_time>
			<evaluate_box :diagnosis="diagnosis"></evaluate_box>
		</view>
	</view>
</template>

<script>
	import sleep_analysis from '../../../components/sleep_state/sleep_analysis/sleep_analysis.vue'
	import sleep_proportion from '../../../components/sleep_state/sleep_proportion/sleep_proportion.vue'
	import sleep_time from '../../../components/sleep_state/sleep_time/sleep_time.vue'
	import evaluate_box from '../../../components/evaluate_box/evaluate_box.vue'
	import { request } from "/utils/httpUtils.js";
	import {showToast} from "/utils/ui.js";
	export default {
		components:{
			sleep_analysis,
			sleep_proportion,
			sleep_time,
			evaluate_box
		},
		data() {
			return {
				reportId:'',
				date:'',
				diagnosis:{},
				proportionList:[],
				stateTime:{},
				stateInfo:{},
				isLoading:false
			}
		},
		methods: {
			getStateData(){
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/state/getData`,
				  data:{
					reportId:this.reportId
				  },
				  message:"正在获取数据"
				}
				request(obj).then(res=>{
					let resData = res.data
					this.proportionList = resData.proportionList
					this.stateInfo = resData.stateInfo
					this.stateTime = resData.stateTime
					this.diagnosis.msg = resData.evaluation
					this.diagnosis.title = "睡眠状态"
					this.isLoading = true
				}).catch(err=>{
				  showToast("请稍后重试！",1500)
				});
			}
		},
		onLoad(getData) {
			this.reportId = getData.reportId
			this.date = getData.date
			this.getStateData()
		}
	}
</script>

<style>
	@import "sleep_state.css";
</style>
