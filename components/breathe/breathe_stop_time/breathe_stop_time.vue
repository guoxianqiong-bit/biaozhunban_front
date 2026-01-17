<template>
	<view class="container-stop">
		<l-echart ref="chart"></l-echart>
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
		    breatheStopTime: {
		      type: Object,
		      default: () => ({})
		    }
		},
		methods: {
			init(){
				// var times = this.breatheStopTime.times.sort((a, b) => a - b);
				var times = []
				for(var i=0;i<this.breatheStopTime.breathStopLabel.length;i++){
					var time = this.breatheStopTime.frequency * i + this.breatheStopTime.startTime
					times.push(time)
				}
				times = times.map(timestamp => {
				  const date = new Date(timestamp);
				  const hours = date.getHours().toString().padStart(2, '0'); // 转换为两位数的小时
				  const minutes = date.getMinutes().toString().padStart(2, '0'); // 转换为两位数的分钟
				  return `${hours}:${minutes}`; // 将小时和分钟拼接为字符串
				});
				var positionTimeData = this.breatheStopTime.breathStopLabel.map((state, index) => {
				  return [times[index], state, 20];
				})
				// console.log(positionTimeData)
				var option = {
				    xAxis: {
				      type: 'category',
				      splitLine: {
				        show: false
				      }
				    },
				    title: {
				      left: 'center',
				      top:"5%",
				      text: '呼吸暂停分时图'
				    },
				    yAxis: {
				      type: 'value'
				    },
				    series: [{
				      name: 'scatter',
				      type: 'scatter',
				      itemStyle: {
				        color: 'pink' // 设置小圆圈的颜色
				      },
				      symbolSize: function (data) {
				        // data[2] 是每个数据点的第三个值，可以用来表示大小
				        return data[2];
				      },
				      data: positionTimeData // 这里的 data 应该是一个包含 [x, y, size] 数组的数组
				    }]
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
	@import "breathe_stop_time.css"
</style>