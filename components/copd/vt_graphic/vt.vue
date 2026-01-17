<template>
  <view class="report-module">
    <!-- 模块标题：体积-时间关系图 -->
    <text class="module-title">3.实时流量-时间（v-t）关系图</text>
    
    <!-- 图表容器（复用l-echart组件，与原组件结构一致） -->
    <view class="chart-container">
      <!-- 加载态提示（避免空图表闪烁） -->
      <view class="loading" v-if="chartData.length === 0">
        <text>数据加载中...</text>
      </view>
      <l-echart ref="vt" v-else></l-echart>
    </view>

    <!-- 当前数据分析：新增时间相关指标，保留核心统计项 -->
	<!-- 前端算的值 -->
    <view class="analysis-container">
	 <view class="info-item">
	   <text class="info-label">平均体积增长速率</text>
	   <text class="info-value">{{ avgVolumeRate.toFixed(2) }} L/s</text>
	 </view>
     <view class="info-item">
        <text class="info-label">用力肺活量（FVC）</text>
        <text class="info-value">{{ totalVolume.toFixed(2) }} L</text>
      </view>
	  <view class="info-item">
	    <text class="info-label">第一秒用力呼气量(FEV1)</text>
	    <text class="info-value">{{ FEV1.toFixed(2) }} L</text>
	  </view>
	  <view class="info-item">
	    <text class="info-label">一秒率(FEV1/FVC)</text>
	    <text class="info-value">{{ (FEV1FVC*100).toFixed(2) }}%</text> 
	  </view>

      <!-- 数据质量提示（复用原组件逻辑，仅异常时显示） -->
      <template v-if="isDataAbnormal">
        <view class="section-title">数据质量提示</view>
        <view class="quality-hint-container">
          <view class="quality-hint-box">
            <view class="hint-title">
              <image class="hint-icon" src="https://icon-library.com/images/warning-icon/warning-icon-10.jpg" />
              <text>注意</text>
            </view>
            <view class="hint-text">
              若数据未能显示，请点击图表区域查看实时数据；若数据波动异常，建议重新采集。
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "vt", // 组件名：体积-时间图（Volume-Time）
  // 接收父组件参数：核心为realTimeVolume（体积数组），采样频率固定100组/秒
  props: {
    realTimeVolume: {
      type: Array,
      default: () => [] // 实时体积数组（单位：L），100组/秒
    },
    sampleFrequency: {
      type: Number,
      default: 500 // 固定采样频率（100组/秒，与需求一致）
    },
    abnormalThreshold: {
      type: Number,
      default: 0.1 // 异常数据占比超10%则提示（复用原组件阈值）
    },
	FVC: {
		type:Number,
		default:1
	},
	FEV1: {
		type:Number,
		default:1
	},
	FEV1FVC: {
		type:Number,
		default:1
	}
  },
  data() {
    return {
      chartData: [], // 图表渲染数据（格式：[[time, volume], ...]，时间单位：s）
      filteredVolume: [], // 过滤后的体积数组（剔除无效值）
      chartInstance: null, // ECharts实例（避免重复初始化）
      useMockData: false, // 是否使用模拟数据（测试用）
      mockVolume: [], // 模拟体积数据
      mockFrequency: 100 // 模拟采样频率（与真实一致）
    };
  },
  // 监听体积数组变化：数据更新时立即处理（优化原组件逻辑，避免重复代码）
  watch: {
    realTimeVolume: {
      immediate: true, // 组件初始化时执行一次
      deep: true, // 深度监听数组内部元素变化
      handler(newVolumeArr) {
        // 1. 过滤空数据/非数组情况
        if (!Array.isArray(newVolumeArr) || newVolumeArr.length === 0) {
          console.warn("体积数据无效：非数组或长度为空");
          this.chartData = [];
          return;
        }

        this.useMockData = false; // 明确使用真实数据
        this.calculateMetricsAndChartData(); // 计算指标和图表数据

        // 2. 初始化/更新图表（确保DOM就绪后执行）
        this.$nextTick(() => {
            setTimeout(() => this.initChart(), 300); // 延迟初始化：避免DOM未渲染
        });
      }
    }
  },
  // 计算属性：针对体积-时间图的核心统计指标
  computed: {
    // 1. 总实时流量（取过滤后体积的最终值，即累积总量）
    totalVolume() {
      if (this.filteredVolume.length === 0) return 0;
      return this.filteredVolume[this.filteredVolume.length - 1] || 0;
    },
    // 2. 平均体积增长速率（总增量 / 采集时长）
    avgVolumeRate() {
      if (this.filteredVolume.length < 2 || this.collectDuration <= 0) return 0;
      const volumeIncrement = this.totalVolume - this.filteredVolume[0]; // 体积总增量
      return volumeIncrement / this.collectDuration;
    },
    // 3. 最大瞬时体积（过滤后体积的最大值）
    maxVolume() {
      if (this.filteredVolume.length === 0) return 0;
      return Math.max(...this.filteredVolume);
    },
    // 4. 实际采集时长（有效数据长度 / 采样频率，100组=1秒）
    collectDuration() {
      if (this.filteredVolume.length === 0 || this.sampleFrequency <= 0) return 0;
      return this.filteredVolume.length / this.sampleFrequency;
    },
    // 5. 数据是否异常（复用原组件逻辑：异常占比超阈值）
    isDataAbnormal() {
      const rawLength = this.realTimeVolume.length;
      const validLength = this.filteredVolume.length;
      if (rawLength === 0) return false;
      const abnormalRatio = (rawLength - validLength) / rawLength;
      return abnormalRatio >= this.abnormalThreshold;
    }
  },
  methods: {
    /**
     * 数据预处理：过滤体积数组中的无效值（负数、NaN、非数值）
     * @param {Array} volumeArr - 原始体积数组
     * @returns {Array} 过滤后的有效体积数组
     */
    filterInvalidData(volumeArr) {
      const filtered = [];
      for (const val of volumeArr) {
        const volume = Number(val);
        // 过滤条件：必须是有限数值且非负（体积不能为负）
        if (Number.isFinite(volume) && volume >= 0) {
          filtered.push(volume);
        }
      }
      this.filteredVolume = filtered;
      return filtered;
    },

    /**
     * 计算图表数据和核心指标：生成「时间-体积」坐标对
     */
    calculateMetricsAndChartData() {
      this.chartData = [];
      this.filteredVolume = [];

      // 选择使用真实数据或模拟数据
      const volumeArr = this.useMockData ? this.mockVolume : this.realTimeVolume;
      if (!Array.isArray(volumeArr) || volumeArr.length === 0) return;

      // 1. 过滤无效数据
      const filteredVol = this.filterInvalidData(volumeArr);
      if (filteredVol.length === 0) {
        console.warn("过滤后无有效体积数据");
        return;
      }

      // 2. 生成图表数据：时间=索引/采样频率（100组=1秒），体积=过滤后的值
      this.chartData = filteredVol.map((vol, index) => {
        const time = (index / this.sampleFrequency).toFixed(2); // 时间精确到0.01秒
        return [Number(time), vol]; // 格式：[时间(s), 体积(L)]
      });
    },

    /**
     * 初始化ECharts图表：适配体积-时间图的坐标轴和样式
     */
	initChart() {
	  if (this.chartInstance) {
		this.chartInstance.dispose();
		this.chartInstance = null;
	  }

	  // ✅ 计算漂亮刻度（“0, 0.2, 0.4” 或 “0, 10, 20”）
	  const niceStep = (range, targetSplits = 5) => {
		if (!isFinite(range) || range <= 0) return 1;
		const rawStep = range / targetSplits;
		const power = Math.floor(Math.log10(rawStep));
		const base = Math.pow(10, power);
		const candidates = [1, 2, 2.5, 5, 10];
		let step = candidates[candidates.length - 1] * base;
		for (const c of candidates) {
		  const s = c * base;
		  if (rawStep <= s) { step = s; break; }
		}
		return step;
	  };

	  const alignRange = (min, max, splits = 5) => {
		const step = niceStep(max - min, splits);
		const minAligned = Math.floor(min / step) * step;
		const maxAligned = Math.ceil(max / step) * step;
		const stepStr = step.toString();
		const prec = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
		return {
		  min: Number(minAligned.toFixed(prec)),
		  max: Number(maxAligned.toFixed(prec)),
		  step,
		  prec
		};
	  };

	  // ✅ 获取 X/Y 实际范围并对齐刻度
	  const xVals = this.chartData.map(d => d[0]);
	  const yVals = this.chartData.map(d => d[1]);
	  const xMin = 0;
	  const xMax = xVals.length ? Math.max(...xVals) : 5;
	  const yMin = 0;
	  const yMax = yVals.length ? Math.max(...yVals) : 2;

	  const X = alignRange(xMin, xMax * 1.05, 6);
	  const Y = alignRange(yMin, yMax * 1.05, 6);
	  
	  
	  // ✅ 更精准的动态 nameGap：取中间刻度值，含小数点加1px
	  let midLabelValue = 0;
	  if (Y && Y.min !== undefined && Y.max !== undefined) {
	    const range = Y.max - Y.min;
	    if (range > 0) {
	      const step = Y.step || range / 5;
	      const mid1 = Y.min + range / 2; // 理论中点
	      const mid2 = Y.min + step * Math.floor(range / (2 * step)); // 相邻中间刻度
	      midLabelValue = Math.max(mid1, mid2);
	    } else {
	      midLabelValue = Y.max;
	    }
	  } else if (yVals.length) {
	    midLabelValue = yVals[Math.floor(yVals.length / 2)];
	  } else {
	    midLabelValue = 0;
	  }
	  
	  // ✅ 检查是否有小数点
	  const labelStr = Math.abs(midLabelValue).toFixed(Y.prec);
	  const hasDot = labelStr.includes('.');
	  const numCount = labelStr.replace('.', '').length;
	  
	  // ✅ 基础间距 10 + 每个数字宽度3px + 小数点额外1px（若有）
	  const dynamicNameGap = 3 + numCount * 3 + (hasDot ? 1 : 0);


	  // ✅ 图表配置项
	  const chartOption = {
		backgroundColor: '#ffffff',
		grid: {
		  left: '2%',
		  right: '3%',
		  bottom: '4%',
		  top: '5%',
		  containLabel: true
		},
		xAxis: {
		  type: 'value',
		  name: '时间 (s)',
		  nameLocation: 'center',
		  nameTextStyle: { color: '#666', fontSize: 6 },
		  nameGap: 10,
		  min: X.min,
		  max: X.max,
		  interval: X.step,              // ✅ 均匀间隔
		  axisLine: { lineStyle: { color: '#999' } },
		  axisTick: { show: true, length: 4, inside: true },
		  splitLine: { lineStyle: { color: 'rgba(0,0,0,0.05)' } },
		  axisLabel: {
			formatter: (v) => Number(v.toFixed(X.prec)),
			fontSize: 6,
			margin: 2,
		  },
		  position: 'top'
		},
		yAxis: {
		  type: 'value',
		  name: '实时流量 (L)',
		  nameLocation: 'center',
		  nameTextStyle: { color: '#666', fontSize: 6, align: 'center' },
		  nameGap: dynamicNameGap,
		  min: Y.min,
		  max: Y.max,
		  interval: Y.step,             // ✅ 均匀间隔
		  inverse: true,
		  axisLine: { lineStyle: { color: '#999' } },
		  axisTick: { show: true, length: 4, inside: true },
		  splitLine: { lineStyle: { color: 'rgba(0,0,0,0.05)' } },
		  axisLabel: {
			formatter: (v) => Number(v.toFixed(Y.prec)),
			fontSize: 6,
			margin: 2,
		  }
		},
		tooltip: {
		  trigger: 'axis',
		  triggerOn: 'click',
		  formatter: (params) => {
			const [time, volume] = params[0].value;
			return `时间: ${time.toFixed(2)} s\n实时流量: ${volume.toFixed(3)} L`;
		  },
		  backgroundColor: 'rgba(0,0,0,0.7)',
		  textStyle: { color: '#fff', fontSize: 10, lineHeight: 14 },
		  padding: [4, 6],
		  confine: true,
		  extraCssText: 'border-radius:3px;box-shadow:none;'
		},
		series: [
		  {
			id: 'volume-time-line',
			name: 'v-t关系',
			type: 'line',
			data: this.chartData,
			smooth: false,
			showSymbol: false,
			lineStyle: { width: 1.5, color: 'rgba(231,76,60,1)' },
			areaStyle: {
			  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				{ offset: 0, color: 'rgba(231,76,60,0.05)' },
				{ offset: 1, color: 'rgba(231,76,60,0.3)' }
			  ])
			},
			emphasis: { lineStyle: { width: 2.5 }, focus: 'series' }
		  }
		]
	  };

	  this.$refs.vt.init(echarts, (chart) => {
		this.chartInstance = chart;
		chart.setOption(chartOption);
		window.addEventListener('resize', () => chart.resize());
	  });
	},


    /**
     * 更新图表数据：仅更新数据和坐标轴范围，不重绘整个图表（提升性能）
     */
    updateChart() {
      if (!this.chartInstance || this.chartData.length === 0) return;
      this.chartInstance.setOption({
        xAxis: { max: this.collectDuration > 0 ? Math.ceil(this.collectDuration * 1.1) : 5 },
        yAxis: { max: this.maxVolume > 0 ? Math.ceil(this.maxVolume * 1.1) : 2 },
        series: [{ id: 'volume-time-line', data: this.chartData }]
      });
    },

    /**
     * 生成模拟数据（测试用：模拟体积随时间累积增长）
     * @param {Number} duration - 模拟采集时长（默认5秒）
     */
    // generateMockData(duration = 5) {
    //   const mockLength = duration * this.mockFrequency; // 5秒=500组数据
    //   const mockVol = [];
    //   let currentVol = 0; // 初始体积为0

    //   for (let i = 0; i < mockLength; i++) {
    //     // 模拟体积增长：先快速增长（模拟吹气过程），后趋于平稳
    //     const growthRate = i < mockLength / 2 
    //       ? Math.random() * 0.02 + 0.01 // 前2.5秒：每秒增长1~3 L（100组=0.01~0.02 L/组）
    //       : Math.random() * 0.005 + 0.001; // 后2.5秒：增长放缓
    //     currentVol += growthRate;
    //     mockVol.push(Number(currentVol.toFixed(3))); // 保留3位小数，模拟真实数据
    //   }

    //   this.mockVolume = mockVol;
    //   this.useMockData = true;
    //   this.calculateMetricsAndChartData(); // 触发图表更新
    // }
  },
  // 组件挂载：仅初始化数据，不主动渲染图表（等待真实数据传入）
  mounted() {
    this.calculateMetricsAndChartData();
    // 测试用：开启模拟数据（注释掉则使用真实数据）
    // this.generateMockData(5);
  },
  // 组件卸载：清理实例和监听，避免内存泄漏
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      window.removeEventListener('resize', () => this.chartInstance?.resize());
      this.chartInstance = null;
    }
  }
};
</script>
<style scoped>
	@import "vt.css";
	@import "../../../pages/copd/report/report.css";
	.chart-container {
	  background-color: #ffffff;   /* 背景颜色，可改 */
	  border-radius: 16rpx;        /* ✅ 设置圆角半径 */
	  overflow: hidden;            /* ✅ 裁剪内部内容，保证圆角生效 */
	  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); /* 可选阴影，更立体 */
	  border: 1rpx solid #e5e5e5;  /* 可选描边 */
	  padding: 8rpx;               /* 可选内边距 */
	  box-sizing: border-box;
	}
</style>