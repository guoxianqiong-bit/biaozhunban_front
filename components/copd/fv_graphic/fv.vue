<template>
  <view class="report-module">
    <!-- 模块标题 -->
    <text class="module-title">2.吹气流速-实时流量（f-v）关系图</text>

    <!-- 图表容器 -->
    <view class="chart-container">
      <l-echart ref="fv"></l-echart>
    </view>

    <!-- 曲线闭合提示 -->
    <view class="curve-hint">
      <view class="hint-icon">
        <text class="red-dot">●</text>
      </view>
      <text class="hint-key">提示：</text>
      <!-- <text class="hint-text">蓝色吹气曲线与绿色吸气曲线闭合即代表吹气完全。</text> -->
	  <text class="hint-text">{{ hintMessage }}</text>

    </view>

    <!-- 当前数据分析 -->
    <view class="analysis-container">
      <view class="info-item">
        <text class="info-label">平均吹气流速</text>
        <text class="info-value">{{ avgFlowRate.toFixed(2) }} L/s</text>
      </view>

      <view class="info-item">
        <text class="info-label">最大流速对应流量</text>
        <text class="info-value">{{ maxFlowVolume.toFixed(2) }} L</text>
      </view>
      <view class="info-item">
        <text class="info-label">数据采集时长</text>
        <text class="info-value">{{ collectDuration.toFixed(2) }} s</text>
      </view>
    </view>

    <view class="result-table">
      <!-- 表头 -->
      <view class="table-row table-header">
        <text class="table-cell param">参数</text>
        <text class="table-cell unit">单位</text>
        <text class="table-cell value">预测值</text>
        <text class="table-cell value">实际值</text>
        <text class="table-cell value">%实/预</text>
      </view>

      <!-- 表格内容 -->
      <view class="table-row" v-for="(item, index) in tableData" :key="index">
        <text class="table-cell param">{{ item.name }}</text>
        <text class="table-cell unit">{{ item.unit }}</text>
        <text class="table-cell value">{{ item.pred }}</text>
        <text class="table-cell value">{{ item.actual }}</text>
        <text class="table-cell value">{{ item.percent }}</text>
      </view>
    </view>

    <!-- 数据质量提示 -->
    <template v-if="isDataAbnormal">
      <view class="section-title">图表操作提示</view>
      <view class="quality-hint-container">
        <view class="quality-hint-box">
          <view class="hint-title">
            <image class="hint-icon" src="https://icon-library.com/images/warning-icon/warning-icon-10.jpg" />
            <text>注意</text>
          </view>
          <view class="hint-text">
            若数据未能显示，请点击相关图。点击图表可以看到相关点的数据。
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "fv",
  props: {
    FVC: { type: Number, default: 1 },
    FEV1: { type: Number, default: 1 },
    FEV1FVC: { type: Number, default: 1 },
    FVCPred: { type: Number, default: 1 },
    FEV1Pred: { type: Number, default: 1 },
    FEV1FVCPred: { type: Number, default: 1 },

    flowRatesRaw: { type: Array, default: () => [] },
    flowRates: { type: Array, default: () => [] },
    realTimeVolume: { type: Array, default: () => [] },
    frequency: { type: Number, default: 100 },
    abnormalThreshold: { type: Number, default: 0.1 },

    PEF: { type: Number, default: 1 },
    FEF25: { type: Number, default: 1 },
    FEF50: { type: Number, default: 1 },
    FEF75: { type: Number, default: 1 },
    FEF2575: { type: Number, default: 1 },

    PEF_pred: { type: Number, default: 10.27 },
    FEF25_pred: { type: Number, default: 8.75 },
    FEF50_pred: { type: Number, default: 5.8 },
    FEF75_pred: { type: Number, default: 2.79 },
    FEF2575_pred: { type: String, default: "-" }
  },
  data() {
    return {
      chartDataPos: [],   // y >= 0 的数据（蓝色）
      chartDataNeg: [],   // y < 0 的数据（绿色）
      filteredFlowRates: [],
      filteredVolume: [],
      chartInstance: null,
      useMockData: false,
      mockFlowRates: [],
      mockVolume: [],
      mockFrequency: 100
    };
  },
  watch: {
    realTimeVolume: {
      immediate: true,
      deep: true,
      handler() {
        if (
          !Array.isArray(this.flowRates) ||
          !Array.isArray(this.realTimeVolume) ||
          this.flowRates.length === 0 ||
          this.realTimeVolume.length === 0
        )
          return;
        this.useMockData = false;
        this.calculateMetricsAndChartData();
        this.$nextTick(() => setTimeout(this.initChart, 500));
      }
    },
    flowRates: {
      immediate: true,
      deep: true,
      handler() {
        if (
          !Array.isArray(this.flowRates) ||
          !Array.isArray(this.realTimeVolume) ||
          this.flowRates.length === 0 ||
          this.realTimeVolume.length === 0
        )
          return;
        this.useMockData = false;
        this.calculateMetricsAndChartData();
        this.$nextTick(() => setTimeout(this.initChart, 500));
      }
    }
  },
  computed: {
    tableData() {
      return [
        {
          name: "FVC",
          unit: "L",
          pred: this.FVCPred.toFixed(2),
          actual: this.FVC.toFixed(2),
          percent: ((this.FVC / this.FVCPred) * 100).toFixed(1)
        },
        {
          name: "FEV1",
          unit: "L",
          pred: this.FEV1Pred.toFixed(2),
          actual: this.FEV1.toFixed(2),
          percent: ((this.FEV1 / this.FEV1Pred) * 100).toFixed(1)
        },
        {
          name: "FEV1/FVC",
          unit: "%",
          pred: this.FEV1FVCPred.toFixed(2),
          actual: this.FEV1FVC.toFixed(2),
          percent: ((this.FEV1FVC / this.FEV1FVCPred) * 100).toFixed(1)
        },
        {
          name: "PEF",
          unit: "L/s",
          pred: this.PEF_pred.toFixed(2),
          actual: this.PEF.toFixed(2),
          percent: ((this.PEF / this.PEF_pred) * 100).toFixed(1)
        },
        {
          name: "FEF25",
          unit: "L/s",
          pred: this.FEF25_pred.toFixed(2),
          actual: this.FEF25.toFixed(2),
          percent: ((this.FEF25 / this.FEF25_pred) * 100).toFixed(1)
        },
        {
          name: "FEF50",
          unit: "L/s",
          pred: this.FEF50_pred.toFixed(2),
          actual: this.FEF50.toFixed(2),
          percent: ((this.FEF50 / this.FEF50_pred) * 100).toFixed(1)
        },
        {
          name: "FEF75",
          unit: "L/s",
          pred: this.FEF75_pred.toFixed(2),
          actual: this.FEF75.toFixed(2),
          percent: ((this.FEF75 / this.FEF75_pred) * 100).toFixed(1)
        },
        {
          name: "FEF25–75",
          unit: "L/s",
          pred: this.FEF2575_pred,
          actual: this.FEF2575.toFixed(2),
          percent: "-"
        }
      ];
    },

    totalVolume() {
      if (this.filteredVolume.length === 0) return 0;
      return Math.max(...this.filteredVolume);
    },
    maxFlowVolume() {
      if (this.filteredFlowRates.length === 0 || this.filteredVolume.length === 0)
        return 0;
      const maxFlowIndex = this.filteredFlowRates.indexOf(
        Math.max(...this.filteredFlowRates)
      );
      return this.filteredVolume[maxFlowIndex] || 0;
    },
    collectDuration() {
      if (this.flowRatesRaw.length === 0 || this.frequency <= 0) return 0;
      return this.flowRatesRaw.length / this.frequency;
    },

    // 只对 >0 的值求平均
    avgFlowRate() {
      if (this.realTimeVolume.length === 0) return 0;
      const positives = this.realTimeVolume.filter(v => v > 0);
      if (positives.length === 0) return 0;
      const sum = positives.reduce((a, b) => a + b, 0);
      return sum / positives.length;
    },

    isDataAbnormal() {
      const rawLength = Math.max(
        this.flowRates.length,
        this.realTimeVolume.length
      );
      const validLength = this.filteredFlowRates.length;
      if (rawLength === 0) return false;
      const abnormalRatio = (rawLength - validLength) / rawLength;
      return abnormalRatio >= this.abnormalThreshold;
    },
	hintMessage() {
	  if (!Array.isArray(this.realTimeVolume) || this.realTimeVolume.length === 0) {
	    return "数据不足，无法判断曲线闭合情况。";
	  }
	
	  // 绿色吸气曲线终点的体积（realTimeVolume 最后一个点）
	  // const lastVol = this.realTimeVolume[this.realTimeVolume.length - 1];
	  const lastVol = this.chartDataNeg[this.chartDataNeg.length - 1][0];
	  console.log("sss",lastVol)
	  // === 判断逻辑 ===
	  if (lastVol > 0.1) {
	    return "观察到吸气不够完全，提示存在提前松口或吸气不充分。";
	  }
	
	  if (lastVol < -0.1) {
	    return "观察到呼气末残气量残留，提示存在呼气不完全。";
	  }
	
	  // lastVol === 0
	  return "吹气与吸气曲线完全闭合，表明测试过程中呼吸周期完整，无显著气体陷闭或代偿性吸气。";
	},

  },
  methods: {
    // 允许负值（只过滤 NaN / Infinity）
    filterInvalidData(flowArr, volumeArr) {
      const filteredFlow = [];
      const filteredVol = [];
      const minLength = Math.min(flowArr.length, volumeArr.length);

      for (let i = 0; i < minLength; i++) {
        const flow = Number(flowArr[i]);
        const vol = Number(volumeArr[i]);
        if (Number.isFinite(flow) && Number.isFinite(vol)) {
          filteredFlow.push(flow);
          filteredVol.push(vol);
        }
      }

      this.filteredFlowRates = filteredFlow;
      this.filteredVolume = filteredVol;
      return { filteredFlow, filteredVol };
    },

    calculateMetricsAndChartData() {
      this.chartDataPos = [];
      this.chartDataNeg = [];
      this.filteredFlowRates = [];
      this.filteredVolume = [];

      const { flowArr, volArr } = this.useMockData
        ? { flowArr: this.mockFlowRates, volArr: this.mockVolume }
        : { flowArr: this.flowRates, volArr: this.realTimeVolume };

      if (
        !Array.isArray(flowArr) ||
        !Array.isArray(volArr) ||
        flowArr.length === 0 ||
        volArr.length === 0
      )
        return;

      const { filteredFlow, filteredVol } = this.filterInvalidData(
        flowArr,
        volArr
      );

      // 拆成两条线：>=0 和 <0
      this.chartDataPos = filteredVol.map((vol, index) => {
        const f = filteredFlow[index];
        return [vol, f >= 0 ? f : null];
      });

      this.chartDataNeg = filteredVol.map((vol, index) => {
        const f = filteredFlow[index];
        return [vol, f < 0 ? f : null];
      });
	  this.chartDataNeg=this.chartDataNeg.filter(item => item[1] !== null);
	  if(this.chartDataNeg[this.chartDataNeg.length - 1][0]>0.25){
		this.chartDataNeg=this.stretchXToOrigin(this.chartDataNeg)
	  }
	  console.log("sdddsdd",this.chartDataNeg)
    },
    stretchXToOrigin(data) {
      if (!Array.isArray(data) || data.length < 2) return data;
    
      const [x0] = data[0];
      const [xN] = data[data.length - 1];
    
      // 避免除零：如果首尾 x 一样，就没法拉伸
      const denom = (xN - x0);
      if (Math.abs(denom) < 1e-12) {
        return data.map(([x, y]) => [x, y]);
      }
    
      // 自动计算拉伸系数：让末点 x' = 0
      const a = (-x0) / denom;
    
      return data.map(([x, y]) => {
        const xNew = x0 + a * (x - x0);
        return [xNew, y]; // y 不变
      });
    },
    initChart() {
      if (this.chartInstance) this.chartInstance.dispose();

      // === 1. 先计算黑色预测折线各个点 ===
      const x3 = this.FVCPred * 0.25;
      const x4 = this.FVCPred * 0.5;
      const x5 = this.FVCPred * 0.75;
      const x6 = this.FVCPred;

      const y3 = this.FEF25_pred;
      const y4 = this.FEF50_pred;
      const y5 = this.FEF75_pred;

      const dx = x4 - x3;
      const dy = y4 - y3;

      let x2 = 0;
      if (dx !== 0 && dy !== 0) {
        // 用第 3、4 个点斜率反推到 y = PEF_pred 的交点
        const k34 = dy / dx;
        x2 = x3 + (this.PEF_pred - y3) / k34;
      } else {
        // 退化：3、4 点重合或水平线，给一个接近 x3 的兜底值
        x2 = x3 * 0.8;
      }

      // 黑线所有 x、y，用来参与坐标轴范围计算
      const predictXs = [0, x2, x3, x4, x5, x6];
      const predictYs = [0, this.PEF_pred, y3, y4, y5, 0];

      // === 2. 坐标轴范围：原始数据 + 预测折线 一起考虑 ===
      const baseFlowVals = this.filteredFlowRates.length
        ? this.filteredFlowRates
        : [];
      const baseVolVals = this.filteredVolume.length
        ? this.filteredVolume
        : [];

      let flowVals = baseFlowVals.concat(predictYs).filter(v => Number.isFinite(v));
      let volVals = baseVolVals.concat(predictXs).filter(v => Number.isFinite(v));

      if (flowVals.length === 0) flowVals = [0];
      if (volVals.length === 0) volVals = [0];

      const flowMinRaw = Math.min(...flowVals);
      const flowMaxRaw = Math.max(...flowVals);
      const volMinRaw = Math.min(...volVals);
      const volMaxRaw = Math.max(...volVals);

      // 允许负值，支持四象限
      const padRange = (min, max) => {
        const range = max - min;
        if (!isFinite(range) || range <= 0) {
          const base = max || min || 1;
          return [base * -1.2, base * 1.2];
        }
        const pad = range * 0.05;
        return [min - pad, max + pad];
      };

      let [xMin0, xMax0] = padRange(volMinRaw, volMaxRaw);
      let [yMin0, yMax0] = padRange(flowMinRaw, flowMaxRaw);

      const chooseSplits = range => {
        if (range <= 1) return 5;
        if (range <= 5) return 5;
        if (range <= 10) return 6;
        if (range <= 20) return 6;
        if (range <= 50) return 7;
        return 8;
      };
      const xTargetSplits = chooseSplits(xMax0 - xMin0);
      const yTargetSplits = chooseSplits(yMax0 - yMin0);

      const niceStep = (range, targetSplits) => {
        if (!isFinite(range) || range <= 0) return 1;
        const raw = range / Math.max(1, targetSplits);
        const power = Math.floor(Math.log10(raw));
        const base = Math.pow(10, power);
        const candidates = [1, 2, 2.5, 5, 10];
        let step = candidates[candidates.length - 1] * base;
        for (const c of candidates) {
          const s = c * base;
          if (raw <= s) {
            step = s;
            break;
          }
        }
        return step;
      };

      const alignRangeWithStep = (min0, max0, targetSplits) => {
        const step = niceStep(max0 - min0, targetSplits);
        const minAligned = Math.floor(min0 / step) * step;
        const maxAligned = Math.ceil(max0 / step) * step;
        const stepStr = step.toString();
        let prec = 0;

        if (stepStr.includes("e-")) {
          prec = parseInt(stepStr.split("e-")[1], 10) || 0;
        } else if (stepStr.includes(".")) {
          prec = stepStr.split(".")[1].length;
        }

        const splits = Math.max(
          1,
          Math.round((maxAligned - minAligned) / step)
        );
        return {
          min: Number(minAligned.toFixed(prec)),
          max: Number(maxAligned.toFixed(prec)),
          step: Number(step.toFixed(prec)),
          splits,
          prec
        };
      };

      const X = alignRangeWithStep(xMin0, xMax0, xTargetSplits);
      const Y = alignRangeWithStep(yMin0, yMax0, yTargetSplits);

      // 用一个中间刻度来估算刻度字符串长度，动态 nameGap
      let midLabelValue = 0;
      const rangeY = Y.max - Y.min;
      if (rangeY > 0) {
        const step = Y.step || rangeY / 5;
        const mid1 = Y.min + rangeY / 2;
        const mid2 = Y.min + step * Math.floor(rangeY / (2 * step));
        midLabelValue = Math.max(mid1, mid2);
      } else {
        midLabelValue = Y.max;
      }

      const labelStr = Math.abs(midLabelValue).toFixed(Y.prec);
      const hasDot = labelStr.includes(".");
      const numCount = labelStr.replace(".", "").length;
      const dynamicNameGap = 3 + numCount * 3 + (hasDot ? 1 : 0);

      // === 3. 组装图表配置 ===
      const chartOption = {
        backgroundColor: "#fff",
        grid: {
          left: "2%",
          right: "3%",
          bottom: "6%",
          top: "5%",
          containLabel: true
        },

        // 右下角添加一行式图例（带线段图标）
        graphic: {
          elements: [
            // 背景框（一行布局）
            {
              type: 'rect',
              right: '3%',    // 右对齐
              bottom: '6%',   // 底部对齐
              width: 220,     // 宽度适配一行内容
              height: 20,     // 高度适配单行
              fill: 'rgba(255, 255, 255, 0.8)',
              stroke: '#ddd',
              borderRadius: 3,
              z: 100
            },
            
            // 蓝色折线图标
            {
              type: 'line',
              right: '115px',  // 右侧定位
              bottom: '11%',
              shape: {
                x1: 0, y1: 0,
                x2: 10, y2: 0  // 水平短线段
              },
              style: {
                stroke: '#007aff',
                lineWidth: 2
              },
              z: 101
            },
            // 蓝色折线文字
            {
              type: 'text',
              right: '95px',
              bottom: '11%',
              style: {
                text: '吹气曲线',
                fontSize: 5,  // 缩小字体
                fill: '#666'
              },
              z: 101
            },
            
            // 绿色折线图标
            {
              type: 'line',
              right: '75px',
              bottom: '11%',
              shape: {
                x1: 0, y1: 0,
                x2: 10, y2: 0
              },
              style: {
                stroke: '#00AA00',
                lineWidth: 2
              },
              z: 101
            },
            // 绿色折线文字
            {
              type: 'text',
              right: '55px',
              bottom: '11%',
              style: {
                text: '吸气曲线',
                fontSize: 5,
                fill: '#666'
              },
              z: 101
            },
            
            // 黑色折线图标
            {
              type: 'line',
              right: '35px',
              bottom: '11%',
              shape: {
                x1: 0, y1: 0,
                x2: 10, y2: 0
              },
              style: {
                stroke: '#000000',
                lineWidth: 2
              },
              z: 101
            },
            // 黑色折线文字
            {
              type: 'text',
              right: '15px',
              bottom: '11%',
              style: {
                text: '预测曲线',
                fontSize: 5,
                fill: '#666'
              },
              z: 101
            }
          ]
        },

        xAxis: {
          type: "value",
          name: "实时流量 (L)",
          nameLocation: "center",
          nameTextStyle: { color: "#666", fontSize: 6 },
          nameGap: 12,
          min: X.min,
          max: X.max,
          interval: X.step,
          splitNumber: X.splits,
          axisLine: { lineStyle: { color: "#aaa" } },
          axisTick: { show: true, length: 4, inside: true },
          axisLabel: {
            color: "#666",
            fontSize: 6,
            margin: 2,
            formatter: v => Number(Number(v).toFixed(X.prec))
          },
          splitLine: { lineStyle: { color: "rgba(0,0,0,0.05)" } }
        },

        yAxis: {
          type: "value",
          name: "流速 (L/s)",
          nameLocation: "center",
          nameTextStyle: { color: "#666", fontSize: 6 },
          nameGap: dynamicNameGap,
          min: Y.min,
          max: Y.max,
          interval: Y.step,
          splitNumber: Y.splits,
          axisLine: { lineStyle: { color: "#aaa" } },
          axisTick: { show: true, length: 4, inside: true },
          axisLabel: {
            color: "#666",
            fontSize: 6,
            margin: 2,
            formatter: v => Number(Number(v).toFixed(Y.prec))
          },
          splitLine: { lineStyle: { color: "rgba(0,0,0,0.08)" } }
        },

        tooltip: {
          trigger: "item",
          triggerOn: "click",
          formatter: params => {
            const [volume, flow] = params.value;
            const seriesName = params.seriesName || "";

            let label = "吹气流速";
            if (seriesName.includes("预测")) {
              label = "预测流速";
            } else if (seriesName.includes("负")) {
              label = "吹气流速(负)";
            }

            return `系列：${seriesName}\n` +
                   `实时流量：${Number(volume).toFixed(3)} L\n` +
                   `${label}：${Number(flow).toFixed(3)} L/s`;
          },
          backgroundColor: "rgba(0,0,0,0.7)",
          textStyle: {
            color: "#fff",
            fontSize: 10,
            lineHeight: 14
          },
          padding: [4, 6],
          confine: true,
          extraCssText: "border-radius:3px;box-shadow:none;"
        },

        series: [
          // 蓝色正流速折线
          {
            id: "flow-volume-line-pos",
            name: "吹气曲线(正)",
            type: "line",
            data: this.chartDataPos,
            smooth: false,
            showSymbol: true,
            symbolSize: 6,
            itemStyle: {
              opacity: 0
            },
            emphasis: {
              itemStyle: {
                opacity: 1
              }
            },
            hoverAnimation: false,
            lineStyle: {
              width: 2,
              color: "#007aff",
              shadowColor: "rgba(0,122,255,0.3)",
              shadowBlur: 3
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(0,122,255,0.3)" },
                { offset: 1, color: "rgba(0,122,255,0.05)" }
              ])
            }
          },

          // 绿色负流速折线
          {
            id: "flow-volume-line-neg",
            name: "吸气曲线(负)",
            type: "line",
            data: this.chartDataNeg,
            smooth: false,
            showSymbol: true,
            symbolSize: 6,
            itemStyle: {
              opacity: 0
            },
            emphasis: {
              itemStyle: {
                opacity: 1
              }
            },
            hoverAnimation: false,
            lineStyle: {
              width: 2,
              color: "#00AA00"
            }
          },

          // 黑色预测折线（保留可见点）
          {
            id: "predict-line",
            name: "预测曲线",
            type: "line",
            smooth: false,
            showSymbol: true,
            symbolSize: 5,
            hoverAnimation: false,
            lineStyle: {
              width: 2,
              color: "#000000"
            },
            data: [
              [0, 0],
              [x2, this.PEF_pred],
              [x3, this.FEF25_pred],
              [x4, this.FEF50_pred],
              [x5, this.FEF75_pred],
              [x6, 0]
            ]
          }
        ]

      };

      this.$refs.fv.init(echarts, chart => {
        this.chartInstance = chart;
        chart.setOption(chartOption, true);
        if (typeof window !== "undefined") {
          window.addEventListener("resize", () => chart.resize());
        }
      });
    }
  },
  mounted() {
    this.calculateMetricsAndChartData();
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  }
};
</script>

