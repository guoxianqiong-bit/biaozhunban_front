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
		    positionTime: {
		      type: Object,
		      default: () => ({})
		    }
		},
		data() {
			return {
				positionTimeData:{}
			}
		},
		methods: {
			init(){
				this.dataProcess()
				var option = {
				    title: {
				      text: '睡眠体位分时图',
				      left: 'center', // 标题位置
				      top:'5%'
				    },
				    tooltip: {
				      trigger: 'axis',
				      show:false
				    },
				    grid: {
				      left: '3%',
				      right: '4%',
				      bottom: '3%',
				      containLabel: true
				    },
				    xAxis: {
				      type: 'category',
				      boundaryGap: false, // 两边留白
				      data: this.positionTimeData.xData, // X 轴的标签数据
				    },
				    yAxis: {
				      type: 'category', // 类别轴
				      data: ['  ', '左侧','仰卧', '右侧', '俯卧','直立'], // Y 轴的类别数据
				      boundaryGap: false,// 类别轴不留白
				      axisLabel: {
				        interval: 0, // 设置标签全部显示
				        margin: 2 // 调整标签之间的间距
				      }
				    },
				    series: [
				      {
				        name: '睡眠体位',
				        type: 'line',
				        step: 'end',
				        symbol:'',
				        lineStyle: { // 加粗折线
				          width: 3
				        },
				        data: this.positionTimeData.yIndex, // Y 轴数据索引，对应上面的类别
				        // 由于 Y 轴现在是类别轴，这里的数值应当是类别的索引
				      }
				    ]
				  };
				this.$refs.chart.init(echarts, chart => {
					chart.setOption(option);
				});
			},
			dataProcess(){
				const data = ['  ', '左侧','仰卧', '右侧', '俯卧','直立']
				const timeStrings = this.positionTime.times.map(timestamp => {
				  const date = new Date(timestamp);
				  const hours = date.getHours().toString().padStart(2, '0'); // 转换为两位数的小时
				  const minutes = date.getMinutes().toString().padStart(2, '0'); // 转换为两位数的分钟
				  return `${hours}:${minutes}`; // 将小时和分钟拼接为字符串
				});
				const indices = this.positionTime.position.map(pos => data.indexOf(pos));
				this.positionTimeData.xData = timeStrings
				this.positionTimeData.yIndex = indices
			},
		},
		mounted() {
			this.init()
		},
	}
</script>

<style>
	@import "position_time_chart.css";
</style>
