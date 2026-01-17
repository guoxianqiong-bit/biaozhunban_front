<template>
	<view class="container">
	  <view class="title">心律分期图:</view>
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
				positionTimeData: [],
				timeStrings: []
			}
		},
		props: {
		    heartRhythmTime: {
		      type: Object,
		      default: () => ({})
		    }
		},
		methods: {
			dataProcess(){
				this.heartRhythmTime.times = this.heartRhythmTime.times.sort((a, b) => a - b);
				this.timeStrings = this.heartRhythmTime.times.map(timestamp => {
				  const date = new Date(timestamp);
				  const hours = date.getHours().toString().padStart(2, '0'); // 转换为两位数的小时
				  const minutes = date.getMinutes().toString().padStart(2, '0'); // 转换为两位数的分钟
				  return `${hours}:${minutes}`; // 将小时和分钟拼接为字符串
				});
				// console.log(this.timeStrings)
				this.positionTimeData = this.heartRhythmTime.heartRhythmClass.map((state, index) => {
				  return [this.timeStrings[index], state];
				})
				// console.log(this.positionTimeData)
			},
			init() {
			  this.dataProcess()
			  this.$refs.chart.init(echarts, chart => {
				  const option = {
				      grid: {
				        left: '10%',   // 左边距
				        right: '5%',  // 右边距
				        top: '5%',    // 上边距
				        bottom: '12%'  // 下边距
				      },
				      xAxis: {
				        type: 'category',
				        data: this.timeStrings
				      },
				      yAxis: {
				        type: 'category', // 设置 y 轴类型为分类
				        data: ['N类', 'S类', 'V类', 'F类']
				      },
				      series: [{
				        type: 'line',
				        step: 'start', // 设置阶梯型
				        symbol: 'none',
				        lineStyle: {   // 设置线条的样式
				          color: '#0099CC' // 修改线条颜色为红色
				        },
				        data: this.positionTimeData // 这里设置你的具体数据，使用二维数组表示 x 和 y 的对应关系
				      }]
				    }
			        chart.setOption(option);
				});
			}
		},
		mounted() {
			this.init()
		}
	}
</script>

<style>
	@import "rhythm_time.css"
</style>
