<template>
	<view class="main">
		<view class="head">
					<view class="top_bar bar search fixed flex-direction" style="height: auto; display: flex; flex-direction: column;">
						
						<view class="bg-white flex text-center solid-bottom" style="width: 100%; height: 45px; display: flex; align-items: center; justify-content: space-around;">
							
							<view :class="currentTab==0?'text-blue text-bold':''" @click="changeTab(0)" style="flex: 1; height: 100%; line-height: 45px;">
								全部
							</view>
							
						<view :class="currentTab==1?'text-blue text-bold':''" @click="changeTab(1)" style="flex: 1; height: 100%; display: flex; justify-content: center; align-items: center;">
						    
						    <view style="position: relative;">
						        未审核
						        
						        <view v-if="unreviewedCount > 0" style="
						            position: absolute; 
						            top: -6px; 
						            right: -20px; 
						            background-color: #fa5151; 
						            color: white; 
						            font-size: 10px; 
						            height: 16px; 
						            min-width: 16px; 
						            line-height: 16px; 
						            border-radius: 8px; 
						            padding: 0 4px; 
						            text-align: center;
						            z-index: 10;
						        ">
						            {{ unreviewedCount > 99 ? '99+' : unreviewedCount }}
						        </view>
						    </view>
						    
						</view>
							
							<view :class="currentTab==2?'text-blue text-bold':''" @click="changeTab(2)" style="flex: 1; height: 100%; line-height: 45px;">
								已审核
							</view>
							
						</view>
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
								<view @click="bindDateSearchTap" class="date-btn btn mid bg-gray margin-left-xs"
									style="width:130rpx">搜索</view>
								<view @click="bindDateClearTap" class="date-btn btn mid bg-grey light margin-left-xs"
									style="width:130rpx">清空</view>
							</view>
							<slot name="searchEnd" />
						</view>
					</view>
				</view>
		<!-- 筛选结果部分 -->
		<view class="content"  v-if="isLoading"  style="margin-top: 100px;">
			<!-- <view class="load text-grey">筛选结果如下所示，点击查看详情</view> -->
			<view class="list">
				<view @click="toNavigate(item.url)" v-for="item in aimDesc" class="report-info" :key="item.reportId">
					<view class="headline">慢阻肺测试时间：{{item.recordDate}}</view>
				  <view class="time">{{item.testStartTime}}</view>
				<view
				  class="report-tag"
				  :class="item.status > 1 ? 'tag-reviewed' : 'tag-unreviewed'"
				>
				  {{ item.status > 1 ? '已审核' : '未审核' }}
				</view>



				</view>
<!-- 			  <view
			    v-for="item in aimDesc"
			    :key="item.reportId"
			    class="report-card"
			    @click="toNavigate(item.url)"
			  > -->
			    <!-- 左侧时间信息 -->
<!-- 			    <view class="card-left">
			      <view class="info-time">{{ item.testStartTime }}</view>
			    </view> -->
			
			    <!-- 右侧状态信息 -->
