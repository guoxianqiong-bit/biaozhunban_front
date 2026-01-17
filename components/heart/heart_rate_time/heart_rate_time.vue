<template>
	<view class="chart-wrapper">
		<!-- ECharts 图表 -->
		<view class="ec-container">
			<l-echart ref="chart"></l-echart>
		</view>
	</view>
</template>

<script>
	import * as echarts from 'echarts';

	export default {
		name: 'heart_rate_time',
		props: {
			// 通过 props 接收父组件传递的 startTimestamp 和 heartRateData
			startTimestamp: {
				type: Number,
				required: true,
			},
			heartRateData: {
				type: Array,
				required: true,
			},
		},
		data() {
			return {
				dynamicYAxis: {
					min: 40,
					max: 180,
				},
			};
		},
		methods: {
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
				const minHeartRate = Math.min(...this.heartRateData);
				const maxHeartRate = Math.max(...this.heartRateData);
				this.dynamicYAxis.min = Math.floor(minHeartRate / 5) * 5 - 5; // 向下取整到最近的10并减10
				this.dynamicYAxis.max = Math.ceil(maxHeartRate / 5) * 5 + 5; // 向上取整到最近的10并加10
			},

			// 初始化图表
			initChart() {
				this.calculateDynamicYAxis();

				// 准备包含时间戳的数据
				const dataWithTime = this.heartRateData.map((value, index) => {
					const timestamp = this.startTimestamp + index * 1000; // 采样间隔为1秒
					return {
						time: timestamp,
						value: value,
					};
				});

				// 配置图表选项
				const option = {
					backgroundColor: '#ffffff', // 更专业的背景色
					title: {
						text: '心率分时图',
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
							return `${timeStr} 心率: ${value} bpm`;
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
					series: [{
						name: '心率',
						type: 'line',
						showSymbol: false,
						data: dataWithTime.map(point => [point.time, point.value]),
						lineStyle: {
							color: '#FF4500', // 统一使用橙色线条表示心率
							width: 2,
						},
						areaStyle: {
							color: 'rgba(255, 69, 0, 0.1)', // 橙色区域填充
						},
						smooth: false, // 平滑曲线
						connectNulls: false, // 不连接 null 点
					}, ],
					grid: {
						left: '7%', // 左侧边距，避免遮挡 y 轴标签
						right: '2%', // 右侧边距
						bottom: '14%', // 为滑块留出空间
						top: '12%', // 避免图例与标题重叠
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
	@import "heart_rate_time.css";
</style>