<style scoped>
/* 样式保持不变 */
@import "fv.css";
@import "../../../pages/copd/report/report.css";

.chart-container {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid #e5e5e5;
  padding: 8rpx;
  box-sizing: border-box;
}

/* 曲线闭合提示样式优化 - 确保在同一行 */
.curve-hint {
  margin: 16rpx 0;
  padding: 12rpx 16rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  border-left: 4rpx solid #e53935;
  white-space: nowrap; /* 防止换行 */
  flex-wrap: nowrap; /* 不允许折行 */
}

.hint-icon {
  margin-right: 0px;
  display: flex;
  align-items: center;
}

.red-dot {
  font-size: 24rpx;
  color: #e53935;
  line-height: 1;
}

.hint-key {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-right: 8rpx;
  line-height: 1;
}

.hint-text {
  font-size: 26rpx;
  margin-bottom: 0px;
  color: #666;
  line-height: 1;
  flex: 1; /* 文本占满剩余空间 */
  white-space: normal; /* 允许文本自然换行 */
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #e6e6e6;
  background-color: #fff;
  border-radius: 12rpx;
  margin-top: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.table-row {
  display: flex;
  border-radius: 12rpx;
  border-bottom: 1rpx solid #e6e6e6;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-header {
  background-color: #f7f9fb;
  font-weight: bold;
}

.table-cell {
  flex: 1;
  text-align: center;
  padding: 10rpx 0;
  font-size: 26rpx;
  color: #333;
}

.param {
  flex: 1.2;
}

.unit {
  flex: 0.8;
  color: #666;
}

.value {
  flex: 1;
  color: #007aff;
  font-weight: 500;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
  color: #333;
}
</style>