<!-- 			    <view class="card-right">
			      <view
			        class="status-wrapper"
			        :class="'status-normal'"
			      >
			        <view class="status-icon"></view>
			        <view class="status-text">
			          {{ '查看' }}
			        </view>
			      </view>
			    </view>
			  </view> -->
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
	import pagination from "../../../components/pagination/pagination.vue";
	import {formatTimestamp,formatTimestamp2Second} from "../../../utils/dateUtil.js"
	export default {
		data() {
			return {
				aimDesc: '',
				isLoading:false,
				startDate: '',//默认起始时间  
				endDate: '',//默认结束时间
				pageNum: 1, // 当前页码
				total: 0, // 数据总数
				pageSize: 6, // 每页显示条数
				fullList: [], // 新增：存放所有符合条件的报告
				hasChanged:false,
				currentTab: 0,      // 0:全部, 1:未审核, 2:已审核
				unreviewedCount: 0  // 未审核数量
				
			};
		},
			onShow() {
					if(uni.getStorageSync('hasChanged')){
						this.getReportPageInfo();
						uni.setStorageSync('hasChanged', false)
					}
					
				},
		methods: {
			// === 把这段加到 methods 里 ===
			changeTab(index) {
			    this.currentTab = index;
			    this.pageNum = 1; // 切换时重置回第一页
			    this.getReportPageInfo(); // 重新筛选数据
			},
			toNavigate(url){
				uni.navigateTo({
					url:url
				})
			},
			handlePageChange(payload){
			    // 兼容几种发法：2、{page:2}、{pageNum:2}
			    const num = typeof payload === 'number'
			      ? payload
			      : (payload?.pageNum ?? payload?.page ?? this.pageNum);
			    this.pageNum = Number(num) || 1;
			    // === 修改：翻页时直接调用本地切分方法，不请求网络 ===
			        this.renderLocalPage();
				
			  },
			// handlePageChange(pageNum){
			// 	this.pageNum = pageNum
			// 	this.getReportPageInfo()
			// },
		

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
		
		getReportPageInfo() {
		    // 每次搜索都查第1页，但是查1000条（模拟查全部）
		    // 注意：这里假设你的总数据不超过1000条。如果更多，pageSize要设更大
		    let obj = {
		        method: "GET",
		        showLoading: true,
		        url: `/copd/getCOPDByPage`,
		        data: {
		            page: 1,           // 强制查第1页
		            pageSize: 1000,    // 强制查大数量
		            startDate: this.startDate,
		            endDate: this.endDate
		            // 注意：不要传 status 给后端了，因为后端不支持
		        },
		        message: "正在获取数据"
		    }
		
		    request(obj).then(res => {
		        let resArr = res.data.content || []
				// ====== 【新增】核心修复：计算未审核数量 ======
				    let count = 0;
				    for (let k = 0; k < resArr.length; k++) {
				        // 假设 status 1 是未审核
				        if ((resArr[k].status ?? 0) === 1) {
				            count++;
				        }
				    }
				    this.unreviewedCount = count; // 把算出来的数量赋值给变量
				    // ==========================================
		        let validArr = []
		
		        // 1. 先进行筛选 (Filter)
		        for (var i = 0; i < resArr.length; i++) {
		            let item = resArr[i]
		            item.status = item.status ?? 0
		
		            // 基础条件：后端说status>=1才显示
		            if (item.status < 1) continue;
		
		            // Tab条件筛选
		            // 如果选了未审核(Tab=1)，但数据是已审核(>1)，跳过
		            if (this.currentTab === 1 && item.status > 1) continue;
		            // 如果选了已审核(Tab=2)，但数据是未审核(=1)，跳过
		            if (this.currentTab === 2 && item.status == 1) continue;
		
		            // 格式化数据
		            item.recordDate = formatTimestamp(item.startTime)
		            item.testStartTime = formatTimestamp2Second(item.startTime)
		            item.url = `/pages/copd_analysis_report/report/report?reportId=${item.reportId}&date=${item.recordDate}`
		            
		            validArr.push(item)
		        }
		
		        // 2. 保存筛选后的所有数据到本地
		        this.fullList = validArr;
		        this.total = validArr.length; // 更新总条数
		        this.isLoading = true;
		
		        // 3. 开始显示第一页
		        // 如果是点击搜索或切换Tab，重置为第1页
		        // this.pageNum = 1; (这个在调用处通常已经重置了，这里保险起见可以不写)
		        this.renderLocalPage();
		
		    }).catch(err => {
		        showToast("请稍后重试！", 1500)
		    });
		},
		
		// === 新增方法：本地切分分页 ===
		renderLocalPage() {
		    // 根据当前 pageNum 和 pageSize 从 fullList 里切出 6 条
		    let start = (this.pageNum - 1) * this.pageSize;
		    let end = start + this.pageSize;
		    
		    // 截取数据给 aimDesc 显示
		    this.aimDesc = this.fullList.slice(start, end);
		}
			

		},
		onLoad() {
			this.getReportPageInfo()
		},
		onPullDownRefresh() {
			this.getReportPageInfo();
			uni.stopPullDownRefresh()
		}
		
	};
	
</script>

<style>
	@import "index.css";
</style>