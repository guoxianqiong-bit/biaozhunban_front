<template>
	<view class="container">
	  <view class="title">呼吸分类图（显示每分钟是否存在呼吸紊乱）:</view>
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
		    breatheStopTime: {
		      type: Object,
		      default: () => ({})
		    }
		},
		methods: {
			dataProcess(){
				var times = []
				for(var i=0;i<this.breatheStopTime.breathStopLabel.length;i++){
					var time = this.breatheStopTime.frequency * i + this.breatheStopTime.startTime
					times.push(time)
				}
				this.timeStrings = times.map(timestamp => {
				  const date = new Date(timestamp);
				  const hours = date.getHours().toString().padStart(2, '0'); // 转换为两位数的小时
				  const minutes = date.getMinutes().toString().padStart(2, '0'); // 转换为两位数的分钟
				  return `${hours}:${minutes}`; // 将小时和分钟拼接为字符串
				});
				this.positionTimeData = this.breatheStopTime.breathStopLabel.map((state, index) => {
				  let value;
				  if (state === 0) {
					  value = '紊乱';
				  } else if (state === 1) {
					  value = '正常';
				  }
				  return [this.timeStrings[index], value];
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
				        data: this.timeStrings,
						axisLabel: {
							fontSize: 12, // 设置字体大小
						},
				      },
				      yAxis: {
				        type: 'category', // 设置 y 轴类型为分类
				        data: ['正常', '紊乱'],
						axisLabel: {
							fontSize: 12, // 设置字体大小
						},
				      },
				      series: [{
				        type: 'line',
				        step: 'start', // 设置阶梯型
				        symbol: 'none',
				        lineStyle: {   // 设置线条的样式
				          color: '#FF9900' // 修改线条颜色为红色
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
	@import "breathe_sort.css"
</style>