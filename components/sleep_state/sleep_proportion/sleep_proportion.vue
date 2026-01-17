<template>
  <view class="container">
    <view class="title">睡眠占比：</view>
    <view class="charts">
      <l-echart ref="chart"></l-echart>
    </view>
    <view class="lable">
        <view class="square" style="background-color: #CC6699;"></view>
        <text class="fontset">{{ proportionList[0].name }}:{{ (proportionList[0].value * 100).toFixed(1) }}%</text>
        <view class="square" style="background-color: #66B2FF;"></view>
        <text class="fontset">{{ proportionList[1].name }}:{{ (proportionList[1].value * 100).toFixed(1) }}%</text>
        <view class="square" style="background-color: #666699;"></view>
        <text class="fontset">{{ proportionList[2].name }}:{{ (proportionList[2].value * 100).toFixed(1) }}%</text>
    </view>
    <view class="illustrate">
      <text style="display: block;">
        <text style="color: red;">REM：</text>快速眼球运动状态，是一个睡眠的阶段，眼球在此阶段会呈现不由自主的快速移动
      </text>
    </view>
  </view>
</template>

<script>
	import * as echarts from 'echarts';

	export default {
	  data() {
		return {
		  colors: ['#CC6699', '#66B2FF', '#666699']
		};
	  },
	  props: {
	  	proportionList: {
	  	  type: Array,
	  	  default: () => ([])
	  	}
	  },
	  methods: {
		init() {
		  const filteredProportionList = this.proportionList.filter(item => item.value !== 0.0);
		  const colors = ['#CC6699', '#66B2FF', '#666699', '#FFCC99', '#C2C2C2'];
		  var option = {
		  	series: [{
		  	  label: {
		  		normal: {
		  		  fontSize: 10
		  		}
		  	  },
		  	  type: 'pie',
		  	  center: ['32%', '45%'],
		  	  radius: '55%',
		  	  selectedMode: 'single',
		  	  data: filteredProportionList,
		  	  color: colors
		  	}],
		  };
		  this.$refs.chart.init(echarts, chart => {
		        chart.setOption(option);
			});
		}
	  },
	  mounted() {
		this.init()
	  }
	};
</script>

<style>
	@import "sleep_proportion.css";
</style>