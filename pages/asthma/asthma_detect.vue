<template>
	<view class="container">
		<view class="session-card">
			<view class="switch-box">
				<view class="switch-item" :class="{active: isMorning}" @click="isMorning=true">早间测试</view>
				<view class="switch-item" :class="{active: !isMorning}" @click="isMorning=false">晚间测试</view>
			</view>
			<text class="tip">{{ isMorning ? '请在起床后、用药前测试' : '请在睡前测试' }}</text>
		</view>

		<view class="dashboard">
			<view class="circle">
				<text class="val">{{ currentFlow }}</text>
				<text class="unit">L/min</text>
			</view>
			<text class="status-text">{{ statusText }}</text>
		</view>

		<button class="btn main-btn" v-if="!isDetecting" @click="startDetect">开始吹气</button>
		<button class="btn stop-btn" v-else @click="stopDetect">结束并上传</button>
	</view>
</template>

<script>
	import { appendAsthmaDataToFile, uploadAsthmaFilesToOss } from "@/utils/bluetoothUtil_asthma.js";
	import { buf2string } from "@/utils/bluetoothUtil.js";

	export default {
		data() {
			return {
				isMorning: true,
				isDetecting: false,
				currentFlow: 0,
				statusText: '准备就绪',
				startTime: 0,
				bleDataBuffer: ''
			}
		},
		onLoad() {
			// 自动判断早晚
			const hour = new Date().getHours();
			this.isMorning = (hour >= 5 && hour < 17);
			
			// 监听全局蓝牙数据 (从 device.vue 广播过来的)
			uni.$on('value', this.handleBleData);
		},
		onUnload() {
			uni.$off('value', this.handleBleData);
		},
		methods: {
			startDetect() {
				this.isDetecting = true;
				this.statusText = "请深吸气，用力吹出！";
				this.startTime = new Date().getTime();
				this.bleDataBuffer = '';
				
				// 这里应该发送指令给硬件，如果 device.vue 没发，可以在这里补充
				// 假设 device.vue 已经连上且处于透传模式
			},
			
			handleBleData(res) {
				if (!this.isDetecting) return;
				
				// 1. 解析数据
				const raw = buf2string(res.value); // ArrayBuffer 转字符串
				this.bleDataBuffer += raw;
				
				// 2. 拼包处理 F:12.3,45.6#
				if (this.bleDataBuffer.includes('#')) {
					let lines = this.bleDataBuffer.split('#');
					for (let i = 0; i < lines.length - 1; i++) {
						let line = lines[i];
						if (line.startsWith("F:")) {
							let valStr = line.substring(2); // 去掉 F:
							
							// 存文件
							appendAsthmaDataToFile(this.startTime, valStr);
							
							// 更新界面显示的数值 (取这一包里最大的流速)
							let arr = valStr.split(',').map(Number);
							let max = Math.max(...arr);
							if (!isNaN(max) && max > this.currentFlow) {
								this.currentFlow = Math.round(max);
							}
						}
					}
					// 保留未处理完的尾巴
					this.bleDataBuffer = lines[lines.length - 1];
				}
			},
			
			stopDetect() {
				let that = this;
				uni.showModal({
					title: '结束',
					content: '确定结束本次检测？',
					success: async (res) => {
						if (res.confirm) {
							that.isDetecting = false;
							that.statusText = "正在生成报告...";
							
							let endTime = new Date().getTime();
							
							// 上传
							let success = await uploadAsthmaFilesToOss(that.startTime, endTime);
							if (success) {
								uni.showToast({ title: '上传成功', icon: 'success' });
								setTimeout(() => {
									// 返回设备列表
									uni.navigateBack({ delta: 2 });
								}, 1500);
							} else {
								that.statusText = "上传失败，请重试";
							}
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.container { padding: 20px; min-height: 100vh; background: linear-gradient(180deg, #E0F2F1 0%, #fff 100%); display: flex; flex-direction: column; align-items: center; }
	.session-card { width: 100%; background: rgba(255,255,255,0.8); border-radius: 20px; padding: 10px; text-align: center; margin-bottom: 30px; }
	.switch-box { display: flex; background: #eee; border-radius: 20px; padding: 4px; }
	.switch-item { flex: 1; padding: 8px 0; border-radius: 16px; color: #666; font-size: 14px; }
	.switch-item.active { background: #00796B; color: white; font-weight: bold; }
	.tip { font-size: 12px; color: #00796B; margin-top: 8px; display: block; }
	
	.circle { width: 220px; height: 220px; border-radius: 50%; background: white; border: 8px solid #B2DFDB; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 10px 30px rgba(0,121,107,0.1); }
	.val { font-size: 60px; font-weight: bold; color: #004D40; line-height: 1; }
	.unit { font-size: 16px; color: #00796B; margin-top: 5px; }
	.status-text { margin-top: 20px; font-size: 18px; color: #00796B; font-weight: bold; }
	
	.btn { width: 80%; border-radius: 30px; color: white; margin-top: auto; margin-bottom: 20px; }
	.main-btn { background: #009688; box-shadow: 0 5px 15px rgba(0,150,136,0.3); }
	.stop-btn { background: #FF7043; box-shadow: 0 5px 15px rgba(255,112,67,0.3); }
</style>