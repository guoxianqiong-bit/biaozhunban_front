<template>
	<view class="report-module">
		<text class="module-title">4.吹气流速-时间（f-t）关系图</text>
		<!-- 图表 -->
		<view class="chart-container">
			<l-echart ref="chart"></l-echart>
		</view>
		<!-- 当前数据分析和诊断评估 -->
		<view class="analysis-container">
			<!-- 当前数据分析 -->
			<view class="info-item">
				<text class="info-label">诊断结果</text>
				<text class="info-value diagnosis" :class="{ abnormal: isAbnormal, normal: !isAbnormal }">
					{{ isAbnormal ? "肺功能（异常）" : "正常" }}
				</text>
			</view>
			<!-- ⭐⭐ 顶部正常/异常两段（永远显示） ⭐⭐
			    <view class="top-progress-bar">
			        <view class="progress-segment" v-for="(segment, index) in topSegments" :key="'top-' + index"
			            :style="{ background: segment.color }">
			            <text class="segment-text">{{ segment.label }}</text>
			        </view>
			    </view>
			
			    顶部箭头 -->
			    <!-- <view class="indicator-container">
			        <view class="indicator" :style="{ left: topIndicator + '%' }"></view>
			    </view> -->

			<!-- 进度条 -->
			<view class="progress-bar">
				<view class="progress-segment" v-for="(segment, index) in progressSegments" :key="index"
					:style="{ background: segment.color }">
					<text class="segment-text">{{ segment.label }}</text>
				</view>
			</view>
			
			<!-- 正常 or 异常 → 都显示指示器 -->
			<view class="indicator-container">
			    <view class="indicator" :style="{ left: indicatorPosition + '%' }"></view>
			</view>



			<view v-if="!isAbnormal" class="normal-hint">
			 FEV1/FVC = {{ fev1FvcString }}，肺功能正常
			</view>


			<!-- 仅在诊断结果为异常时显示以下内容 -->
			<template v-if="isAbnormal">
				<!-- 诊断评估 -->
				<view class="section-title">慢阻肺的诊断与评估</view>
				
				<!-- 提示信息 -->
				<view class="progress-hint-container">
					<view class="progress-hint-box">
						<view class="hint-title">
							<image class="hint-icon" src="https://icon-library.com/images/info-icon/info-icon-5.jpg" />
							<text>诊断提示</text>
						</view>
						<!-- <view class="hint-text"> 
							预计FEV1/FVC值 = {{(FEV1FVCPred*100).toFixed(1)}}
						</view> -->
						<view class="hint-highlight">
						  您的FEV₁%Pred为 
						  <text class="highlight">{{ fev1PercentPred.toFixed(1) }}%</text>，属于
						  <text class="severity">{{ currentSeverity }}</text>。
						</view>

					</view>
				</view>
				<!-- 医疗建议 -->
				<view class="advice-container" :class="severityClass">
					<text class="advice-title" :class="severityClass">医疗建议：</text>
					<text class="advice-content" :class="severityClass">{{ medicalAdvice }}</text>
				</view>
				
			</template>
		</view>
	</view>
</template>

