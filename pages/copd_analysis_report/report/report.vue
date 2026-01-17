<template>
	<view class="main">
		<view class="report-header">
		  <view class="report-base-info">
		    <text class="info-item">监测日期：{{ date }}</text>
		    <text class="info-item">姓名：{{ name }}</text>
		    <text class="info-item">性别：{{ userSex }}</text>
		    <text class="info-item">年龄：{{ userAge }} 岁</text>
		    <text class="info-item">身高：{{ userHeight }} cm</text>
		    <text class="info-item">体重：{{ userWeight }} kg</text>
		    <text class="info-item">报告编号：COPD-{{ dateCompact }}-{{ reportId }}</text>
		  </view>
		</view>

		<!-- ✅ 仅当数据加载完毕才开始渲染 -->
		<view v-if="isLoadingCOPD" class="card">
			
			<!-- Step 1: 血氧 -->
			<blood_oxygen
				v-if="loadStep >= 1"
				:oxygen="oxygen"
				:oxygenAdivce="oxygenAdivce" />

			<!-- Step 2: FV 图 -->
			<fv
				v-if="loadStep >= 2"
				:flow-rates-raw="samplingData"
				:flow-rates="fvY"
				:realTimeVolume="fvX"
				:frequency="frequency"
				:flowAdivce="flowAdivce"
				:PEF="PEF"
				:FEF25="FEF25"
				:FEF50="FEF50"
				:FEF75="FEF75"
				:FEF2575="FEF2575"
				:PEF_pred="PEF_pred"
				:FEF25_pred="FEF25_pred"
				:FEF50_pred="FEF50_pred"
				:FEF75_pred="FEF75_pred"
				:FVC="FVC"
				:FEV1="FEV1"
				:FEV1FVC="FEV1FVC"
				:FVC-pred="FVC_pred"
				:FEV1-pred="FEV1_pred"
				:FEV1FVC-pred="FEV1FVC_pred"
				 />

			<!-- Step 3: VT 图 -->
			<vt
				v-if="loadStep >= 3"
				:realTimeVolume="vtY"
				:sampleFrequency="frequency"
				:flowAdivce="flowAdivce"
				:FVC="FVC"
				:FEV1="FEV1"
				:FEV1FVC="FEV1FVC"
				:FVC_pred="FVC_pred"
				:FEV1_pred="FEV1_pred"
				:FEV1FVC_pred="FEV1FVC_pred" />

			<!-- Step 4: COPD 基本信息 -->
			<copd_info
				v-if="loadStep >= 4"
				:samplingData="samplingData"
				:frequency="frequency"
				:flowAdivce="flowAdivce"
				:FVC="FVC"
				:FEV1="FEV1"
				:FEV1FVC="FEV1FVC"
				:FVC_pred="FVC_pred"
				:FEV1_pred="FEV1_pred"
				:FEV1FVC_pred="FEV1FVC_pred"/>

			<!-- Step 5: 心电（⚠ 只有 ecgReportData 有数据才显示） -->
			<ecg_info
				v-if="loadStep >= 5 && ecgReportData && ecgReportData.length"
				:yScale="0.02"
				:xScale="0.5"
				:heartRate="heartRate"
				:ecgReportData="ecgReportData"
				:ecgAdivce="ecgAdivce" />

			<!-- Step 6: 呼吸（⚠ 不限制 respReportData 内容） -->
			<resp
				v-if="loadStep >= 6 && respReportData && respReportData.length"
				:yScale="0.002"
				:respReportData="respReportData"
				:respRate="respRate"
				:respAdivce="respAdivce" />

			<!-- Step 7: 综合建议 -->
			<advice
				v-if="loadStep >= 7"
				:allAdivce="allAdivce" 
				:oxygen="oxygen"
				:FEV1FVC="FEV1FVC"/>
			
			<!-- Step 8: 医生审核 -->
			<doctor_review
			  v-if="loadStep >= 8"
			  :key="doctorLevel"
			  :value="doctorLevel"
			  :doctorAdvice="doctorAdvice"
			  @change="onDoctorLevelChange"
			/>



		</view>
	</view>
