<template>
	<view class="container-ahi">
		<view class="content">
			<view class="ahi-card1">
				<text style="font-size: 34rpx;">AHI指数：{{ahiText.index}}</text>
				<view class="bar-container">
					<view class="bar-card">
						<view class="bar-section normal">
							<text style="font-size:28rpx">正常</text>
						</view>
						<view class="bar-section mild">
							<text style="font-size:28rpx">轻度</text>
						</view>
						<view class="bar-section moderate">
							<text style="font-size:28rpx">中度</text>
						</view>
						<view class="bar-section severe">
							<text style="font-size:28rpx">重度</text>
						</view>
					</view>
				</view>
				<image class="index-move" src="../../../static/images/index1.png" :style="{ marginLeft: boxMarginLeft }"></image>
	
				<view>
					<text class="card1-text1">
						{{ahiText.advice}}
					</text>
				</view>
	
			</view>
	
	
			<view class="ahi-card2">
				<text class="ahi-text1">什么是AHI:\n</text>
				<text class="ahi-text2">
					AHI指数是指每小时睡眠内呼吸暂停加上低通气的总次数.\n
				</text>
				<view style="margin-top: 20rpx;">
					<text class="ahi-text2">AHI分度参考\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text1}}\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text2}}\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text3}}\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text4}}\n
					</text>
				</view>
	
			</view>
		</view>
	</view>
</template>

<script>
	import * as echarts from 'echarts';
	export default {
		data() {
			return {
				ahiDesc:{
				  text1:"AHI<5: 正常;",
				  text2:"5<=AHI<16: 轻度睡眠呼吸暂停低通气综合征;",
				  text3:"16<=AHI<=30: 中度睡眠呼吸暂停低通气综合征;",
				  text4:"30<AHI:重度睡眠呼吸暂停低通气综合征;"
				},
				ahiText:{
				  advice:"保持合理饮食和适度运动有助于维持健康水平"
				},
				boxMarginLeft: '70rpx' // 初始的 margin-left 值
			}
		},
		props: {
		    ahi: {
		      type: Number,
		      default: () => ({})
		    }
		},
		methods: {
			init(){
				this.ahiText.index = this.ahi
				if (this.ahi < 5) {
				    this.boxMarginLeft = '70rpx';
				} else if (this.ahi >= 5 && this.ahi < 16) {
				    this.boxMarginLeft = '240rpx';
				} else if (this.ahi >= 16 && this.ahi <= 30) {
				    this.boxMarginLeft = '410rpx';
				} else {
				    this.boxMarginLeft = '570rpx';
				}
			}
		},
		mounted() {
		  this.init();
		}
	}
</script>

<style>
@import "breathe_ahi.css";
</style>
