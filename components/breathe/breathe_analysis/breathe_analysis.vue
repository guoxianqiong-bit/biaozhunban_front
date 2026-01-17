<template>
	<view class="container-breath">
		<text class="breath-text">呼吸情况分析</text>
		<view class="horizontal-cards">
			<view class="card">
				<view class="card-content">
					<image src="/static/images/breath_1.png" class="breath_stop"></image>
				</view>
				<view class="card-content">
					<view class="line">
						<image src="/static/images/data.png" class="icon"></image>
						<text class="text">总次数:{{breatheStop.total}}次</text>
					</view>
					<view class="line">
						<image src="/static/images/time.png" class="icon"></image>
						<text class="text">最长时间:{{breatheStop.maxDurationTime}}秒</text>
					</view>
					<view class="line">
						<image src="/static/images/index.png" class="icon"></image>
						<text class="text">指数:{{breatheStop.perHour}}次/小时</text>
					</view>
				</view>
			</view>
	
			<view class="card">
				<view class="card-content">
					<image src="/static/images/breath_2.png" class="breath_stop"></image>
				</view>
				<view class="card-content">
					<view class="line">
						<image src="/static/images/data.png" class="icon"></image>
						<text class="text">总次数:33次</text>
					</view>
					<view class="line">
						<image src="/static/images/time.png" class="icon"></image>
						<text class="text">最长时间:35秒</text>
					</view>
					<view class="line">
						<image src="/static/images/index.png" class="icon"></image>
						<text class="text">指数:5.3次/小时</text>
					</view>
				</view>
	
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		props: {
		    breatheStop: {
		      type: Object,
		      default: () => ({})
		    }
		},
		methods: {
			
		},
		
	}
</script>

<style>
@import "breathe_analysis.css";
</style>