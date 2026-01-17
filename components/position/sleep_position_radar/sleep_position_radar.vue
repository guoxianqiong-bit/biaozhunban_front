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
		    proportionList: {
		      type: Array,
		      default: () => ([])
		    }
		},
		data() {
			return {
				
			}
		},
		methods: {
			init() {
			  let sleepClassData = this.proportionList
			  // 对数据进行预处理，设置labelLine
			  sleepClassData = sleepClassData.map(item => ({
				name: item.name,
				value: item.value,
				labelLine: { show: item.value > 0 } // 仅对非零值显示指示线
			  }));
			 var option = {
					backgroundColor: 'rgba(255,255,255,0.8)',
					title: { // 添加标题
					  text: '睡眠体位占比', // 标题文本
					  left: 'center', // 标题位置
					  top:'2%',
					  textStyle: {
						fontSize: 15, // 设置标题字体大小
					  }
					},
					tooltip: {
					  trigger: 'item',
					  formatter: '{a} <br/>{b}: {c} ({d}%)',
					  show:false
					},
					legend: {
					  show: true,
					  top: '15%',
					  left: 'center',
					  data: sleepClassData.map(item => item.name)
					},
					series: [{
					  name: '睡眠分类',
					  type: 'pie',
					  center: ['50%', '60%'],
					  radius: ['20%', '30%'],
					  label: {
						normal: {
						  formatter: function(params) {
							return params.value > 0 ? `${params.name}: ${params.percent.toFixed(2)}%` : '';
						  },
						  fontSize: 14
						}
					  },
					  data: sleepClassData
					}],
				  };
				  option.silent = true;
			  this.$refs.chart.init(echarts, chart => {
					chart.setOption(option);
				});
			}
		},
		mounted() {
			this.init()
		},
	}
</script>

<style>
	@import "sleep_position_radar.css";
</style>
