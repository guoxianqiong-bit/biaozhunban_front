<template>
	<view class="container">
	  <view class="title">不同睡眠时期的心率:</view>
	  <view class="charts">
		  <l-echart ref="chart"></l-echart>
	  </view>
	</view> 
</template>

<script>
	import * as echarts from 'echarts';
	export default {
		data() {
			return {
				
			}
		},
		props: {
		    awake: {
		      type: Object,
		      default: () => ({})
		    },
			deepSleep: {
			  type: Object,
			  default: () => ({})
			},
			lightSleep: {
			  type: Object,
			  default: () => ({})
			},
			rem: {
			  type: Object,
			  default: () => ({})
			}
		},
		methods: {
			init(){
				var awake = ['觉醒期', this.awake.lowest, this.awake.average, this.awake.highest]
				var rem = ['REM期', this.rem.lowest, this.rem.average, this.rem.highest]
				var deepSleep = ['熟睡期', this.deepSleep.lowest, this.deepSleep.average, this.deepSleep.highest]
				var lightSleep = ['浅睡期', this.lightSleep.lowest, this.lightSleep.average, this.lightSleep.highest]
				var option = {
				    legend: {},
				    grid: {
				      left: '10%',   // 左边距
				      right: '10%',  // 右边距
				      top: '15%',    // 上边距
				      bottom: '12%'  // 下边距
				    },
				    dataset: {
				      source: [
				        ['product', '低', '均', '高'],
						awake,rem,deepSleep,lightSleep
				      ]
				    },
				    xAxis: { type: 'category' },
				    yAxis: {},
				    series: [
				      { 
				        type: 'bar' ,
				        label:{
				          show: true, // 显示数值
				          position: 'top', // 数值显示在柱子的上方
				          fontSize: 10
				        },
				      },{ 
				        type: 'bar' ,
				        label:{
				          show: true, // 显示数值
				          position: 'top', // 数值显示在柱子的上方
				          fontSize:10
				        }
				      }, { 
				        type: 'bar' ,
				        label:{
				          show: true, // 显示数值
				          position: 'top', // 数值显示在柱子的上方
				          fontSize:10
				        }
				      },
				      
				    ]
				};
				this.$refs.chart.init(echarts, chart => {
					chart.setOption(option);
				});
			}
		},
		mounted() {
		  this.init();
		}
	}
</script>

<style>
@import "heart_rate_period.css";
</style>