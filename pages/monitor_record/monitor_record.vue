<template>
	<view class="main">
		<view v-if="isLoading" class="content" style="margin-top: 10px;">
		  <view class="load text-grey">历史监测记录如下所示</view>
		  <view class="list">
		    <view @click="toNavigate(item.url)" v-for="item in aimDesc" class="report-info">
		      <view class="date">{{item.recordDate}}</view>
		      <view class="time">睡眠时间段：{{item.sleepTime}}</view>
		      <view class="report-tag">已上传</view>
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
	import {formatTimestamp} from "../../utils/dateUtil.js"
	import { formatTime } from "../../utils/dateUtil.js";
	import pagination from "../../components/pagination/pagination.vue";
	export default {
		components:{
			pagination
		},
		data() {
			return {
				isLoading:false,
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
			// 得到分页信息
			getReportPageInfo(){
				let page = this.pageNum
				let obj = {
				  method: "GET",
				  showLoading: true,
				  url:`/report/getMonitorRecord`,
				  data:{
					page,
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
	@import "/style/base/comm.css";
	.top_bar {
	  width: 100%;
	}
	
	.list{
	  width: 95%;
	  margin: 0 auto;
	}
	
	.report-info{
	  position: relative;
	  margin-bottom: 15rpx;
	  border:1px solid #bfd1eb;
	  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	  border-radius: 20rpx;
	  box-shadow: rgba(0, 0, 0, 0.15) 0px 15px 25px, rgba(0, 0, 0, 0.05) 0px 5px 10px;
	  padding: 20rpx;
	  overflow: hidden;
	}
	
	.report-tag {
		position: absolute;
		top: 35rpx;
		right: 0;
		border-radius: 10rpx;
		text-align: center;
		background-color: #3cba92; /* 标签条背景颜色 */
		color: #fff; /* 文字颜色 */
		padding: 2px 8px; /* 调整内边距 */
		transform: rotate(45deg); /* 旋转45度，使其斜着显示 */
	}
	
	.date{
	  font-size: 30rpx;
	  color: #D24D57;
	}
	.time{
	  color: #4d4d4d;
	}
	.content{
		
	}
</style>
