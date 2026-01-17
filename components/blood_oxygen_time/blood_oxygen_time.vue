<template>
	<view class="chart-wrapper">
		<!-- ECharts 图表 -->
		<view class="ec-container">
			<l-echart ref="chart"></l-echart>
		</view>

		<!-- 统计信息区域 -->
		<view class="stats-container">
			<view class="stat-item" :class="getStatusClass(minOxygen)">
				<text class="stat-title">最低血氧</text>
				<text class="stat-value">{{ minOxygen }}%</text>
			</view>
			<view class="stat-item" :class="getStatusClass(maxOxygen)">
				<text class="stat-title">最高血氧</text>
				<text class="stat-value">{{ maxOxygen }}%</text>
			</view>
			<view class="stat-item" :class="getStatusClass(avgOxygen)">
				<text class="stat-title">平均血氧</text>
				<text class="stat-value">{{ avgOxygen }}%</text>
			</view>
		</view>
	</view>
</template>

<script>
	import * as echarts from 'echarts';

	export default {
		name: 'blood_oxygen_time',
		props: {
			// 通过 props 接收父组件传递的 startTimestamp 和 oxygenData
			startTimestamp: {
				type: Number,
				required: true,
			},
			oxygenData: {
				type: Array,
				required: true,
			},
			heartRateData: {
				type: Array,
				required: true,
			}
		},
		data() {
			return {
				lowOxygenSegments: [], // 血氧浓度低于0.9的段
				lowOxygenStartIndices: [], // 低血氧段的起始索引
				dynamicYAxis: {
					min: 70,
					max: 100,
				},
				minOxygen: 0, // 最低血氧
				maxOxygen: 0, // 最高血氧
				avgOxygen: 0, // 平均血氧
			};
		},
		methods: {
			// 根据血氧值返回相应的状态类名
			getStatusClass(value) {
				if (value >= 90) {
					return 'healthy';
				} else if (value >= 80) {
					return 'warning';
				} else {
					return 'critical';
				}
			},
			// 识别血氧浓度低于0.9的段
			identifyLowOxygenSegments(threshold = 0.9) {
				const segments = [];
				let inLowSegment = false;
				let segmentStart = 0;

				for (let i = 0; i < this.oxygenData.length; i++) {
					const value = this.oxygenData[i];
					if (value < threshold) {
						if (!inLowSegment) {
							inLowSegment = true;
							segmentStart = i;
							this.lowOxygenStartIndices.push(i);
						}
					} else {
						if (inLowSegment) {
							inLowSegment = false;
							segments.push({
								start: segmentStart,
								end: i - 1
							});
						}
					}
				}

				// 如果最后一个段仍在低血氧状态
				if (inLowSegment) {
					segments.push({
						start: segmentStart,
						end: this.oxygenData.length - 1
					});
				}

				this.lowOxygenSegments = segments;
			},

			// 格式化时间戳为 'HH:mm:ss'
			formatTimestamp(timestamp) {
			  const date = new Date(timestamp);
			  const hours = date.getHours().toString().padStart(2, '0');
			  const minutes = date.getMinutes().toString().padStart(2, '0');
			  const seconds = date.getSeconds().toString().padStart(2, '0'); // 获取秒数并补充零
			  return `${hours}:${minutes}:${seconds}`; // 返回 'HH:mm:ss' 格式的时间
			},
			
			// 格式化时间戳为 'HH:mm'
			formatTimestampNoSecond(timestamp) {
				const date = new Date(timestamp);
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${hours}:${minutes}`;
			},

			// 动态计算纵轴范围
			calculateDynamicYAxis() {
				const minOxygen = Math.min(...this.oxygenData) * 100;
				this.dynamicYAxis.min = Math.floor(minOxygen / 10) * 10 - 5; // 向下取整到最近的10并减10
				this.dynamicYAxis.max = 100;
			},

			// 计算统计信息
			calculateStatistics() {
				const data = this.oxygenData.map(v => v * 100); // 转换为百分比
				this.minOxygen = Math.min(...data).toFixed(2);
				this.maxOxygen = Math.max(...data).toFixed(2);
				const sum = data.reduce((acc, val) => acc + val, 0);
				this.avgOxygen = (sum / data.length).toFixed(2);
			},

			// 初始化图表
			initChart() {
				this.identifyLowOxygenSegments();
				this.calculateDynamicYAxis();
				this.calculateStatistics();

				// 准备包含时间戳的数据
				const dataWithTime = this.oxygenData.map((value, index) => {
					const timestamp = this.startTimestamp + index * 1000; // 采样间隔为1秒
					return {
						time: timestamp,
						value: value * 100, // 转换为百分比
					};
				});

				// 准备两条线的数据：一条蓝色，一条橙色
				const blueData = [];
				const orangeData = [];

				dataWithTime.forEach(point => {
					if (point.value >= 90) {
						blueData.push([point.time, point.value]);
						orangeData.push([point.time, null]);
					} else {
						orangeData.push([point.time, point.value]);
						blueData.push([point.time, null]);
					}
				});

				// 获取低血氧段的起始时间戳集合
				const lowOxygenStartTimestamps = this.lowOxygenStartIndices.map(
					idx => this.startTimestamp + idx * 1000 // 采样间隔为1秒
				);

				const option = {
					backgroundColor: '#ffffff', // 更专业的背景色
					title: {
						text: '血氧分时图',
						left: 'center',
						textStyle: {
							fontSize: 15,
							color: '#333',
							fontWeight: 'bold',
						},
					},
					tooltip: {
						trigger: 'axis',
						backgroundColor: 'rgba(0,0,0,0.7)',
						borderColor: '#444',
						borderWidth: 1,
						textStyle: {
							color: '#fff',
						},
						formatter: params => {
							// 找到非 null 的数据点
							const param = params.find(p => p.value[1] !== null);
							if (!param) return '';
							const timestamp = param.value[0];
							const value = parseFloat(param.value[1].toFixed(2)); // 保留两位小数，并确保是数值类型
							const timeStr = this.formatTimestamp(timestamp);
							// 根据 dataIndex 获取心率值
							const dataIndex = param.dataIndex; // 数据点的索引
							const heartRate = this.heartRateData[dataIndex]; // 从心率数据中获取心率值
							// return `${timeStr} 血氧浓度: ${value}% 心率: ${heartRate}bpm`;
							// 返回格式化的内容
							return `
								时间: ${timeStr}
								血氧浓度: ${value}%
								心率: ${heartRate}bpm
							`;
						},
						axisPointer: {
							type: 'none', // 不显示坐标轴的指示器（如竖线、标签等）
						},
					},
					xAxis: {
						type: 'time',
						boundaryGap: false,
						axisLabel: {
							formatter: value => {
								return this.formatTimestampNoSecond(value);
							},
							fontSize: 12,
							color: '#666',
						},
						axisLine: {
							lineStyle: {
								color: '#999',
							},
						},
						splitLine: {
							show: false,
						},
					},
					yAxis: {
						type: 'value',
						min: this.dynamicYAxis.min,
						max: this.dynamicYAxis.max,
						axisLabel: {
							formatter: '{value}',
							fontSize: 12,
							color: '#666',
						},
						axisLine: {
							lineStyle: {
								color: '#999',
							},
						},
						splitLine: {
							lineStyle: {
								type: 'dashed',
								color: '#ccc',
							},
						},
					},
					legend: {
						data: ['血氧 >= 90%', '血氧 < 90%'],
						top: '10%', // 增加图例的顶部位置，避免与标题重叠
						right: '15%',
						textStyle: {
							color: '#333',
							fontSize: 14,
						},
					},
					series: [{
							name: '血氧 >= 90%',
							type: 'line',
							showSymbol: false,
							data: blueData,
							lineStyle: {
								color: '#1E90FF', // 蓝色
								width: 2,
							},
							areaStyle: {
								color: 'rgba(30, 144, 255, 0.1)', // 蓝色区域填充
							},
							smooth: true, // 平滑曲线
							connectNulls: false, // 不连接 null 点
						},
						{
							name: '血氧 < 90%',
							type: 'line',
							showSymbol: false,
							data: orangeData,
							lineStyle: {
								color: '#FFA500', // 橙色
								width: 2,
							},
							areaStyle: {
								color: 'rgba(255, 165, 0, 0.1)', // 橙色区域填充
							},
							smooth: true, // 平滑曲线
							connectNulls: false, // 不连接 null 点
						},
					],
					grid: {
						left: '8%', // 左侧边距，避免遮挡 y 轴标签
						right: '5%', // 右侧边距
						bottom: '16%', // 为滑块留出空间
						top: '20%', // 避免图例与标题重叠
					},
					dataZoom: [{
							type: 'slider', // 滑块样式
							show: true,
							xAxisIndex: [0],
							start: 0, // 初始显示的范围
							end: 100,
							height: 12, // 滑块高度，避免过高遮挡
							bottom: '2%', // 滑块距离容器底部的距离
							handleSize: '80%', // 调整滑块手柄大小
							handleIcon: 'M10,10 L90,10 L90,90 L10,90 Z', // 自定义手柄形状
							handleStyle: {
								color: '#888', // 手柄颜色
								shadowBlur: 3,
								shadowColor: '#aaa',
								shadowOffsetX: 2,
								shadowOffsetY: 2,
							},
							textStyle: {
								color: '#666', // 滑块文字颜色
							},
						},
						{
							type: 'inside', // 鼠标滚轮缩放
							xAxisIndex: [0],
							start: 0,
							end: 100,
						},
					],
				};

				this.$refs.chart.init(echarts, chart => {
					chart.setOption(option);
				});
			},
		},
		mounted() {
			this.initChart();
		},
	};
</script>

<style scoped>
	@import "blood_oxygen_time.css"
</style>