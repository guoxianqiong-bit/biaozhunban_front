<template>
	<view class="main">
		<view class="mt-5 text-grey">
			<text class='reason_txt text-xsBlue'>{{date}}鼾声情况分析</text>
		</view>
		<view class="card">
			<snore_analysis_chart :snoreInfo="snoreInfo"></snore_analysis_chart>
			<snore_time_chart :snoreTime="snoreTime" v-if="flag"></snore_time_chart>
			<evaluate_box :diagnosis="diagnosis"></evaluate_box>
		</view>
	</view>
</template>

<script>
	import evaluate_box from '../../../components/evaluate_box/evaluate_box.vue'
	import snore_analysis_chart from '../../../components/snore/snore_analysis_chart/snore_analysis_chart.vue'
	import snore_time_chart from '../../../components/snore/snore_time_chart/snore_time_chart.vue'
	import {
		request
	} from "/utils/httpUtils.js";
	import {showToast} from "/utils/ui.js";

	export default {
		components: {
			snore_analysis_chart,
			snore_time_chart,
			evaluate_box
		},
		data() {
			return {
				reportId: '',
				date: '',
				diagnosis: {},
				snoreInfo: {},
				snoreTime: {},
				flag:false
			}
		},
		methods: {
			getSnoreData() {
				let obj = {
					method: "GET",
					showLoading: true,
					url: `/snore/getData`,
					data: {
						reportId: this.reportId
					},
					message: "正在获取数据"
				}
				request(obj).then(res => {
					let resData = res.data
					this.flag = true
					this.snoreInfo = resData.snoreInfo
					this.snoreTime = resData.snoreTime
					this.diagnosis.msg = resData.evaluation
					this.diagnosis.title = "鼾声"
					this.isLoading = true
				}).catch(err => {
					showToast("请稍后重试！", 1500)
				});
				
			}
		},
		// onLoad(getData) {
		// 	this.reportId = getData.reportId
		// 	this.date = getData.date
		// 	this.getSnoreData()
		// }
		onLoad(getData) {
		    this.reportId = getData.reportId
		    this.date = getData.date
		    // console.log('初始的snoreTime值:', this.snoreTime); // 打印初始的snoreTime值
		    this.getSnoreData()
		}
	}
</script>

<style>
	@import "snore_detail.css";
</style>