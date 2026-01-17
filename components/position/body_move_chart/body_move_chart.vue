<template>
	<view class="ec-container">
	    <view class="charts">
	    	<l-echart ref="chart" ></l-echart>
	    </view>
	</view>
</template>

<script>
	import * as echarts from 'echarts';
	export default {
		props: {
		    moveExtent: {
		      type: Object,
		      default: () => ({})
		    }
		},
		data() {
			return {
				moveData:[]
			}
		},
		methods: {
			init(){
				this.dataProcess()
				// 控制x轴显示数量
				  let xNum = 0;
				  var option = {
				    tooltip: {
				      trigger: 'axis',
				      position: function (pt) {
				        return [pt[0], '10%'];
				      },
				      show:false
				    },
				    title: {
				      left: 'center',
				      top:"5%",
				      text: '睡眠体动分时图'
				    },
				    xAxis: {
				      type: 'time',
				      boundaryGap: false,
				      min: this.moveData[0][0], // 设置X轴最小值
				      max: this.moveData[this.moveData.length-1][0], // 设置X轴最大值为次日07:00:00
				      axisLabel: {
				        formatter: function (value) {
				          // 自定义X轴标签的显示格式为小时:分钟
				          const date = new Date(value)
				          // 格式化时间为 'HH:mm'
				          const hours = date.getHours().toString().padStart(2, '0'); // 获取小时并补足为两数
				          const minutes = date.getMinutes().toString().padStart(2, '0'); // 获取分钟并补为两位数
				          const formattedTime = `${hours}:${minutes}`; // 组合成 'HH:mm' 格式的时间字符串
				          xNum++;
				          if(xNum % 2 == 0){
				            return formattedTime;
				          }else{
				            return '';
				          }
				        }
				      }
				    },
				    yAxis: {
				      type: 'value',
				      boundaryGap: [0, '100%'],
				      min: 0, // 设置Y轴最小值为0，确保只显示正数
				      max: 1 ,// 设置Y轴最大值为1
				      axisLabel: {
				      show: false // 设置为false不显示Y轴数据
				      },
				      splitLine: {
				        show: false // 不显示Y轴的背景横线
				      }
				    },
				    series: [
				      {
				        name: 'Simulated Data',
				        type: 'line',
				        smooth: false, // 设置为true使线条平滑
				        symbol: 'none',
				        areaStyle: {},
				        data: this.moveData
				      }
				    ],
				  };
				this.$refs.chart.init(echarts, chart => {
					chart.setOption(option);
				});
			},
			dataProcess(){
				const startTime = this.moveExtent.startTime;
				const frequency = this.moveExtent.frequency;
				const extents = this.moveExtent.extents;
				
				const result = extents.map((value, index) => [startTime + index * frequency, value]);
				this.moveData = result
			}
		},
		mounted() {
			this.init()
		},
	}
</script>

<style>
	@import "body_move_chart.css";
</style>