<script>
	import * as echarts from "echarts";

	export default {
		name: "copd_info",
		props: {
		  FVC: { type: Number, default: 1 },
		  FEV1: { type: Number, default: 1 },
		  FEV1FVC: { type: Number, default: 1 },
		
		  FVC_pred: { type: Number, default: 1 },
		  FEV1_pred: { type: Number, default: 1 },
		  FEV1FVC_pred: { type: Number, default: 1 },
		
		  samplingData: {
		    type: Array,
		    default: () => []
		  },
		  frequency: {
		    type: Number,
		    default: 200
		  },
		  flowAdivce: { type: String, default: () => [] }
		},

		data() {
			return {
				chartData: [], // 图表数据
				fev1: 0, // FEV1 第一秒用力呼气量
				fvc: 0, // FVC 用力肺活量
				progressSegments: [], // 进度条的段
				indicatorPosition: 0, // 指示器的位置
				currentSeverity: "", // 当前严重程度
				useMockData: false, // 控制是否使用模拟数据,不使用模拟数据
				mockSamplingData: [], // 模拟的采样数据
				mockFrequency: 200, // 模拟的采样频率
				totalTime: 0, // 总时间
				maxFlowRate: 0, // 最大流速
				firstSecondData: [],   // ← 新增
				chartInstance: null,   // ← 新增
				// topSegments: [],      // 顶部：正常 / 异常
				// goldSegments: [],     // GOLD 四级
				// topIndicator: 0,      // 顶部箭头位置
				// goldIndicator: null,  // GOLD 箭头位置
			};
		},
		watch: {
		  samplingData: {
		    immediate: true,
		    deep: true, // 如果父组件是 push 追加，建议加上
		    handler(newVal) {
		      if (!Array.isArray(newVal) || newVal.length === 0) return;
		      this.useMockData = false;                  // 明确使用真实数据
		      this.calculateMetricsAndChartData();       // 计算 FEV1/FVC 与 chartData
		      this.$nextTick(() => this.initChart());  // 还没就绪：先初始化
		      // if (this.isAbnormal) this.generateProgressSegments();
			  this.generateProgressSegments();

		    }
		  }
		},

		computed: {
			fev1FvcRatio() {
			    return this.FEV1FVC;
			},
			predictedValue() {
				return this.FEV1FVCPred; //FEV1FVC比值
			},
			isAbnormal() {
				// 判断 FEV1/FVC 是否低于 0.7
				return this.FEV1FVC< 0.7;
			},
			progressRatio() {
				// 计算 FEV1 / 预计值 的百分比
				// return this.FEV1FVC*100;
				return this.fev1PercentPred;
			},
			comparisonOperator() {
				return this.FEV1FVC < 0.7 ? "<" : "≥";
			},
			fev1PercentPred() {
			  if (!this.FEV1_pred) return 0;
			  return (this.FEV1 / this.FEV1_pred) * 100;
			},
			fev1FvcString() {
			        return (this.FEV1FVC * 100).toFixed(1) + "%";
			    },


			medicalAdvice() {
				// 根据当前严重程度给出医疗建议
				switch (this.currentSeverity) {
					case "轻度":
						return "建议保持健康生活方式，定期复查肺功能，避免接触污染环境。";
					case "中度":
						return "建议咨询医生，可能需要药物治疗，戒烟，改善呼吸功能。";
					case "重度":
						return "建议尽快到医院就诊，使用吸入性药物或其他治疗方案，注意监测呼吸状态。";
					case "极重度":
						return "严重慢阻肺患者，请立即就医，可能需要长期氧疗或进一步专业治疗。";
					default:
						return "暂无医疗建议，请先完成诊断。";
				}
			},
			severityClass() {
				switch (this.currentSeverity) {
					case "轻度":
						return 'mild';
					case "中度":
						return 'moderate';
					case "重度":
						return 'severe';
					case "极重度":
						return 'very-severe';
					default:
						return '';
				}
			},
		},
		methods: {
			// 找出面积最大的呼气片段（flow > eps 的连续区间）
			findLargestExhaleRange(times, values, eps, minDurSec = 0.3) {
			  let best = null;
			  let n = values.length;
			  let s = -1; // 片段起始下标（含）
			
			  for (let i = 0; i < n; i++) {
			    const v = values[i];
			
			    if (v > eps && s < 0) {
			      s = i; // 进入片段
			    }
			
			    const reachEnd = (i === n - 1);
			    const outNow   = (v <= eps);
			
			    if (s >= 0 && (outNow || reachEnd)) {
			      const e = (reachEnd && v > eps) ? i : i - 1; // 片段结束下标（含，最后一个>eps）
			      if (e > s) {
			        const a = times[s];
			        const b = times[e];
			        const dur = b - a;
			        if (dur >= minDurSec) {
			          const area = this.integrateBetween(times, values, a, b);
			          if (!best || area > best.area) best = { a, b, area, s, e };
			        }
			      }
			      s = -1; // 重置，准备找下一个片段
			    }
			  }
			  return best; // 可能为 null（全程无有效呼气）
			},

			
		generateProgressSegments() {
		    const ratio = this.progressRatio;
		
		    // ⭐ 情况 1：FEV1/FVC ≥ 0.7（正常）
		    if (!this.isAbnormal) { 
		        // 两个分区：正常 / 异常
		        this.progressSegments = [
		            {
		                label: "正常\n≥70%",
		                color: "linear-gradient(90deg, #52c41a, #7bdc5c)"
		            },
		            {
		                label: "异常\n<70%",
		                color: "linear-gradient(90deg, #ff7875, #ff4d4f)"
		            }
		        ];
		
		        this.currentSeverity = "正常";
		
		        // ⭐ 指示器位置（两个区块，每块 50%）
		        // 正常区块在左侧 → 25% 居中
		        this.indicatorPosition = 25;   
		
		        return; 
		    }
		
		    // ⭐ 情况 2：异常（FEV1/FVC<0.7） → 显示 GOLD 4 分级
		    const severities = [
		        {
		            label: "轻度\n≥80%",
		            color: "linear-gradient(90deg, #a0d911, #52c41a)",
		            min: 80,
		            max: 100
		        },
		        {
		            label: "中度\n50%-79%",
		            color: "linear-gradient(90deg, #faad14, #ffc53d)",
		            min: 50,
		            max: 79.9
		        },
		        {
		            label: "重度\n30%-49%",
		            color: "linear-gradient(90deg, #f5222d, #ff4d4f)",
		            min: 30,
		            max: 49.9
		        },
		        {
		            label: "极重度\n<30%",
		            color: "linear-gradient(90deg, #722ed1, #9254de)",
		            min: 0,
		            max: 29.9
		        }
		    ];
		
		    this.progressSegments = severities.map(s => ({
		        label: s.label,
		        color: s.color
		    }));
		
		    // ⭐ GOLD 匹配逻辑保持你的原样
		    for (let i = 0; i < severities.length; i++) {
		        if (ratio >= severities[i].min && ratio <= severities[i].max) {
		            this.currentSeverity = severities[i].label.split("\n")[0];
		            this.indicatorPosition = (i * 25) + 12.5; 
		            break;
		        }
		    }
		},


		  // 线性插值
		  lerp(t, t0, t1, y0, y1) {
		    if (t1 === t0) return y0;
		    const r = (t - t0) / (t1 - t0);
		    return y0 + r * (y1 - y0);
		  },
		
		  // 在 [a,b] 上对分段线性曲线做梯形积分（自动处理边界插值）
		integrateBetween(times, values, a, b) {
		  if (b <= a) return 0;
		  let area = 0;
		  for (let i = 0; i < times.length - 1; i++) {
			const t0 = times[i], t1 = times[i + 1];
			const y0 = values[i] / 60;  // <-- 除以 60
			const y1 = values[i + 1] / 60;  // <-- 除以 60
			if (t1 <= a || t0 >= b) continue; // 无交集
		
			const left  = Math.max(t0, a);
			const right = Math.min(t1, b);
			if (right <= left) continue;
		
			const yl = (left  === t0) ? y0 : this.lerp(left,  t0, t1, y0, y1);
			const yr = (right === t1) ? y1 : this.lerp(right, t0, t1, y0, y1);
			area += (yl + yr) * 0.5 * (right - left);
		  }
		  return area;
		},

		
		  // 构造 [a,b] 子段的数据点（含边界插值），用于高亮填充
		  buildSlice(times, values, a, b) {
		    if (b <= a) return [];
		    const seg = [];
		    for (let i = 0; i < times.length - 1; i++) {
		      const t0 = times[i], t1 = times[i + 1];
		      const y0 = values[i], y1 = values[i + 1];
		      if (t1 <= a || t0 >= b) continue;               // 无交集
		
		      const left  = Math.max(t0, a);
		      const right = Math.min(t1, b);
		      if (right <= left) continue;
		
		      const yl = (left  === t0) ? y0 : this.lerp(left,  t0, t1, y0, y1);
		      const yr = (right === t1) ? y1 : this.lerp(right, t0, t1, y0, y1);
		
		      // 保证片段连续：左边界点、右边界点
		      if (seg.length === 0 || seg[seg.length - 1][0] !== left) {
		        seg.push([left, yl]);
		      }
		      seg.push([right, yr]);
		    }
		    return seg;
		  },
		
		  // 用真实/模拟数据计算 FEV1、FVC 和绘图数据
		  // 用真实/模拟数据计算 FEV1、FVC 和绘图数据 —— 仅保留面积最大的呼气片段
		  // 只保留“面积最大”的呼气片段；其他时间点全部置 0（但保留完整时间轴）

		calculateMetricsAndChartData() {
		  this.fvc = 0;
		  this.fev1 = 0;
		  this.chartData = [];
		  this.firstSecondData = [];

		  const samplingData = this.useMockData ? this.mockSamplingData : this.samplingData;
		  const frequency = this.useMockData ? this.mockFrequency : this.frequency;

		  if (
			!Array.isArray(samplingData) ||
			samplingData.length === 0 ||
			!Number.isFinite(frequency) ||
			frequency <= 0
		  ) {
			this.totalTime = 0;
			this.maxFlowRate = 0;
			return;
		  }

		  // ✅ 直接处理整段数据（不再找片段）
		  const dt = 1 / frequency;
		  const values = new Array(samplingData.length);
		  const times = new Array(samplingData.length);
		  let maxFlow = 0;

		  for (let i = 0; i < samplingData.length; i++) {
			const v = Number(samplingData[i]);
			const flow = Number.isFinite(v) ? Math.max(0, v) : 0;
			values[i] = flow;
			times[i] = i * dt;
			maxFlow = Math.max(maxFlow, flow);
		  }

		  const totalDuration = (samplingData.length - 1) * dt;

		  // ✅ FVC：全程积分
		  this.fvc = this.integrateBetween(times, values, 0, totalDuration);

		  // ✅ FEV1：从起点积分 1 秒
		  this.fev1 = this.integrateBetween(times, values, 0, Math.min(1.0, totalDuration));

		  // ✅ 图表数据：完整时间轴
		  this.chartData = times.map((t, i) => [t, values[i]]);
		  this.firstSecondData = this.buildSlice(times, values, 0, Math.min(1.0, totalDuration));

		  // ✅ 坐标轴范围：整段
		  this.totalTime = totalDuration;
		  this.maxFlowRate = maxFlow;
		},


		
		
		  // 若你用的是 chartInstance 实例，这里用它；若是 this.$refs.chart.echart，同理替换
			updateChart() {
			  if (!this.chartInstance) return;
			  this.chartInstance.setOption({
			    xAxis: { max: this.totalTime },
			    yAxis: { max: Math.ceil(this.maxFlowRate / 5) * 5 || 5 },
			    series: [
			      { id: 'flow', data: this.chartData },
			      { id: 'fev1', data: this.firstSecondData }
			    ]
			  });
			},


		
		initChart() {
		  // --- 计算漂亮刻度区间 ---
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
			return { min: Number(minAligned.toFixed(prec)), max: Number(maxAligned.toFixed(prec)), step, prec };
		  };
		
		  // --- 对齐X/Y轴范围 ---
		  const X = alignRange(0, this.totalTime || 1, 6);
		  const Y = alignRange(0, Math.ceil(this.maxFlowRate / 5) * 5 || 5, 5);
		
		  // --- 图表配置 ---
		  const option = {
			backgroundColor: '#fff',
			grid: { left: '3%', right: '3%', bottom: '6%', top: '5%', containLabel: true },
			xAxis: {
			  type: "value",
			  name: "时间 (s)",
			  nameGap: 12,
			  nameLocation: 'center',
			  nameTextStyle: { color: '#666', fontSize: 6 },
			  min: X.min,
			  max: X.max,
			  interval: X.step,           // ✅ 固定间隔
			  axisTick: { show: true, length: 4, inside: true },
			  axisLabel: {
				formatter: (v) => Number(v.toFixed(X.prec)), // ✅ 保留合理小数位
				fontSize: 6,
				margin: 3,
			  },
			  splitLine: { lineStyle: { color: 'rgba(0,0,0,0.05)' } },
			  axisLine: { lineStyle: { color: "#999" } },
			},
		
			yAxis: {
			  type: "value",
			  name: "流速 (L/s)",
			  nameGap: 10,
			  nameLocation: 'center',
			  nameTextStyle: { color: '#666', fontSize: 6 },
			  min: Y.min,
			  max: Y.max,
			  interval: Y.step,           // ✅ 固定间隔
			  axisLabel: {
				formatter: (v) => Number(v.toFixed(Y.prec)),
				fontSize: 6,
				margin: 3,
			  },
			  axisTick: { show: true, length: 4, inside: true },
			  splitLine: { lineStyle: { color: 'rgba(0,0,0,0.05)' } },
			  axisLine: { lineStyle: { color: "#999" } },
			},
		
			series: [
			  {
				id: 'flow',
				name: "呼气流速",
				type: "line",
				smooth: true,
				showSymbol: false,
				data: this.chartData,
				lineStyle: { color: "#5B9BD5", width: 2 },
				areaStyle: { color: "#DAEAF6" },
				silent: true,
				hoverAnimation: false,
				emphasis: { disabled: true }  // ✅ 禁用高亮，不再变色
			  },
			  {
				id: 'fev1',
				name: "首个正值起 1 秒",
				type: "line",
				showSymbol: false,
				data: this.firstSecondData,
				lineStyle: { width: 0, color: "#FF7E50" },
				areaStyle: { color: "rgba(255,126,80,0.45)" },
				silent: true,
				hoverAnimation: false,
				emphasis: { disabled: true }  // ✅ 禁用高亮，不再变色
			  },
			],
		
			tooltip: {
			  trigger: 'axis',
			  triggerOn: 'click',
			  formatter: (params) => {
			    const [volume, flow] = params[0].value;
			    return `时间：${Number(volume).toFixed(3)} s\n流速：${Number(flow).toFixed(3)} L/S`;
			  },
			  backgroundColor: 'rgba(0,0,0,0.7)',
			  textStyle: {
						color: '#fff',
						fontSize: 10,       // ✅ 减小字体
						lineHeight: 14      // ✅ 控制行距
			  },
			  padding: [4, 6],      // ✅ 内边距：上下4px，左右6px
			  confine: true,
			  extraCssText: 'border-radius:3px;box-shadow:none;' // ✅ 去除阴影/减小圆角
			}, 
		  };
		
		  this.$refs.chart.init(echarts, (chart) => {
			this.chartInstance = chart;
			chart.setOption(option, true);
		  });
		}

		},

			
		mounted() {
			console.log("实际FEV1: ", this.FEV1);
			console.log("预计FEV1 (FEV1Pred): ", this.FEV1Pred);
			console.log("计算得到的FEV1%Pred: ", this.fev1PercentPred);
			// 计算指标和图表数据
			this.calculateMetricsAndChartData();
			
			// 如果是异常情况，生成进度条段
			// if (this.isAbnormal) {
			// 	this.generateProgressSegments();
			// }
			this.generateProgressSegments();

			
			// // 初始化图表
			// this.$nextTick(() => {   // ← 改：放到 nextTick
			//     this.initChart();
			//   });
		}
	};
</script>

<style scoped>
	@import "copd_info.css";
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