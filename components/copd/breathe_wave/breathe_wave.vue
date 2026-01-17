<template>
  <view class="report-module">
    <!-- 模块标题 -->
    <text class="module-title">2. 呼吸波形监测</text>

    <!-- 呼吸波形卡片 -->
    <view class="spo2-card breath-card">
      <l-echart ref="waveChart" style="height: 240px;"></l-echart>
    </view>

    <!-- 分析说明 -->
    <view class="analysis-box">
      <text class="analysis-title">分析：</text> 
      <text class="analysis-content">
        呼吸波形呈规律性，幅值约 {{ amplitude }} L/s，频率约 {{ frequency }} Hz。若波形异常或幅值明显下降，建议进一步检查呼吸功能。
      </text>
    </view>
  </view>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "BreatheWave",
  data() {
    return {
      chartData: [],
      timeInterval: 0.1,
      maxTime: 10,
      amplitude: 1.5,
      frequency: 0.2,
    };
  },
  methods: {
    generateWaveData() {
      const totalPoints = this.maxTime / this.timeInterval;
      this.chartData = [];
      for (let i = 0; i <= totalPoints; i++) {
        const time = (i * this.timeInterval).toFixed(2);
        const value = (
          this.amplitude *
          Math.sin(2 * Math.PI * this.frequency * i * this.timeInterval)
        ).toFixed(2);
        this.chartData.push([parseFloat(time), parseFloat(value)]);
      }
    },
    initChart() {
      const option = {
        xAxis: {
          type: "value",
          min: 0,
          max: this.maxTime,
          axisLine: { lineStyle: { color: "#aaa" } },
          splitLine: { lineStyle: { type: "dashed", color: "#ddd" } },
          name: "时间 (s)",
          nameLocation: "center",
          nameGap: 25,
        },
        yAxis: {
          type: "value",
          min: -Math.ceil(this.amplitude * 1.2),
          max: Math.ceil(this.amplitude * 1.2),
          axisLine: { lineStyle: { color: "#aaa" } },
          splitLine: { lineStyle: { type: "dashed", color: "#ddd" } },
          name: "呼吸流量 (L/s)",
          nameLocation: "center",
          nameGap: 35,
        },
        series: [
          {
            type: "line",
            data: this.chartData,
            smooth: true,
            showSymbol: false,
            lineStyle: { color: "#66ccff", width: 2 },
            areaStyle: {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "#66ccff" },
                  { offset: 1, color: "#cceeff" },
                ],
              },
            },
          },
        ],
        tooltip: { trigger: "axis" },
        grid: {
          left: "12%",
          right: "12%",
          top: "18%",
          bottom: "18%",
        },
      };

      this.$refs.waveChart.init(echarts, (chart) => {
        chart.setOption(option);
      });
    },
  },
  mounted() {
    this.generateWaveData();
    this.initChart();
  },
};
</script>

<style scoped>
@import "../../../pages/copd/report/report.css";

/* 统一卡片样式，增加 padding */
.spo2-card {
  background-color: #ffffff;
  padding: 16px; /* 增加内边距 */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

/* 呼吸模块额外样式，如果需要 */
.breath-card {
  padding: 16px;
}

.analysis-box {
  margin-top: 12px;
}
</style>