</template>

<script>
	import { request } from "/utils/httpUtils.js";
	import { showToast } from "/utils/ui.js";
	import copd_info from '../../../components/copd/copd_info/copd_info.vue';
	import blood_oxygen from '../../../components/copd/blood_oxygen/blood_oxygen.vue';
	import ecg_info from '../../../components/copd/ECG/ecg_info.vue';
	import resp from '../../../components/copd/RESP/resp.vue';
	import advice from '../../../components/copd/advice/advice.vue';
	import fv from '../../../components/copd/fv_graphic/fv.vue';
	import vt from '../../../components/copd/vt_graphic/vt.vue';
	import doctor_review from '../../../components/copd/doctor_review/doctor_review.vue';
	import { getCopdReport, getEcgData, getRespData,submitDoctorReview } from "@/api/copdReport/copdReport.js"
	import { ossBuckets } from "@/utils/constants";
	
	const doctorLevelMap = {
	  "正常": 2,
	  "轻度": 3,
	  "中度": 4,
	  "重度": 5,
	  "极重度": 6
	};
	const doctorLevelReverseMap = {
	  1: '',
	  2: '正常',
	  3: '轻度',
	  4: '中度',
	  5: '重度',
	  6: '极重度'
	};


	export default {
		components: { copd_info, blood_oxygen, ecg_info, resp, advice, fv, vt,doctor_review},
		data() {
			return {
				reportId: '',
				date: '',
				dateCompact:'',
				name:'',
				username:'',
				heartRate:'',
				respRate:'',
				oxygen: '',
				samplingData: '',
				frequency: 200,
				isLoadingCOPD: false,

                userSex: '',
                userAge: '',
                userHeight: '',
                userWeight: '',

				loadStep: 0,

				ecgReportData:[],
				respReportData:[],
				realTimeVolume:[],
				vtX:[],
				vtY:[],
				fvX:[],
				fvY:[],

				FVC:'',
				FEV1:'',
				FEV1FVC:'',
				PEF:'',
				FEF25:'',
				FEF50:'',
				FEF75:'',
				FEF2575:'',

				FVC_pred:'',
				FEV1_pred:'',
				FEV1FVC_pred:'',
				PEF_pred:'',
				FEF25_pred:'',
				FEF50_pred:'',
				FEF75_pred:'',
				FEF2575_pred:'',

				oxygenAdivce:[],
				ecgAdivce:[], 
				respAdivce:[], 
				flowAdivce:[], 
				allAdivce:[], 
				
				doctorLevel:'',
                doctorAdvice:'',
			};
		},

		methods: {
			// 获取 COPD 核心数据
			getCOPDData() {
			    let obj = {
			        method: "GET",
			        showLoading: false,
			        url: `/copd/getData`,
			        data: { copdReportId: this.reportId },
			        message: "正在获取数据"
			    };
			
			    return request(obj)
			        .then(res => {
			            console.log("🔥🔥🔥 COPD 接口返回：", res);
			
			            const resData = res.data;
			            console.log("sdds",res)
					    console.log("sdds",resData)
			            // 数据赋值
						// this.date = resData.date;
						this.dateCompact = resData.dateCompact;
						this.name = resData.name;
						this.userSex = resData.sex;
						this.userAge = resData.age;
						this.userWeight = resData.weight;
						this.userHeight = resData.height;
						this.username = resData.username;
						

						
			            this.frequency = resData.frequency;
			            this.oxygen = resData.bloodOxygen;
			            this.samplingData = resData.flowRates || [];
			            this.realTimeVolume = resData.realTimeVolume || [];
			            this.vtX = resData.vtX || [];
			            this.vtY = resData.vtY || [];
			            this.fvX = resData.fvX || [];
			            this.fvY = resData.fvY || [];
			
			            const t = resData.copdTable || {};
			            this.FVC = t.fvc || 0;
			            this.FEV1 = t.fev1 || 0;
			            this.FEV1FVC = t.fev1FVC || 0;
			            this.PEF = t.pef || 0;
			            this.FEF25 = t.fef25 || 0;
			            this.FEF50 = t.fef50 || 0;
			            this.FEF75 = t.fef75 || 0;
			            this.FEF2575 = t.fef2575 || 0;
			
			            this.FVC_pred = t.fvc_pred || 0;
			            this.FEV1_pred = t.fev1_pred || 0;
			            this.FEV1FVC_pred = t.fev1FVC_pred || 0;
			            this.PEF_pred = t.pef_pred || 0;
			            this.FEF25_pred = t.fef25_pred || 0;
			            this.FEF50_pred = t.fef50_pred || 0;
			            this.FEF75_pred = t.fef75_pred || 0;
			            this.FEF2575_pred = t.fef2575_pred || 0;
			
			            this.heartRate = resData.heartRate || 0;
			            this.respRate = resData.huxiRate || 0;
			
			            this.isLoadingCOPD = true;
			
			            // 分步加载动画
			            this.loadStep = 4;
			            const steps = 8;
			            for (let i = 4; i <= steps; i++) {
			                setTimeout(() => {
			                    this.loadStep = i;
			                }, 200 * (i - 1));
			            }
			        })
			        .catch(err => {
			            console.error(err);
			            showToast("请稍后重试！", 1500);
			        });
			},

			// 获取患者姓名
			getPatientName(){
				let obj = {
					method: "GET",
					showLoading: false,
					url: `/user/getUserInfo`,
					message: "正在获取数据"
				};
				return request(obj).then(res => {
					let resData = res.data;
					this.username = resData.name;
					this.isLoadingCOPD = true;
				}).catch(err => {
					showToast("请稍后重试！", 1500);
				});
			},

			// 获取心电 & 呼吸 OSS 文件
		getCopdReportData(){
		  getCopdReport(this.reportId).then(res=>{
			console.log("🚨 后端 status =", res.data.status);
		    const status = res.data.status;
		    // 🔥 status → doctorLevel（回显核心）
		    this.doctorLevel = doctorLevelReverseMap[status] || '';
		    this.doctorAdvice = res.data.all_advice;
		    console.log("🔥 回显医生审核状态:", {
		      status,
		      doctorLevel: this.doctorLevel
		    });
		
		    this.getEcgRespData(this.reportId, res.data.startTime);
		  });
		},


			getEcgRespData(reportId,startTimeTamp){
				let ecgBucket =ossBuckets.ecg;
				let respBucket = ossBuckets.resp;
				let ecgFileName = reportId + '_ecg_' + startTimeTamp + '.txt';
				let respFileName = reportId + '_resp_' + startTimeTamp + '.txt';
				const endpoint='oss-cn-chengdu.aliyuncs.com';
				const region="cn-chengdu";

				const ecgHost = 'https://' + ecgBucket + '.oss-cn-chengdu.aliyuncs.com';
				const ossEcgFilePath = ecgHost + "/" + reportId + '/' + ecgFileName;
				const ecgObjectName = reportId + '/' + ecgFileName;
				
				const respHost = 'https://' + respBucket + '.oss-cn-chengdu.aliyuncs.com';
				const ossRespFilePath = respHost + "/" + reportId + '/' + respFileName;
				const respObjectName = reportId + '/' + respFileName; 

				getEcgData(ossEcgFilePath, endpoint, ecgBucket, region, ecgObjectName).then(res=>{
					if(res.code==200){
						this.ecgReportData=res.data;
						
					}
				});
				
				getRespData(ossRespFilePath, endpoint, respBucket, region, respObjectName).then(res=>{
					if(res.code==200){
						this.respReportData=res.data;
						console.log("wdwwwwdwd",this.respReportData);
					}
				});
			},
		
		   onDoctorLevelChange(level,editableText) {
		     console.log("🎯 用户选择的等级（中文）：", level);
		     
		     // 中文 → 数字
		     const doctorLevelValue = doctorLevelMap[level] || 0;
		     
		     // reportId 强转为 number
		     const reportIdValue = Number(this.reportId);
		     const doctorAdivce = editableText;
		     console.log("🔍 转换后的参数：", {
		       原始reportId: this.reportId,
		       转换后reportId: reportIdValue,
		       reportId类型: typeof reportIdValue,
		       医生等级中文: level,
		       医生等级数字: doctorLevelValue,
		       医生等级类型: typeof doctorLevelValue
		     });
		     
		     // 显示加载状态
		     uni.showLoading({
		       title: '提交中...',
		       mask: true
		     });
		     
		     submitDoctorReview(reportIdValue, doctorLevelValue,doctorAdivce)
		       .then((res) => {
		         uni.hideLoading();
		         console.log("✅ 提交成功响应：", res);
		         
		         // 更新本地状态
		         this.doctorLevel = level;
		         this.doctorAdvice = editableText;
		         uni.showToast({ 
		           title: "医生审核已保存", 
		           icon: "success",
		           duration: 2000
		         });
		       })
		       .catch((err) => {
		         uni.hideLoading();
		         console.error("❌ 提交失败详情：", {
		           状态码: err.statusCode,
		           错误数据: err.data,
		           完整错误: err
		         });
		         
		         // 处理 400 错误
		         if (err.statusCode === 400) {
		           // 尝试从错误响应中获取更多信息
		           let detailMessage = "请求参数错误";
		           
		           if (err.data && err.data.message) {
		             detailMessage = err.data.message;
		           } else if (err.data && err.data.error) {
		             detailMessage = `参数错误：${err.data.error}`;
		           }
		           
		           uni.showModal({
		             title: '参数错误',
		             content: detailMessage + '\n\n请检查参数是否正确',
		             showCancel: false,
		             confirmText: '确定'
		           });
		         } else {
		           uni.showToast({
		             title: `提交失败 (${err.statusCode})`,
		             icon: 'none',
		             duration: 3000
		           });
		         }
		       });
		   },

            
			
		},

		onLoad(getData) {
			console.log("🔥 onLoad reportId =", getData.reportId);
			console.log("🔥 onLoad date =", getData.date);
			console.log("///////////////"+this.reportId);

			const savedUser = uni.getStorageSync('currentUser') || {};
			console.log("🔥 当前读取到的个人信息 savedUser =", savedUser);

			
			// this.name = savedUser.name || this.name;
			// this.userSex = savedUser.sex || '';
			// this.userAge = savedUser.age || '';
			// this.userHeight = savedUser.height || '';
			// this.userWeight = savedUser.weight || '';

			this.reportId = getData.reportId;
			this.date = getData.date;

			this.getCOPDData();
			//this.getCOPDReportAdvice();
			//this.getPatientName();

			const raw = decodeURIComponent(getData.date || '');
			const m = raw.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
			this.dateCompact = m ? `${m[1]}${String(m[2]).padStart(2,'0')}${String(m[3]).padStart(2,'0')}` : '';
			try {
			  this.getCopdReportData();
			} catch(e) {
			  console.error("加载心电和呼吸波部分报告失败:", e);
			  uni.showToast({ title: "未获取到心电与呼吸波数据", icon: "none" });
			}
		},

		onPullDownRefresh() {
			console.log('触发下拉刷新');
			Promise.all([
				this.getCOPDData(),
				// this.getCOPDReportAdvice(),
				this.getPatientName(),
				this.getCopdReportData(),
			])
			.then(() => {
				console.log('刷新成功');
				uni.stopPullDownRefresh();
				uni.showToast({ title: '刷新成功', icon: 'success', duration: 1000 });
			})
			.catch(() => {
				console.log('刷新失败');
				uni.stopPullDownRefresh();
				uni.showToast({ title: '刷新失败', icon: 'none', duration: 1500 });
			});
		}
	};
</script>

<style>
	@import "report.css";
	@import "../../copd/report/report.css";
</style>
