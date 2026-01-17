<template>
	<view class="main">

		<view class="report-header">
		  <text class="report-title">慢阻肺（COPD）监测报告</text>
		  <view class="report-base-info">
		    <text class="info-item">监测日期：{{ date }}</text>
		    <text class="info-item">患者姓名：{{ name }}</text>
		    <text class="info-item">报告编号：COPD-{{dateCompact}}-{{ reportId }}</text>
		  </view>
		</view>

		<view v-if="isLoadingCOPD" class="card">
			
			<blood_oxygen :oxygen="oxygen" :oxygenAdivce="oxygenAdivce"/>
			<ecg_info :yScale="0.02" :xScale="0.5" :heartRate="heartRate" :ecgReportData="ecgReportData" :ecgAdivce="ecgAdivce"></ecg_info>
			<resp :yScale="0.002" :respReportData="respReportData" :respRate="respRate" :respAdivce="respAdivce"></resp>
			<copd_info :samplingData="samplingData" :frequency="frequency" :flowAdivce="flowAdivce"/>
			<advice :allAdivce="allAdivce"></advice>

			<!-- <breathe_wave :waveData="samplingData" :frequency="frequency" /> -->
		</view>
	</view>
</template>

<script>
	import {
		request
	} from "/utils/httpUtils.js";
	import {
		showToast
	} from "/utils/ui.js";
	import copd_info from '../../../components/copd/copd_info/copd_info.vue';
	import blood_oxygen from '../../../components/copd/blood_oxygen/blood_oxygen.vue';
	import breathe_wave from '../../../components/copd/breathe_wave/breathe_wave.vue';
	import ecg_info from '../../../components/copd/ECG/ecg_info.vue';
	import resp from '../../../components/copd/RESP/resp.vue';
	import advice from '../../../components/copd/advice/advice.vue';

	import {getCopdReport,getEcgData,getRespData} from "@/api/copdReport/copdReport.js"
	import {
		ossBuckets
	} from "@/utils/constants";

	export default {
		components: {
			copd_info,
			blood_oxygen,
			breathe_wave,
			ecg_info,
			resp,
			advice
		},
		data() {
			return {
				reportId: '',
				date: '',
				dateCompact: '',
				name:'',
				heartRate:'',
				respRate:'',
				oxygen: '',
				samplingData: '',
				frequency: 200,
				isLoadingCOPD: false,

				ecgReportData:[], //获取心电记录数据
				respReportData:[], //获取呼吸记录数据
				
				oxygenAdivce:[], //获取大模型报告建议
				ecgAdivce:[], 
				respAdivce:[], 
				flowAdivce:[], 
				allAdivce:[], 

			};
		},
		methods: {
			getCOPDData() {
				let obj = {
					method: "GET",
					showLoading: false,
					url: `/copd/getData`,
					data: {
						copdReportId: this.reportId
					},
					message: "正在获取数据"
				}
				request(obj).then(res => {
					let resData = res.data
					console.log('111',resData)
					this.frequency = resData.frequency
					this.oxygen = resData.bloodOxygen
					this.samplingData = resData.flowRates
					this.heartRate=resData.heartRate
					this.respRate=resData.huxiRate
					this.isLoadingCOPD = true
				}).catch(err => {
					showToast("请稍后重试！", 1500)
				});
			},
			getCOPDReportAdvice() {
				let obj = {
					method: "GET",
					showLoading: false,
					url: `/copd/getCopdReport`,
					data: {
						copdReportId: this.reportId
					},
					message: "正在获取数据"
				}
				request(obj).then(res => {
					let resData = res.data
					console.log('报告',resData)
					this.oxygenAdivce=resData.oxygen_advice
					this.ecgAdivce=resData.ecg_advice
					this.respAdivce=resData.resp_advice
					this.flowAdivce=resData.flow_advice
					this.allAdivce=resData.all_advice
					// ====== 2. ★★ 设置综合建议模块显隐（必须有这一行） ★★ ======
				    this.showModule.advice = !!(this.allAdivce && this.allAdivce.length > 0);
				}).catch(err => {
					console.log('222',err)
					// 请求失败 → 隐藏建议模块
					      this.showModule.advice = false;
					showToast("请稍后重试！", 1500)
				});
			},
			getPatientName(){
				let obj = {
					method: "GET",
					showLoading: false,
					url: `/user/getUserInfo`,
					message: "正在获取数据"
				}
				request(obj).then(res => {
					// console.log('123',res)
					let resData = res.data
					console.log('222',resData)
					this.name = resData.name
					this.isLoadingCOPD = true
				}).catch(err => {
					showToast("请稍后重试！", 1500)
				});
			},
			getCopdReportData(){
				getCopdReport(this.reportId).then(res=>{
					console.log(res.data)
					this.getEcgRespData(this.reportId,res.data.startTime)
				})
			},
			getEcgRespData(reportId,startTimeTamp){
				let ecgBucket = ossBuckets.ecg;
				let respBucket = ossBuckets.resp;
				let ecgFileName = reportId + '_' + 'ecg_' + startTimeTamp + '.txt';
				let respFileName =  reportId + '_' + 'resp_' + startTimeTamp + '.txt';

				const ecgHost = 'https://' + ecgBucket + '.oss-cn-chengdu.aliyuncs.com';
				// 生成上传时 OSS 完整的路径
				const ossEcgFilePath = ecgHost + "/" + reportId+'/'+ ecgFileName;

				const endpoint='oss-cn-chengdu.aliyuncs.com';
				const region="cn-chengdu"
				const ecgObjectName=reportId+'/'+ ecgFileName;
				getEcgData(ossEcgFilePath,endpoint,ecgBucket,region,ecgObjectName).then(res=>{
					console.log(res)
					if(res.code==200){
						this.ecgReportData=res.data
					}

				})
				const respObjectName=reportId+'/'+ respFileName;
				getRespData("ossFilePath",endpoint,respBucket,region,respObjectName).then(res=>{
					console.log(res)
					if(res.code==200){
						this.respReportData=res.data
					}
				})

				// formData: {
				// 	key: ossEcgFilePath, // OSS 中的文件路径
				// 	OSSAccessKeyId: ossInfo.accessId, // AccessKey ID
				// 	policy: ossInfo.policy, // 上传策略
				// 	Signature: ossInfo.signature, // 签名
				// 	success_action_status: '200', // 成功时返回的状态码，默认为204
				// },



			}
		},
		onLoad(getData) {
			this.reportId = getData.reportId
			this.date = getData.date
			this.getCOPDData()
			this.getCOPDReportAdvice()
			this.getPatientName()

			const raw = decodeURIComponent(getData.date || '') // 建议解码
			// 提取年/月/日并补零 -> YYYYMMDD
			const m = raw.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/)
			this.dateCompact = m ? `${m[1]}${String(m[2]).padStart(2,'0')}${String(m[3]).padStart(2,'0')}` : ''  // 无法解析就给空串或按需处理
			this.getCopdReportData()
		},
		// onPullDownRefresh() {
		// 	uni.stopPullDownRefresh();
		// },
	};
</script>

<style>
	@import "copd_detail.css";
	@import "../report/report.css";
</style>