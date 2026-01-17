<template>
  <view class="container1">
    <view class="title1">睡眠分析：</view>
    <view class="charts1">
		<l-echart ref="chart"></l-echart>
    </view>
    <view class="illustrate">
      <text style="display: block;">
        <text style="color: red;">总睡眠间期时间：</text>{{stateInfo.totalIntervalSleepTime.toFixed(1)}}分钟
      </text>
      <text style="display: block;margin-top: 2px;">
        <text style="color: red;">REM持续时间: </text>{{stateInfo.remtime.toFixed(1)}}分钟
      </text>
      <text style="display: block;margin-top: 12px;">
        <text style="color: red;">总睡眠间期时间：</text>从入睡开始到最后一个睡眠周期结束的总时间
      </text>
      <text style="display: block;margin-top: 2px;">
        <text style="color: red;">总睡眠时间：</text>总睡眠间期时间减去之中觉醒时间
      </text>
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
      stateInfo: {
        type: Object,
        default: () => ({})
      }
  },
  methods: {
    init() {
	  var value_real = [this.stateInfo.totalTime, this.stateInfo.awakeNum, this.stateInfo.fallAsleepTime, 
				   this.stateInfo.deepSleepTime, this.stateInfo.lightSleepTime]
	  var option = {
	      legend: {
	        data: ['当前睡眠分析', '良好睡眠参照'],
	        orient: 'horizontal',
	        x: 'center',
	        y: 'top',
	        itemGap: 30,
	        itemHeight: 8,
	        textStyle: {
	          fontSize: '10px',
	          fontWeight: 'bold', // 设置字体加粗
	        }
	      },
	      radar: {
	        indicator: [
	          { name: '总睡眠时间', max: 500 },
	          { name: '觉醒次数', max: 20 },
	          { name: '入眠时间', max: 30 },
	          { name: '熟睡持续时间', max: 300 },
	          { name: '浅睡持续时间', max: 300 },
	        ],
	        center: ['30%', '60%'],
	        radius: 45,
	        shape: 'circle',
	        splitNumber: 5,
	        name: {
	          textStyle: {
	            color: 'black',
	            fontSize: 8
	          }
	        },
	        splitLine: {
	          lineStyle: {
	            color: [
	              'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.2)',
	              'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.6)',
	              'rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 1)'
	            ].reverse()
	          }
	        },
	        splitArea: {
	          areaStyle: {
	            color: ['#99CCFF', '#99CCFF', '#99CCFF', '#428BD4'],
	          }
	        },
	        axisLine: {
	          lineStyle: {
	            color: 'rgba(255, 255, 255, 0.5)'
	          }
	        }
	      },
	      series: [{
	        type: 'radar',
	        data: [
	          {
	            value: value_real,
	            name: '当前睡眠分析',
	            symbolSize: 4,
	            areaStyle: {
	              color: '#66CCCC'
	            },
	            itemStyle: {
	              normal: {
	                color: '#66CCCC'
	              }
	            },
	            label: {
	              normal: {
	                show: true,
	                fontSize: 8,
	                color: '#660033',
	              }
	            }
	          },
	          {
	            value: [400, 2, 8, 200, 100],
	            name: '良好睡眠参照',
	            symbolSize: 4,
	            areaStyle: {
	              color: '#CCFF66'
	            },
	            itemStyle: {
	              normal: {
	                color: '#CCFF66',
	              }
	            }
	          }
	        ]
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
};
</script>

<style scoped>
@import "sleep_analysis.css";
</style>