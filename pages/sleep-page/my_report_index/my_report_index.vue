<template>
	<view class="main">
		<view class="head">
		<view class="top_bar bar search fixed flex-direction">
		  <view class="bar search bg-white " style="width:100%">
				<view class="search-date">
					<view class="date-group">
						<picker @change="onStartDateChange" mode="date" :value="startDate">
							<view class="picker">
								<text :class="!startDate ? 'text-line1' : 'text-line2'">{{startDate || '开始日期'}}</text>
							</view>
						</picker>
						<text class="text-line1">~</text>
						<picker @change="onEndDateChange" mode="date" :value="endDate">
							<view class="picker">
								<text :class="!endDate ? 'text-line1' : 'text-line2'">{{endDate || '结束日期'}}</text>
							</view>
						</picker>
					</view>
					<view @click="bindDateSearchTap" class="date-btn btn mid bg-gray margin-left-xs" style="width:130rpx">搜索</view>
					<view @click="bindDateClearTap" class="date-btn btn mid bg-grey light margin-left-xs" style="width:130rpx">清空</view>
				</view>
				<slot name="searchEnd" />
			</view>
		</view>
		</view>
		<view v-if="isLoading" class="content" style="margin-top: 50px;">
		  <view class="load text-grey">筛选结果如下所示，点击查看详情</view>
		  <view class="list">
		    <view @click="toNavigate(item.url)" v-for="item in aimDesc" class="report-info">
		      <view class="date">{{item.recordDate}}</view>
		      <view class="time">睡眠时间段：{{item.sleepTime}}</view>
		      <view class="report-tag">已诊断</view>
		    </view>
		  </view>
		  <!-- 分页组件 -->
		  <view>
		    <pagination :total="total" :pageSize="pageSize" :pageNum="pageNum" @pageChange="handlePageChange">
		    </pagination>
		  </view>
		</view>
	</view>
</template>

<script>
	import { request } from "/utils/httpUtils.js";
	import {showToast} from "/utils/ui.js";
	import {formatTimestamp} from "../../../utils/dateUtil.js"
	import { formatTime } from "../../../utils/dateUtil.js";
	import pagination from "../../../components/pagination/pagination.vue";
	export default {
		components:{
			pagination
		},
		data() {
			return {
				isLoading:false,
				startDate: '',//默认起始时间  
				endDate: '',//默认结束时间 
				colorNameArr:['cyan','blue','red','orange','olive','green','purple','mauve'],
				aimDesc:[],
				pageNum: 1, // 当前页码
				total: 0, // 数据总数
				pageSize: 8, // 每页显示条数
			}
		},
		methods: {
			toNavigate(url){
				uni.navigateTo({
					url:url
				})
			},
			handlePageChange(pageNum){
				this.pageNum = pageNum
				this.getReportPageInfo()
			},
			onStartDateChange(event){
				this.startDate = event.detail.value;
			},
			onEndDateChange(event){
				this.endDate = event.detail.value;
			},
			bindDateSearchTap(){
				this.getReportPageInfo()
			},
			bindDateClearTap(){
				this.startDate = ''
				this.endDate = ''
				this.getReportPageInfo()
			},
			// 得到分页信息
			getReportPageInfo(){
				let page = this.pageNum
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/report/getStateByPage`,
				  data:{
					page,
					startDate:this.startDate,
					endDate:this.endDate,
					pageSize:this.pageSize
				  },
				  message:"正在获取数据"
				}
				request(obj).then(res=>{
				  let resArr = res.data.content
				  let reportArr = []
				  for (var i = 0; i < resArr.length; i++) {
					let item = resArr[i]
					item.recordDate = formatTimestamp(item.startTime)
					item.sleepTime = `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
					item.url = `/pages/sleep-page/my_report/my_report?reportId=${item.reportId}&date=${item.recordDate}`
					reportArr.push(item)
				  }
				  this.total = res.data.total
				  this.isLoading = true
				  this.aimDesc = reportArr
				}).catch(err=>{
				  showToast("请稍后重试！",1500)
				});
			},
		},
		onLoad() {
			this.getReportPageInfo()
		},
		onPullDownRefresh() {
			this.getReportPageInfo();
			uni.stopPullDownRefresh()
		}
	}
</script>

<style>
	@import "my_report_index.css"
</style>
