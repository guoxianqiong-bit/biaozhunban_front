<template>
	<view class="main">
		<view class="up">
	    <!-- <image mode="aspectFill" src="/static/images/3161706170864_.pic.jpg" /> -->
		<image mode="aspectFill" src="../../static/images/headpic.png" />
		</view>
		<view class="down">
			<view class="menu card-project">
				<view @click="url(`/pages/sleep-page/sleep_state_index/sleep_state_index`)" class="item">
					<view class="item-inner">
						<view class="img bg1">
							<image src="../../static/images/menu/activity.png" />
						</view>
						<view class="title">睡眠状态</view>
					</view>
			</view>
				<view @click="url(`/pages/sleep-page/heart_rate_index/heart_rate_index`)" class="item">
					<view class="item-inner">
						<view class="img bg2">
							<image src="../../static/images/menu/rule.png" />
						</view>
						<view class="title">心率与血氧</view>
					</view>
				</view>
				<view @click="url(`/pages/sleep-page/snore_detail_index/snore_detail_index`)" class="item">
					<view class="item-inner">
						<view class="img bg3">
							<image src="../../static/images/menu/wei.png" />
						</view>
						<view class="title">鼾声</view>
					</view>
				</view>
				<view @click="url(`/pages/sleep-page/breathe_detail_index/breathe_detail_index`)" class="item">
					<view class="item-inner">
						<view class="img bg4">
							<image src="/static/images/menu/board.png" />
						</view>
						<view class="title">呼吸</view>
					</view>
			    </view>
	        <view @click="url(`/pages/sleep-page/sleep_position_index/sleep_position_index`)" class="item">
					<view class="item-inner">
						<view class="img bg-orange">
							<image src="/static/images/menu/vote.png" />
						</view>
						<view class="title">体位体动</view>
					</view>
				</view>
	      <view @click="url(`/pages/sleep-page/heart_rhythm_index/heart_rhythm_index`)" class="item">
					<view class="item-inner">
						<view class="img bg-red">
							<image src="/static/images/menu/activity.png" />
						</view>
						<view class="title">心律</view>
					</view>
			</view>
			<view @click="url(`/pages/sleep-page/my_report_index/my_report_index`)" class="item">
					<view class="item-inner">
						<view class="img bg-purple">
							<image src="../../static/images/menu/my.png" />
						</view>
						<view class="title">睡眠报告</view>
					</view>
			</view>
			<view @click="url(`/pages/copd/copd_index/copd_index`)" class="item">
					<view class="item-inner">
						<view class="img bg-cyan">
							<image src="/static/images/menu/chakan.png" />
						</view>
						<view class="title">慢阻肺</view>
					</view>
			</view>
<!-- 			<view @click="url(`/pages/copd/report_index/report_index`)" class="item">  
					<view class="item-inner">
						<view class="img bg-cyan">
							<image src="/static/images/menu/chakan.png" />
						</view>
						<view class="title">慢阻肺报告</view>
					</view>
			</view> -->
			<view @click="url(`/pages/copd_analysis_report/index/index`)" class="item">
					<view class="item-inner">
						<view class="img bg-cyan">
							<image src="/static/images/menu/vote.png" />
						</view>
						<view class="title">肺分析报告</view>
					</view>
			</view>
		</view>	
	    <view class="cute">
				<view class="item" bindtap="url" data-url="../../about/index/about_index?key=SETUP_CONTENT_PHONE">
					<image class="loading" src="../../static/images/home/cute_3.jpg" mode="aspectFill" />
				</view>
				<view class="item" open-type="contact">
					<image class="loading" src="../../static/images/home/cute_4.jpg" mode="aspectFill" />
				</view>
			</view>
		</view>
		<view class="line">
			<hr class="hr-solid-content" data-content="医学科普栏">
		</view>
		<view class="news">
		    <new_card v-for="item in news_infos" :news_info="item" @click="url(item.url)"> </new_card>
		</view>
	</view>
</template>
<script>
	import new_card from '../../components/new_card/new_card.vue';
	export default {
		components:{
			new_card
		},
		data() {
			return {
				news_infos:[
					{
						title:'慢阻肺监测重要',
						description:'了解慢阻肺监测的重要性。',
						imgSrc:'../../static/images/copd/card1.png',
						url:'/pages/copd_important/copd_important'
					},
					{
						title:'了解慢阻肺发展阶段',
						description:'不同阶段慢阻肺的症状。',
						imgSrc:'../../static/images/copd/card2.png',
						url:'/pages/copd_stage/copd_stage'
					},
					{
						title:'什么是慢阻肺？',
						description:'慢阻肺缺乏监测非常危险。',
						imgSrc:'../../static/images/copd/card3.png',
						url:'/pages/copd_dangerious/copd_dangerious'
					}
				]
			}
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
		},
		onLoad() {
			
		},
		methods: {
			url(data){
				uni.navigateTo({
					url:data
				})
			}
		}
	}
</script>
<style>
	@import "index.css";
</style>
