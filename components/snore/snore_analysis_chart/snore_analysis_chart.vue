<template>
	<view class="ec-container">
		<text class="text-style">鼾声情况分析</text>
		<view class="card-style">
			<view class="ec-card" style="margin-left: 10%;">
				<view>
					<image src="/static/images/barchart.png" mode="heightFix" class="snore-1"></image>
				</view>
				<view>
					<text style="color: rgb(197, 194, 194);font-size: 14px;">{{text1}}</text>
					<view>
						<text style="font-size: 21px; font-family: serif;">{{processedSnoreData.times}}次</text>
					</view>
				</view>
			</view>
			<view class="ec-card">
				<view>
					<image src="/static/images/time-circle-fill.png" mode="heightFix" class="snore-1"></image>
				</view>
				<view>
					<text style="color: rgb(197, 194, 194);font-size: 14px;">{{text2}}</text>
					<view style="font-size: 22px;font-family: serif;">
						<text style="font-size: 21px; font-family: serif;">{{processedSnoreData.averageTime}}秒</text>
					</view>
				</view>

			</view>
			<view class="ec-card" style="margin-left: 10%;">
				<view>
					<image src="/static/images/dashboard.png" mode="heightFix" class="snore-1"></image>
				</view>
				<view>
					<text style="color: rgb(197, 194, 194);font-size: 14px;">{{text3}}</text>
					<view>
						<text style="font-size: 21px; font-family: serif;">{{processedSnoreData.totalHour}}分 </text>
					</view>
				</view>
			</view>
			<view class="ec-card">
				<view>
					<image src="/static/images/weibiaoti16.png" mode="heightFix" class="snore-1">
					</image>
				</view>
				<view>
					<text style="color: rgb(197, 194, 194);font-size: 14px;">{{text4}}</text>
					<view>
						<text style="font-size: 21px; font-family: serif;">{{processedSnoreData.sleepRatio}}%</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			snoreInfo: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {
				text1: "打鼾事件次数",
				text2: "平均每次打鼾时长",
				text3: "总共打鼾时长",
				text4: "打鼾占睡眠比例",
			}
		},
		computed: {
			// 使用计算属性来处理和展示数据
			processedSnoreData() {
				// 检查snoreInfo是否有需要的数据
				if (this.snoreInfo && this.snoreInfo.num !== undefined) {
					return {
						times: this.snoreInfo.num,
						averageTime: this.snoreInfo.perDuration,
						totalHour: this.snoreInfo.totalDuration, // 假设需要转换为小时
						sleepRatio: this.snoreInfo.proportion*100
					};
				} else {
					// 返回一个默认值或者空对象，以防没有数据
					return {
						times: 0,
						averageTime: 0,
						totalHour: 0,
						sleepRatio: 0
					};
				}
			}
		}
	}
</script>

<style scoped>
	@import "snore_analysis_chart.css";
</style>