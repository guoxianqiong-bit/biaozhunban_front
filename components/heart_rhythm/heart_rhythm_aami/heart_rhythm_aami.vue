<template>
	<view class="container-ahi">
		<view class="content">


			<view class="ahi-card2">
				<text class="ahi-text1">AAMI分类标准:\n</text>
				<text class="ahi-text2">
					AAMI EC57：2012 是由美国医疗仪器促进协会制定的一系列标准，提出心拍信号分为五类.\n
				</text>
				<view style="margin-top: 20rpx;">
					<text class="ahi-text2">{{ahiDesc.text1}}\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text2}}\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text3}}\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text4}}\n
					</text>
					<text class="ahi-text2">{{ahiDesc.text5}}\n
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
				ahiDesc: {
					text1: "N类: 正常心拍，心跳频率和节律在健康范围内;",
					text2: "S类: 室上性异常心拍，包括房性、室上性早搏等；",
					text3: "V类: 心室异常心拍，包括室性早搏、室性逸博;",
					text4: "F类: 心室融合心拍;",
					text5: "Q类: 未知心拍;"
				},
				ahiText: {
					advice: "保持合理饮食和适度运动有助于维持健康水平"
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
			init() {
				const sectionWidth = 150; // 每个区域宽度，假设总宽度 600rpx，4 个区域
				if (this.ahi < 5) {
					// 正常
					this.boxMarginLeft = `${sectionWidth / 2 - 25}rpx`; // 区域中心减去箭头宽度的一半
				} else if (this.ahi >= 5 && this.ahi < 16) {
					// 轻度
					this.boxMarginLeft = `${sectionWidth * 1.5 - 25}rpx`;
				} else if (this.ahi >= 16 && this.ahi <= 30) {
					// 中度
					this.boxMarginLeft = `${sectionWidth * 2.5 - 25}rpx`;
				} else {
					// 重度
					this.boxMarginLeft = `${sectionWidth * 3.5 - 25}rpx`;
				}
			}
		},
		mounted() {
			this.init();
		}
	}
</script>

<style>
	@import "heart_rhythm_aami.css"
</style>
