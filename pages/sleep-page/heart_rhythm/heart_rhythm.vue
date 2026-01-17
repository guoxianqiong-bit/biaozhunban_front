<template>
	<view class="main">
		<view class="mt-5 text-grey">
		      <text class='reason_txt text-xsBlue'>{{date}}心律情况统计</text>
		</view>
		<view class="card" v-if="isLoading">
			<rhythm_proportion :proportionList="proportionList"></rhythm_proportion>
			<rhythm_time :heartRhythmTime="heartRhythmTime"></rhythm_time>
			<heart_rhythm_aami></heart_rhythm_aami>
			<evaluate_box :diagnosis="diagnosis"></evaluate_box>
		</view>
	</view>
</template>

<script>
	import rhythm_proportion from "../../../components/heart_rhythm/rhythm_proportion/rhythm_proportion.vue"
	import rhythm_time from '../../../components/heart_rhythm/rhythm_time/rhythm_time.vue'
	import heart_rhythm_aami from '../../../components/heart_rhythm/heart_rhythm_aami/heart_rhythm_aami.vue'
	import evaluate_box from '../../../components/evaluate_box/evaluate_box.vue'
	import { request } from "/utils/httpUtils.js";
	import {showToast} from "/utils/ui.js";
	export default {
		components:{
			rhythm_proportion,
			rhythm_time,
			heart_rhythm_aami,
			evaluate_box
		},
		data() {
			return {
				reportId:'',
				date:'',
				diagnosis:{},
				proportionList:[],
				heartRhythmTime:{},
				isLoading:false
			}
		},
		methods: {
			getRhythmData(){
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/heart/getRhythmData`,
				  data:{
					reportId:this.reportId
				  },
				  message:"正在获取数据"
				}
				request(obj).then(res=>{
					let resData = res.data
					this.proportionList = resData.proportionList
					this.heartRhythmTime = resData.heartRhythmTime
					this.diagnosis.msg = resData.evaluation
					this.diagnosis.title = "心律情况"
					this.isLoading = true
				}).catch(err=>{
				  showToast("请稍后重试！",1500)
				});
			}
		},
		onLoad(getData) {
			this.reportId = getData.reportId
			this.date = getData.date
			this.getRhythmData()
		}
	}
</script>

<style>
	@import "heart_rhythm.css"
</style>
