<template>
	<view class="main">
		<view class="notice-container" v-if="!isExistSleepDevice && !isExistCOPDDevice && !isExistAsthmaDevice">
			<view class="notice-title notice-title-warn">
				设备使用温馨提示
			</view>

			<uni-notice-bar background-color="#fff3cd" color="#856404"
				text="您好，您暂未绑定监测设备，请扫描设备二维码进行绑定，方可进行离院监测。" />
		</view>


		<view class="sleep_device">
			<view class="notice-container" v-if="isExistSleepDevice">
				<view class="notice-title notice-title-sleep">
					睡眠监测设备使用温馨提示
				</view>

				<uni-notice-bar background-color="#e3f2fd" color="#0d47a1"
					text="请先连接睡眠检测设备，监测整夜睡眠时长需大于5小时，否则系统将不记录此次睡眠情况。" />
			</view>


			<view class="device_info">
				<view>
					<device_List :devices="sleepDeviceInfos" :isConnected="isConnectedSleep"
						:isStartdetect="isStartSleepdetect" :recentUpSleepTime="recentUpSleepTime"
						@stop-detection="stopSleepDetection" @view-rules="viewRules" />
					<apply_Device :applyDevices="applySleepDeviceInfos" />
				</view>
			</view>

			<view class="notice_detect" v-if="isStartSleepdetect">
				<uni-notice-bar show-icon scrollable color="#7f170e" background-color="white"
					text="睡眠监测已经开始,请佩戴好监测设备,并保持与手机的连接,请勿退出APP。" />
			</view>

			<view v-if="haveNotUpSleepFile" class="retry_notice" style="width: 95%; margin: 0 auto;">
				<uni-notice-bar scrollable show-icon background-color="white" color="red"
					text="存在睡眠监测数据上传失败,请连接网络,并下拉刷新重新上传数据!" />
			</view>
		</view>

		<view class="copd_device">
			<view class="notice-container" v-if="isExistCOPDDevice">
				<view class="notice-title notice-title-copd">
					慢阻肺检测设备使用温馨提示
				</view>

				<uni-notice-bar background-color="#E8F5E9" color="#2E7D32" text="请先连接慢阻肺检测设备，并严格按照设备说明使用。" />
			</view>


			<view class="device_info">
				<view>
					<device_List_copd :devices="COPDDeviceInfos" :isConnected="isConnectedCOPD"
						:showCheckModal="showCheckModalCOPD" :isStartdetect="startCOPD"
						:recentUpSleepTime="recentUpCOPDTime" :userId="userId" :isneedECG="needECG"
						@start-detection="startCOPDDetection" @end-detection="endCOPDDetection"
						@end-window="confirmExitCheck" @view-rules="viewRules"
						@unbind-success="handleCOPDUnbindSuccess" />

					<apply_Device :applyDevices="applyCOPDDeviceInfos" />

				</view>
			</view>

			<view class="notice_detect" v-if="isStartCOPDdetect">
				<uni-notice-bar show-icon scrollable color="#7f170e" background-color="white"
					text="慢阻肺检测已经开始,请正确使用检测设备,并保持与手机的连接,请勿退出APP。" />
			</view>

		</view>
		<view class="asthma_device">
			<view class="notice-container" v-if="isExistAsthmaDevice">
				<view class="notice-title notice-title-asthma">
					哮喘检测设备使用温馨提示
				</view>

				<uni-notice-bar background-color="#E0F2F1" color="#00695C" text="请先连接哮喘检测设备，并严格按照设备说明使用。" />
			</view>
			<view class="device_info">
				<view>
					<device_List_asthma :devices="AsthmaDeviceInfos" :isConnected="isConnectedAsthma"
						:showCheckModal="showCheckModalAsthma" :isStartdetect="startAsthma"
						:recentUpSleepTime="recentUpAsthmaTime" :userId="userId"
						@start-detection="startAsthmaDetection" @end-detection="endAsthmaDetection"
						@end-window="confirmExitAsthmaCheck" @view-rules="viewRules"
						@unbind-success="handleAsthmaUnbindSuccess" />
					<apply_Device :applyDevices="applyAsthmaDeviceInfos" />
				</view>
			</view>

			<view class="notice_detect" v-if="isStartAsthmadetect">
				<uni-notice-bar show-icon scrollable color="#7f170e" background-color="white"
					text="哮喘检测已经开始,请正确使用检测设备,并保持与手机的连接,请勿退出APP。" />
			</view>
		</view>

		<view class="bluetooth_connect">

			<uni-drawer ref="sleep_showLeft" mode="left" :width="320" @change="change($event,'sleep_showLeft')">
				<view class="connect_tip">
					<uni-section class="mb-10" title="睡眠监测仪设备蓝牙连接" sub-title="请确保手机蓝牙已开启,系统将自动搜索到睡眠监测仪设备蓝牙展示在下方,点击即可连接!"
						type="line"></uni-section>
				</view>

				<uni-list :border="true" v-for="(item,index) in bluetoothInfos" :key="index">
					<uni-list-chat clickable @click="startConnectSleepBluetooth(item.deviceId)" :title="item.deviceName"
						avatar="/static/images/device/lanya.png" :note="item.deviceId" badge-positon="left">
					</uni-list-chat>
				</uni-list>
			</uni-drawer>

			<uni-drawer ref="copd_showLeft" mode="left" :width="320" @change="change($event,'copd_showLeft')">
				<view class="connect_tip">
					<uni-section class="mb-10" title="慢阻肺检测仪设备蓝牙连接" sub-title="请确保手机蓝牙已开启,系统将自动搜索到慢阻肺检测仪蓝牙展示在下方,点击即可连接!"
						type="line"></uni-section>
				</view>

				<uni-list :border="true" v-for="(item,index) in bluetoothInfos" :key="index">
					<uni-list-chat clickable @click="startConnectCOPDBluetooth(item.deviceId)" :title="item.deviceName"
						avatar="/static/images/device/lanya.png" :note="item.deviceId" badge-positon="left">
					</uni-list-chat>
				</uni-list>
			</uni-drawer>

			<uni-drawer ref="asthma_showLeft" mode="left" :width="320" @change="change($event,'asthma_showLeft')">
				<view class="connect_tip">
					<uni-section class="mb-10" title="哮喘检测仪设备蓝牙连接" sub-title="请确保手机蓝牙已开启,系统将自动搜索到哮喘检测仪蓝牙展示在下方,点击即可连接!"
						type="line"></uni-section>
				</view>

				<uni-list :border="true" v-for="(item,index) in bluetoothInfos" :key="index">
					<uni-list-chat clickable @click="startConnectAsthmaBluetooth(item.deviceId)" :title="item.deviceName"
						avatar="/static/images/device/lanya.png" :note="item.deviceId" badge-positon="left">
					</uni-list-chat>
				</uni-list>
			</uni-drawer>
		</view>
		<uni-fab ref="fab" :pattern="pattern_add" horizontal="right" @click="scanCode" />
		<uni-fab v-if="isExistSleepDevice || isExistCOPDDevice || isExistAsthmaDevice" ref="fab" :pattern="pattern_blue"
			horizontal="left" :content="fabContent" :direction="'horizontal'" @trigger="handleFabClick" />


	</view>
</template>

<script>
	import device_List_asthma from "@/components/deviceList/deviceList_asthma.vue"; // 新组件
	import {
		appendAsthmaDataToFile,
		uploadAsthmaFilesToOss
	} from "../../utils/bluetoothUtil_asthma.js"; // 新工具
	import {
		speak,
		stopSpeak
	} from "@/utils/tts.js"
	import {
		watch,
		getCurrentInstance
	} from 'vue'
	import {
		useCommandStore
	} from '@/stores/commandStore'
	import {
		showToast,
		showLoading,
		hideLoading
	} from "/utils/ui.js";
	import {
		formatTimeInterval,
		formatLatestSleepTime
	} from "../../utils/dateUtil";
	import {
		buf2string,
		uploadSleepFilesToOss,
		deleteSleepFiles,
		createSleepDataFiles,
		retryUploadSleepFilesToOss,
		deleteStorageAndFiles,
		uploadCOPDData
	} from "../../utils/bluetoothUtil";
	import {
		request
	} from "../../utils/httpUtils";
	import {
		isExistNotUpSleepFile,
		monitorStartTime,
		monitorEndTime
	} from "../../utils/constants";
	import {
		appendPositionDataToFile,
		appendBioDataToFile,
		appendSnoreDataToFile,
		appendOxygenDataToFile,
	} from "../../utils/bluetoothUtil";
	import {
		appendCOPDDataToFile,
		uploadCopdFilesToOss,
	} from "../../utils/bluetoothUtil_copd";
	import {
		checkBatteryOptimizeStatus,
		requestIgnoreBatteryOptimization
	} from '@/uni_modules/qd-batteryOptimize';
	import device_List from "@/components/deviceList/deviceList.vue";
	import device_List_copd from "@/components/deviceList/deviceList_copd.vue";
	import apply_Device from "@/components/applyDevice/applyDevice.vue";
	import {
		removeSubstring
	} from "@/utils/strFormat.js"
	import HealthCheckModal from "@/components/deviceList/deviceList_HealthCheck.vue";

	export default {
		components: {
			device_List,
			device_List_copd,
			apply_Device,
			HealthCheckModal,
			device_List_asthma
		},
		setup() {
			const instance = getCurrentInstance()
			const commandStore = useCommandStore()

			watch(
				() => commandStore.currentCommand,
				(cmd) => {
					if (!cmd) return;

					if (cmd === "MAX") {
						console.log("收到 MAX 指令")
						instance.proxy.noticeBluetoothStartSent(0)
					} else if (cmd === "ECG") {
						console.log("收到 ECG 指令")
						instance.proxy.noticeBluetoothStartSent(1)
					} else if (cmd === "FLOW") {
						console.log("收到 FLOW 指令")
						instance.proxy.noticeBluetoothStartSent(2)
					} else if (cmd === "STOP") {
						console.log("收到 STOP 指令")
						instance.proxy.noticeBluetoothStartSent(3)
					}
				}
			);
		},

		data() {
			return {
				userId: uni.getStorageSync("userId") || 0,
				pattern_add: {
					color: '#5A5E6B', // 深灰色字体，增加层次感
					backgroundColor: '#F9FAFB', // 浅灰白背景，更柔和
					selectedColor: '#3498DB', // 浅蓝色选中效果，现代感
					buttonColor: '#3498DB', // 同步按钮颜色
					iconColor: '#FFFFFF', // 白色图标，干净大气
				},
				pattern_blue: {
					color: '#4A90E2', // 浅蓝色字体，强调科技感
					backgroundColor: '#F0F4FF', // 浅蓝白背景，柔和且清爽
					selectedColor: '#007AFF', // 深蓝色选中效果，保持醒目
					buttonColor: '#0056B3', // 深蓝色按钮，增强对比
					iconColor: '#F0F4FF', // 浅蓝白图标，协调整体
					icon: 'link', // 保持 icon 样式
				},
				fabContent: [{
						iconPath: '/static/images/icon/snooze.png', // 睡眠呼吸图标路径
						selectedIconPath: '/static/images/icon/snooze-active.png', // 选中时的图标路径
						text: '睡眠呼吸',
						active: false
					},
					{
						iconPath: '/static/images/icon/manzufei.png', // 慢阻肺图标路径
						selectedIconPath: '/static/images/icon/manzufei-active.png', // 选中时的图标路径
						text: '慢阻肺',
						active: false
					},
					{

						iconPath: '/static/images/icon/xiaochuan.png',
						selectedIconPath: '/static/images/icon/xiaochuan-active.png',
						text: '哮喘',
						active: false
					}
				],
				//是否需要心电检测
				needECG: false,

				// 睡眠监测设备数据
				haveNotUpSleepFile: false,
				isStartSleepdetect: false,
				isConnectedSleep: false,
				sleepDeviceInfos: [],
				applySleepDeviceInfos: [],
				recentUpSleepTime: '',
				isExistSleepDevice: false,
				minDetectTime: 300,
				startTimeTamp: '',

				serialCode: '',

				// 慢阻肺设备数据
				haveNotUpCOPDFile: false,
				isStartCOPDdetect: false,
				isConnectedCOPD: false,
				COPDDeviceInfos: [],
				applyCOPDDeviceInfos: [],
				recentUpCOPDTime: '',
				isExistCOPDDevice: false,
				startCOPDTimeTamp: '',
				bloodOxygens: [],
				flowRates: [],
				blueStatuFile: '',
				bleCOPDDataBuffer: '',

				bluetoothKeyName: '',
				bluetoothInfos: [],
				connectBlueDeviceId: '',
				startCOPD: false, //开始实时监测

				BIEServices: [],
				BLEInformation: {
					serviceId: '',
					charaterId: ''
				},
				serviceIndex: 0,
				notify: false,
				write: false,
				read: false,

				bioArrs: [
					[],
					[]
				],
				snoreArrs: [
					[],
					[]
				],
				oxygenArrs: [
					[],
					[]
				],
				sleepFiles: [],

				showCheckModalCOPD: false, //用于展示慢阻肺检测步骤
				// 用于存储是否忽略电池优化
				isBatteryOptimizationIgnored: false,

				noticeBlueText: 'SEND_BEGIN',
				copdBlueComannd: ['MAX', 'ECG', 'FLOW', 'STOP'],
				comannd_index: 0,
				speakFlag: 1,

				// --- 新增：哮喘相关变量 ---
				isExistAsthmaDevice: false,
				AsthmaDeviceInfos: [],
				applyAsthmaDeviceInfos: [],
				isConnectedAsthma: false,
				isStartAsthmadetect: false,
				recentUpAsthmaTime: '',
				startAsthmaTimeTamp: '',
				startAsthma: false,
				showCheckModalAsthma: false,
				bleAsthmaDataBuffer: '',
			}
		},


		onShow() {
			// 停止上一轮播报
			stopSpeak()

			// 修改这里：只要有 睡眠 或 慢阻肺 或 哮喘 任意一个，就视为已绑定
			if (this.speakFlag > 1 && !this.showCheckModalCOPD) {
				if (this.isExistSleepDevice || this.isExistCOPDDevice || this.isExistAsthmaDevice) {
					speak("已绑定检测设备，可点击左下角连接设备")
				} else {
					speak("当前无绑定的设备，请点击右下角加号扫码绑定设备")
				}
			}
			this.speakFlag++;
		},

		async onReady() {
			// 等待获取最新绑定列表
			await this.getBindDeviceInfos()

			stopSpeak()

			// 修改这里：加上 isExistAsthmaDevice 的判断
			if (this.isExistSleepDevice || this.isExistCOPDDevice || this.isExistAsthmaDevice) {
				speak("已绑定检测设备，可点击左下角连接设备")
			} else {
				speak("当前无绑定的设备，请点击右下角加号扫码绑定设备")
			}
		},
		// 页面隐藏（跳转到其他页面）
		onHide() {
			stopSpeak(); // 停止播报
		},
		// 页面卸载（关闭页面）
		onUnload() {
			stopSpeak(); // 停止播报
			uni.$off('stop-asthma-detection-from-child');
		},
		methods: {
			handleChildStopRequest() {
				console.log("父页面收到停止请求，开始执行结束流程");
				// 直接调用你原本写好的结束方法
				this.endAsthmaDetection();
			},
			/**
			 * 1. 拼包函数：处理蓝牙碎片数据
			 * 我们需要把它们拼成 "F:12.5,13.0#" 然后按 # 切割
			 */
			processAsthmaBLEData(dataChunk) {
				// 1. 将收到的碎片追加到缓冲区
				this.bleAsthmaDataBuffer += dataChunk;

				// 2. 检查缓冲区里有没有结束符 #
				// split('#') 会把 "数据1#数据2#" 切割成 ["数据1", "数据2", ""]
				if (this.bleAsthmaDataBuffer.includes('#')) {
					let lines = this.bleAsthmaDataBuffer.split('#');

					// 3. 处理所有完整的包（除了最后一个可能不完整的）
					for (let i = 0; i < lines.length - 1; i++) {
						const completeLine = lines[i];
						if (completeLine && completeLine.length > 0) {
							this.processAsthmaRealData(completeLine);
						}
					}

					// 4. 将最后一段（可能是半截数据）放回缓冲区，等待下一次拼接
					this.bleAsthmaDataBuffer = lines[lines.length - 1];
				}
			},

			/**
			 * 2. 解析函数：处理一条完整的数据
			 * 格式示例: "F:12.5,13.2,14.5"
			 */
			processAsthmaRealData(dataStr) {


				// 1. 判断是否是流速数据 (以 F: 开头)
				if (dataStr.startsWith("F:") || dataStr.startsWith("f:")) {
					// 2. 去掉前缀 "F:"
					let cleanData = dataStr.substring(2);

					// 3. 写入本地文件 (调用之前写的工具类)
					console.log("【哮喘完整包】", cleanData);
					const dataArray = cleanData.split(",")
					let fileName = 'asthma_flow_' + this.startAsthmaTimeTamp + '.txt'
					appendAsthmaDataToFile(fileName, dataArray);
				}
			},


			// 开始哮喘检测
			// 开始哮喘检测
			// 			startAsthmaDetection() {
			// 			    if (!this.isConnectedAsthma) {
			// 			        uni.showToast({ title: '请先连接蓝牙', icon: 'none' })
			// 			        return
			// 			    }
			// 			    this.startAsthma = true 
			// 			    this.isStartAsthmadetect = true 
			// 			    this.startAsthmaTimeTamp = new Date().getTime()
			// 			    this.bleAsthmaDataBuffer = '' // 清空缓冲区
			// 				// 🔥🔥🔥 【新增】发送 FLOW 指令激活硬件 🔥🔥🔥
			// 				this.sendAsthmaCommand("FLOW");

			// 			    uni.showToast({ title: '检测开始，请吹气', icon: 'none' })
			// 			},
			// pages/device/device.vue

			startAsthmaDetection() {
				if (!this.isConnectedAsthma) {
					uni.showToast({
						title: '请先连接蓝牙',
						icon: 'none'
					})
					return
				}

				// 1. 设置状态
				this.startAsthma = true
				this.isStartAsthmadetect = true
				// 记录开始时间（这个时间戳是文件名的关键）
				this.startAsthmaTimeTamp = new Date().getTime()
				this.bleAsthmaDataBuffer = ''

				// 2. 发送指令激活硬件
				this.sendAsthmaCommand("FLOW");

				// 3. 🔥🔥🔥 跳转到检测页（把开始时间传过去，虽然子页面不写文件，但可能需要这个ID）
				uni.navigateTo({
					url: `/pages/asthma/asthma_detect?startTime=${this.startAsthmaTimeTamp}`
				});
			},

			sendAsthmaCommand(cmd) {
				if (!this.BLEInformation.writeCharaterId) {
					console.error("❌ 写特征值未初始化");
					return;
				}

				// ❌ 删除这行：const encoder = new TextEncoder();
				// ❌ 删除这行：const buffer = encoder.encode(cmd).buffer;

				// ✅ 改用：手动将字符串转为 ArrayBuffer (兼容所有手机)
				let buffer = new ArrayBuffer(cmd.length);
				let dataView = new Uint8Array(buffer);
				for (let i = 0; i < cmd.length; i++) {
					dataView[i] = cmd.charCodeAt(i);
				}

				uni.writeBLECharacteristicValue({
					deviceId: this.connectBlueDeviceId,
					serviceId: this.BLEInformation.writeServiceId,
					characteristicId: this.BLEInformation.writeCharaterId,
					value: buffer,

					// ⭐ 关键：动态适配写类型
					writeType: this.BLEInformation.writeType || 'write',

					success: () => {
						console.log("✅ 发送哮喘指令成功:", cmd);
					},
					fail: (err) => {
						console.error("❌ 发送哮喘指令失败", err);
					}
				});
			},


			// 结束哮喘检测
			endAsthmaDetection() {
				// 1. 修改状态
				this.startAsthma = false
				this.isStartAsthmadetect = false
				this.bleAsthmaDataBuffer = ''

				// 2. 触发上传流程
				// 这里的 uploadAsthmaFilesToOss 来自我们新建的 bluetoothUtil_asthma.js
				// 需要传入开始时间和结束时间
				let endTime = new Date().getTime()

				showLoading("正在上传数据...")

				// 调用工具类上传
				uploadAsthmaFilesToOss(this.startAsthmaTimeTamp, endTime).then(success => {
					hideLoading()
					if (success) {
						// 上传成功后，可能需要弹窗提示或刷新
						// this.showCheckModalAsthma = true // 如果需要显示报告生成的弹窗
					}
				})
			},

			// 退出检测确认
			confirmExitAsthmaCheck() {
				this.showCheckModalAsthma = false
				// 刷新页面数据等后续操作
			},

			// 处理解绑成功
			handleAsthmaUnbindSuccess(item) {
				this.getBindDeviceInfos(); // 刷新列表
			},

			handleCOPDUnbindSuccess() {

				// 1. 清空状态（不触发 UI 重渲染）
				this.isStartCOPDdetect = false;
				this.startCOPD = false;

				if (this.isConnectedCOPD) {
					this.disconnectBluetooth(); // 不会导致 toast 消失
				}

				// 2. 立即提示成功 —— 让 toast 出现
				uni.showToast({
					title: "取消绑定成功",
					icon: "success",
					duration: 3000
				});
				stopSpeak()
				speak("取消绑定成功,点击右下角扫码可重新绑定")

				// ⭐ 重点：延迟刷新 UI，否则 toast 会被覆盖
				setTimeout(() => {

					// 3. 清空设备数据
					this.sleepDeviceInfos = [];
					this.applySleepDeviceInfos = [];
					this.COPDDeviceInfos = [];
					this.applyCOPDDeviceInfos = [];

					this.isExistSleepDevice = false;
					this.isExistCOPDDevice = false;

					// 4. 重新请求
					this.getBindDeviceInfos();
					this.getLatestUploadSleepTime();

					// 5. 强制刷新
					this.$forceUpdate();

				}, 3000); // ⭐ 延迟 3 秒刷新，让 toast 正常显示

			},

			confirmExitCheck() {
				uni.showModal({
					title: "退出检测",
					content: "是否确认退出本次检测流程？",
					confirmText: "退出",
					cancelText: "继续检测",
					success: (res) => {
						if (res.confirm) {
							this.showCheckModalCOPD = false;
							this.isStartCOPDdetect = false;
							this.startCOPD = false;
							this.disconnectBluetooth();
						}
					}
				});
			},




			handleFabClick(e) {
				this.bluetoothInfos = []
				// 判断是否有设备正在运行
				if (this.isStartSleepdetect || this.isStartCOPDdetect) {
					let runningDevices = [];
					if (this.isStartSleepdetect) runningDevices.push('睡眠呼吸监测');
					if (this.isStartCOPDdetect) runningDevices.push('慢阻肺监测');
					if (this.isStartAsthmadetect) runningDevices.push('哮喘监测');

					// 动态生成提示内容
					const runningMessage = `当前有${runningDevices.join(' 和 ')}设备正在进行监测，请先关闭所有监测设备后再操作。`;

					// 弹出提示框
					uni.showModal({
						title: '提示',
						content: runningMessage,
						showCancel: false
					});
					return; // 阻止进一步操作
				}
				if (e.item.text === '睡眠呼吸') {
					if (!this.isExistSleepDevice) {
						uni.showModal({
							title: '提示',
							content: '您暂未绑定离院睡眠呼吸监测设备',
							showCancel: false
						});
						return;
					}
					this.bluetoothKeyName = this.sleepDeviceInfos[0].deviceInfo.serialCode;
					this.showDrawer('sleep_showLeft'); // 调用现有的 `showDrawer` 方法
				} else if (e.item.text === '慢阻肺') {
					if (!this.isExistCOPDDevice) {
						uni.showModal({
							title: '提示',
							content: '您暂未绑定离院慢阻肺检测设备',
							showCancel: false
						});
						return;
					}
					this.bluetoothKeyName = this.COPDDeviceInfos[0].deviceInfo.serialCode;
					this.showDrawer('copd_showLeft');
				} else if (e.item.text === '哮喘') {
					if (!this.isExistAsthmaDevice) {
						uni.showModal({
							title: '提示',
							content: '您暂未绑定离院哮喘检测设备',
							showCancel: false
						});
						return;
					}
					// 获取第一个哮喘设备的序列号用于蓝牙搜索
					this.bluetoothKeyName = this.AsthmaDeviceInfos[0].deviceInfo.serialCode;
					this.showDrawer('asthma_showLeft'); // 打开之前写好的哮喘蓝牙抽屉
				}
			},

			// 打开窗口
			showDrawer(e) {
				// if(this.isBatteryOptimizationIgnored){
				// 	this.$refs[e].open()
				// 	this.authorizeBluetoothAdapter()
				// }else{
				// 	this.requestBatteryOptimizationPermission()
				// }
				this.$refs[e].open()
				this.authorizeBluetoothAdapter()
			},

			// 抽屉状态发生变化触发
			change(e, type) {
				// 左窗口关闭 关闭蓝牙搜索
				if (!e) {
					this.stopBluetoothSearch()
				}
			},

			viewRules(item) {
				if (item.isViewRule) {
					item.isViewRule = false
				} else {
					item.isViewRule = true
				}
			},

			scanCode() {
				let that = this
				uni.scanCode({
					onlyFromCamera: true,
					success: function(res) {
						let serialCode = res.result
						if (!serialCode || serialCode.indexOf("YNU_KG_") !== 0) {
							uni.showToast({
								title: '非本设备序列码',
								icon: 'none'
							});
							return;
						}
						let obj = {
							method: "GET",
							showLoading: true,
							url: `/device/applyBindDevice`,
							data: {
								serialCode: serialCode
							},
							message: "正在申请绑定"
						}
						request(obj).then(res => {
							let msg = res.data
							that.getBindDeviceInfos()
							showToast(msg, 2000)
							if (msg == "该设备已绑定用户") {
								stopSpeak()
								speak("该设备已绑定用户，请更换设备绑定")
							} else {
								stopSpeak()
								speak("已成功绑定设备")
							}
						}).catch(err => {
							showToast("请稍后重试！", 1500)
						})
					}
				})

			},
			// 开始睡眠检测
			// startDetection() {
			// 	let that = this
			// 	// 开始新的睡眠监测，存在未上传则直接删除
			// 	if (that.haveNotUpSleepFile) {
			// 		// 清理本地缓存并删除文件
			// 		deleteStorageAndFiles()
			// 		that.haveNotUpSleepFile = false
			// 	}
			// 	uni.showModal({
			// 		title: '检测提示',
			// 		content: '是否开始睡眠检测，如开始请先佩戴好设备。',
			// 		success: function(res) {
			// 			if (res.confirm) {
			// 				// 定义本次睡眠记录开始时间
			// 				that.startTimeTamp = new Date().getTime();
			// 				that.bioArrs = [
			// 					[],
			// 					[]
			// 				]
			// 				uni.setStorage({
			// 					key: monitorStartTime,
			// 					data: that.startTimeTamp
			// 				})
			// 				// 创建睡眠数据文件
			// 				createSleepDataFiles(that.startTimeTamp)
			// 				// 通知蓝牙设备发送睡眠数据
			// 				that.noticeBluetoothStartSent()
			// 				that.isStartSleepdetect = true
			// 				showToast('已开始睡眠检测', 2000)
			// 			} else if (res.cancel) {

			// 			}
			// 		}
			// 	});
			// },

			// 停止睡眠检测
			async stopSleepDetection() {
				let that = this
				let curretntTimeTamp = new Date().getTime()
				let startTimeTamp = that.startTimeTamp
				// 计算此次睡眠检测总时长
				let sleepDetectTime = formatTimeInterval(startTimeTamp, curretntTimeTamp)
				uni.showModal({
					title: '取消提示',
					content: `本次睡眠呼吸监测总时长:${sleepDetectTime}分钟,是否停止此次睡眠呼吸监测并断开设备蓝牙连接`,
					success: async function(res) {
						if (res.confirm) {
							that.isStartSleepdetect = false
							// 断开蓝牙连接
							that.disconnectBluetooth()
							// 判断睡眠检测时长是否符合规定时长 不符合则直接不上传睡眠数据
							// 检测时间大于七个小时才是有效时间 直接删除睡眠数据 不符合规定时长
							let endTimeTamp = new Date().getTime()

							// 记录睡眠结束时间
							uni.setStorage({
								key: monitorEndTime,
								data: endTimeTamp
							})
							if (sleepDetectTime >= that.minDetectTime) {
								//上传睡眠数据
								showLoading('正在上传睡眠监测数据')
								let isSuccess = await uploadSleepFilesToOss(startTimeTamp, endTimeTamp)
								// 文件上传有误
								if (!isSuccess) {
									that.haveNotUpSleepFile = true
								}
							} else {
								deleteSleepFiles(startTimeTamp)
							}
						} else if (res.cancel) {

						}
					}
				});
			},

			// 停止慢阻肺检测
			stopCOPDDetection() {
				let that = this
				uni.showModal({
					title: '取消提示',
					content: `是否确认已结束本次慢阻肺实时检测`,
					success: function(res) {
						if (res.confirm) {
							that.showCheckModalCOPD = false
							that.isStartCOPDdetect = false
							// 断开蓝牙连接
							that.disconnectBluetooth()
							let endTimeTamp = new Date().getTime()
							let bloodOxygen = ''
							const total = that.bloodOxygens.reduce((sum, value) => sum + value, 0);
							const average = total / that.bloodOxygens.length;
							bloodOxygen = average.toFixed(2);
							let flowRates = that.flowRates
							showLoading('正在上传慢阻肺检测数据')
							let copdSaveData = {
								startTime: that.startCOPDTimeTamp,
								endTime: endTimeTamp,
								bloodOxygen,
								flowRates
							}
							uploadCOPDData(copdSaveData)
						} else if (res.cancel) {

						}
					}
				});
			},
			async endCOPDDetection() {
				let that = this

				uni.showModal({
					title: '取消提示',
					content: `是否确认已结束本次慢阻肺实时检测`,
					success: async function(res) {
						if (res.confirm) {
							that.isStartCOPDdetect = false
							that.startCOPD = false
							that.showCheckModalCOPD = false
							that.bleCOPDDataBuffer = '';
							// 断开蓝牙连接
							that.disconnectBluetooth()
							let endTimeTamp = new Date().getTime()
							uni.setStorage({
								key: monitorEndTime,
								data: endTimeTamp
							})
							//上传睡眠数据
							let isSuccess = await uploadCopdFilesToOss(that.startCOPDTimeTamp,
								endTimeTamp)
							// 文件上传有误
							if (!isSuccess) {
								console.log("上传错误")
							} else {
								console.log("文件上传成功")
							}
						} else if (res.cancel) {

						}

					}
				});
			},
			async endwindow() {
				let that = this
				uni.showModal({
					title: '取消提示',
					content: `是否确认结束本次慢阻肺实时检测`,
					success: async function(res) {
						if (res.confirm) {
							that.isStartCOPDdetect = false
							that.startCOPD = false
							that.showCheckModalCOPD = false
							that.bleCOPDDataBuffer = '';
							// 断开蓝牙连接
							that.disconnectBluetooth()
							let endTimeTamp = new Date().getTime()
							uni.setStorage({
								key: monitorEndTime,
								data: endTimeTamp
							})
							//上传睡眠数据
							let isSuccess = await uploadCopdFilesToOss(that.startCOPDTimeTamp,
								endTimeTamp)
							// 文件上传有误
							if (!isSuccess) {
								console.log("上传错误")
							} else {
								console.log("文件上传成功")
							}
						} else if (res.cancel) {

						}
					}
				});
			},
			// 开始慢阻肺检测
			startCOPDDetection() {
				let that = this;
				// ⭐ 第一步：心电检测选择弹窗
				uni.showModal({
					title: '检测选项',
					content: '是否需要检测心电？',
					cancelText: '不需要', // 默认选择
					confirmText: '需要',
					success: function(res) {
						// 用户选择是否检测心电
						if (res.confirm) {
							that.needECG = true; // 需要检测心电
						} else {
							that.needECG = false; // 不需要检测心电（默认）
						}

						// ⭐ 第二步：原来的“是否确认开始实时检测”弹窗
						uni.showModal({
							title: '检测提示',
							content: `是否确认开始本次慢阻肺实时检测`,
							success: function(res2) {
								if (res2.confirm) {
									// 初始化数据
									that.bloodOxygens = [];
									that.flowRates = [];

									that.startCOPD = true;
									that.showCheckModalCOPD = true;

									console.log("心电检测是否开启:", that.needECG);
								}
							}
						});
					}
				});
			},






			// 点击蓝牙连接列表 准备连接蓝牙 授权是否开启蓝牙
			authorizeBluetoothAdapter() {
				var that = this
				// 蓝牙开启授权
				uni.openBluetoothAdapter({
					success(res) {
						that.startBluetoothSearch()
					},
					fail(err) {
						console.error(err)
					}
				})
			},

			// 打开蓝牙开始搜索附近蓝牙设备
			startBluetoothSearch() {
				var that = this
				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey: false,
					success(res) {
						that.monitorFindBluetoothDevice()
					}
				})
			},

			// 监听搜索到的蓝牙设备
			monitorFindBluetoothDevice() {
				var that = this
				stopSpeak()
				speak("请打开设备蓝牙，连接绑定好的设备")
				uni.onBluetoothDeviceFound(devices => {
					that.addBluetoothDevice()
				})
			},

			// 获取搜索到的蓝牙设备，并过滤非系统设备
			addBluetoothDevice() {
				var that = this
				uni.getBluetoothDevices({
					success(res) {
						let devices = res["devices"]
						for (let deviceItem of devices) {
							let deviceName = deviceItem.name
							let deviceId = deviceItem.deviceId
							const exists = that.bluetoothInfos.some(device => device.deviceId === deviceId);
							if (!exists && deviceName.includes(that.bluetoothKeyName)) {
								let bluetoothInfo = {}
								const handleDeviceName = removeSubstring(deviceName, "ynu_", false, true)
								bluetoothInfo.deviceName = handleDeviceName
								bluetoothInfo.deviceId = deviceId
								that.bluetoothInfos.push(bluetoothInfo)
							}
						}
					}
				})
			},

			// 关闭蓝牙搜索
			stopBluetoothSearch() {
				uni.stopBluetoothDevicesDiscovery({
					success(res) {

					}
				})
			},

			// 连接指定慢阻肺检测蓝牙设备
			startConnectCOPDBluetooth(deviceId) {


				let that = this
				// 询问是否开始监测
				uni.showModal({
					title: '检测提示',
					content: '是否开始连接此慢阻肺检测设备，开始过后请正确使用设备。',
					success: function(res) {
						if (res.confirm) {
							// 定义本次慢阻肺已经连接
							that.isStartCOPDdetect = true
							that.monitorCOPDBluetoothState()
							that.connectCOPDBluetooth(deviceId)


						} else if (res.cancel) {

						}
					}
				});


			},

			// 连接慢阻肺检测设备
			connectCOPDBluetooth(deviceId) {
				let that = this
				that.connectBlueDeviceId = deviceId
				// 创建连接
				uni.createBLEConnection({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId: that.connectBlueDeviceId,
					// 连接成功
					success(res) {
						that.blueteeth_voice();
						uni.showToast({
							title: '成功连接',
							icon: 'success',
							duration: 1500
						})
						that.isConnectedCOPD = true

						// 连接完成后关闭抽屉
						that.$refs.copd_showLeft.close()
						that.startCOPDTimeTamp = new Date().getTime();
						uni.setStorage({
							key: monitorStartTime,
							data: that.startCOPDTimeTamp
						})
						// 执行连接成功的后续处理 获取蓝牙服务列表
						setTimeout(() => {
							// 继续执行其他代码
							that.getBluetoothServices()
						}, 2000);
					},
					// 连接失败
					fail(res) {
						uni.showToast({
							title: '连接失败，请重新连接',
							icon: 'fail',
							duration: 1500
						})
						that.isStartCOPDdetect = false
					}
				});

			},
			// 1. 连接指定哮喘检测蓝牙设备 (对应 startConnectCOPDBluetooth)
			startConnectAsthmaBluetooth(deviceId) {
				let that = this
				// 询问是否开始监测
				uni.showModal({
					title: '检测提示',
					content: '是否开始连接此哮喘检测设备，开始过后请正确使用设备。',
					success: function(res) {
						if (res.confirm) {
							// 定义本次哮喘已经连接
							that.isStartAsthmadetect = true
							that.monitorAsthmaBluetoothState()
							that.connectAsthmaBluetooth(deviceId)
						} else if (res.cancel) {

						}
					}
				});
			},

			// 2. 建立蓝牙连接 (对应 connectCOPDBluetooth)
			connectAsthmaBluetooth(deviceId) {
				let that = this
				that.connectBlueDeviceId = deviceId
				// 创建连接
				uni.createBLEConnection({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId: that.connectBlueDeviceId,
					// 连接成功
					success(res) {
						that.blueteeth_voice(); // 复用语音播报
						uni.showToast({
							title: '成功连接',
							icon: 'success',
							duration: 1500
						})
						that.isConnectedAsthma = true

						// 连接完成后关闭抽屉 (注意 ref 名称要对应 template 中的 ref)
						that.$refs.asthma_showLeft.close()

						that.startAsthmaTimeTamp = new Date().getTime();
						uni.setStorage({
							key: monitorStartTime,
							data: that.startAsthmaTimeTamp
						})
						// 执行连接成功的后续处理 获取蓝牙服务列表
						setTimeout(() => {
							// 继续执行其他代码 (复用获取服务的方法)
							that.getBluetoothServices()
						}, 2000);
					},
					// 连接失败
					fail(res) {
						uni.showToast({
							title: '连接失败，请重新连接',
							icon: 'fail',
							duration: 1500
						})
						that.isStartAsthmadetect = false
					}
				});
			},

			// 3. 监听哮喘蓝牙状态 (对应 monitorCOPDBluetoothState)
			async monitorAsthmaBluetoothState() {
				let that = this
				uni.onBLEConnectionStateChange(async function(res) {
					// 该方法回调中可以用于处理连接意外断开等异常情况
					if (that.connectBlueDeviceId == res.deviceId && !res.connected && that
						.isStartAsthmadetect) {
						console.log("哮喘设备蓝牙已断开")

						// 重置状态
						that.isConnectedAsthma = false
						that.bluetoothInfos = []
						that.isStartAsthmadetect = false
						that.startAsthma = false
						that.showCheckModalAsthma = false
						that.bleAsthmaDataBuffer = '';

						// 断开连接清理资源
						that.disconnectBluetooth()

						let endTimeTamp = new Date().getTime()
						uni.setStorage({
							key: monitorEndTime,
							data: endTimeTamp
						})

						uni.showToast({
							title: "蓝牙异常断开",
							icon: "none",
							duration: 3000
						})

						// 断开时尝试上传已有的数据 (调用新写的哮喘上传工具)
						// 注意：需要确保 uploadAsthmaFilesToOss 已在 script 顶部引入
						let isSuccess = await uploadAsthmaFilesToOss(that.startAsthmaTimeTamp, endTimeTamp)

						if (!isSuccess) {
							console.error("哮喘数据自动上传失败");
							that.haveNotUpAsthmaFile = true // 标记有未上传文件
							uni.showToast({
								title: "上传失败，请重新检测",
								icon: "none",
								duration: 1000
							});
						} else {
							console.log("哮喘数据自动上传成功");
						}
					}
				})
			},
			blueteeth_voice() {
				stopSpeak();
				speak("蓝牙已连接")
			},

			// 连接指定睡眠监测蓝牙设备
			async startConnectSleepBluetooth(deviceId) {
				let that = this
				// 询问是否开始监测
				uni.showModal({
					title: '检测提示',
					content: '是否开始睡眠监测，如开始请先佩戴好设备。',
					success: function(res) {
						if (res.confirm) {
							// 开始新的睡眠监测，存在未上传则直接删除
							if (that.haveNotUpSleepFile) {
								// 清理本地缓存并删除文件
								deleteStorageAndFiles()
								that.haveNotUpSleepFile = false
							}
							// 定义本次睡眠记录开始时间
							that.startTimeTamp = new Date().getTime();
							that.bioArrs = [
								[],
								[]
							]
							that.snoreArrs = [
								[],
								[]
							]
							// 是继续监测的情况 则不用创建文件
							if (that.sleepFiles.length == 3) {
								let filename = that.sleepFiles[0]
								// 提取出文件的时间戳
								let match = filename.match(/_(\d+)\.txt/);
								that.startTimeTamp = match[1]
							} else {
								// 创建睡眠数据文件
								createSleepDataFiles(that.startTimeTamp)
							}
							uni.setStorage({
								key: monitorStartTime,
								data: that.startTimeTamp
							})
							that.isStartSleepdetect = true
							that.monitorSleepBluetoothState()
							that.connectSleepBluetooth(deviceId)
						} else if (res.cancel) {

						}
					}
				});
			},

			// 确定开始监测，连接指定睡眠蓝牙设备
			connectSleepBluetooth(deviceId) {
				let that = this
				that.connectBlueDeviceId = deviceId
				// 创建连接
				uni.createBLEConnection({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId: that.connectBlueDeviceId,
					// 连接成功
					success(res) {
						uni.showToast({
							title: '开始监测',
							icon: 'success',
							duration: 1500
						})
						that.isConnectedSleep = true
						// 连接完成后关闭抽屉
						that.$refs.sleep_showLeft.close()

						// 执行连接成功的后续处理 获取蓝牙服务列表
						setTimeout(() => {
							// 继续执行其他代码
							that.getBluetoothServices()
						}, 2000);
					},
					// 连接失败
					fail(res) {
						uni.showToast({
							title: '连接失败，请重新连接',
							icon: 'fail',
							duration: 1500
						})
						deleteSleepFiles(that.startTimeTamp)
						that.isStartSleepdetect = false
					}
				})
			},

			// 监听睡眠监测设备蓝牙连接状态
			async monitorSleepBluetoothState() {
				let that = this
				uni.onBLEConnectionStateChange(async function(res) {
					// 该方法回调中可以用于处理连接意外断开等异常情况
					if (that.connectBlueDeviceId == res.deviceId && !res.connected && that
						.isStartSleepdetect) {
						that.isConnectedSleep = false
						that.bluetoothInfos = []
						that.isStartSleepdetect = false
						// 判断是否数据上传
						// 检测时间大于七个小时才是有效时间 直接删除睡眠数据 不符合规定时长
						let curretntTimeTamp = new Date().getTime()
						let startTimeTamp = that.startTimeTamp
						// 计算此次睡眠检测总时长
						let sleepDetectTime = formatTimeInterval(startTimeTamp, curretntTimeTamp)
						let endTimeTamp = new Date().getTime()
						// 满足监测时长被断开时，直接上传本次监测数据
						if (sleepDetectTime >= that.minDetectTime) {
							// 记录睡眠结束时间
							uni.setStorage({
								key: monitorEndTime,
								data: endTimeTamp
							})
							//上传睡眠数据
							showLoading('正在上传睡眠监测数据')
							let isSuccess = await uploadSleepFilesToOss(startTimeTamp, endTimeTamp)
							// 文件上传有误
							if (!isSuccess) {
								that.haveNotUpSleepFile = true
							}
						}
					}
				})
			},

			async monitorCOPDBluetoothState() {
				let that = this
				uni.onBLEConnectionStateChange(async function(res) {
					// 该方法回调中可以用于处理连接意外断开等异常情况
					if (that.connectBlueDeviceId == res.deviceId && !res.connected && that.isStartCOPDdetect) {
						console.log("蓝牙已断开")
						that.isConnectedCOPD = false
						that.bluetoothInfos = []
						that.isStartCOPDdetect = false
						that.startCOPD = false
						that.showCheckModalCOPD = false
						that.bleCOPDDataBuffer = '';
						that.disconnectBluetooth()
						let curretntTimeTamp = new Date().getTime()
						let startTimeTamp = that.startTimeTamp
						let endTimeTamp = new Date().getTime()
						// 满足监测时长被断开时，直接上传本次监测数据
						uni.setStorage({
							key: monitorEndTime,
							data: endTimeTamp
						})
						//上传COPD数据
						uni.showToast({
							title: "蓝牙异常",
							icon: "none",
							duration: 3000
						})
						console.error("OSS 上传失败：", err);
						uni.showToast({
							title: "上传失败，请重新检测",
							icon: "none",
							duration: 1000
						});
						const isSuccess = false; // 保证变量仍有值

						// 文件上传有误
						if (!isSuccess) {
							that.haveNotUpCOPDFile = true
						}
					}
				})
			},

			// 获取蓝牙服务列表
			getBluetoothServices() {
				let that = this
				uni.getBLEDeviceServices({
					deviceId: that.connectBlueDeviceId,
					success(res) {
						that.BIEServices = res.services
						console.log("搜索到的所有服务:", that.BIEServices);

						// 🔥🔥🔥【核心修复开始】🔥🔥🔥
						// 如果是哮喘设备，我们不仅要遍历，更要精准定位到它的专属服务
						// 硬件代码里的 UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
						if (that.isConnectedAsthma) {
							let targetUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

							// 寻找这个特定服务的下标
							let targetIndex = that.BIEServices.findIndex(item =>
								item.uuid.toLowerCase().includes("4faf") ||
								item.uuid.toLowerCase() == targetUuid
							);

							if (targetIndex !== -1) {
								console.log("✅ 锁定哮喘专属服务，索引:", targetIndex);
								that.serviceIndex = targetIndex;
							} else {
								console.log("⚠️ 未找到哮喘专属服务，尝试默认逻辑");
								that.serviceIndex = 0;
							}
						} else {
							// 其他设备保持原样，从 0 开始找
							that.serviceIndex = 0;
						}
						// 🔥🔥🔥【核心修复结束】🔥🔥🔥

						// 重置标志位
						that.notify = false;
						that.write = false;
						that.read = false;

						// 获取特征值
						that.getCharacteristics()
					},
					fail(res) {
						console.error("获取服务失败", res);
					}
				})
			},

			// 获取蓝牙设备某个服务中支持notify 或者 indicate的特征值
			getCharacteristics() {
				let that = this
				var index = that.serviceIndex;
				var notify = that.notify;
				var write = that.write;
				var read = that.read;
				uni.getBLEDeviceCharacteristics({
					deviceId: that.connectBlueDeviceId,
					serviceId: that.BIEServices[index].uuid,
					success: function(res) {
						for (var i = 0; i < res.characteristics.length; i++) {
							var properties = res.characteristics[i].properties;
							var charaterId = res.characteristics[i].uuid;
							console.log(`[特征值] ${charaterId} 支持属性:`, properties);
							if (!notify) {
								if (properties.notify) {
									that.BLEInformation.notifyCharaterId = charaterId;
									that.BLEInformation.notifyServiceId = that.BIEServices[index].uuid;
									notify = true;
								}
							}
							if (!write) {
								if (properties.write) {
									that.BLEInformation.writeCharaterId = charaterId;
									that.BLEInformation.writeServiceId = that.BIEServices[index].uuid;
									write = true;
								} else if (properties.writeWithoutResponse) {
									that.BLEInformation.writeCharaterId = charaterId;
									that.BLEInformation.writeServiceId = that.BIEServices[index].uuid;
									write = true;
									that.BLEInformation.writeType = 'writeWithoutResponse';
								}
							}
							if (!read) {
								if (properties.read) {
									that.BLEInformation.readCharaterId = charaterId;
									that.BLEInformation.readServiceId = that.BIEServices[index].uuid;
									read = true;
								}
							}
						}
						if (!notify) {
							index++
							that.write = write
							that.read = read
							that.notify = notify
							that.serviceIndex = index
							if (index == that.BIEServices.length) {
								that.write = false
								that.read = false
								that.notify = false
								that.serviceIndex = 0
								wx.showModal({
									title: '提示',
									content: '找不到该读写的特征值',
								})
							} else {
								that.getCharacteristics();
							}
						} else {
							that.monitorCharacteristicValueChange();
							if (that.isConnectedCOPD) {

								console.log('启用copd成功')
							}
						}
					}
				})
			},

			// 监听蓝牙设备发送的数据
			monitorCharacteristicValueChange() {
				let that = this
				uni.notifyBLECharacteristicValueChange({
					state: true,
					deviceId: that.connectBlueDeviceId,
					serviceId: that.BLEInformation.notifyServiceId,
					characteristicId: that.BLEInformation.notifyCharaterId,
					success: function(res) {
						console.log('启用notify成功')
						console.log('notifyBLECharacteristicValueChange success', res.errMsg);
					},
					fail: function(res) {
						console.log('启用notify')
					},
				})
				that.receiveBluetoothSentData()
			},

			// 正式接收蓝牙发送的数据
			receiveBluetoothSentData() {
				let that = this
				// 设置设备发送的最大MTU ios不设置
				that.setMaxMTU()
				uni.$on('value', (res) => {
					const receiveData = buf2string(res.value)
					if (that.isStartSleepdetect) {
						that.processSleepBlueReceiveData(receiveData)
					}
					if (that.isStartCOPDdetect) {
						that.processCOPDBLEData(receiveData)
					}
					if (that.isStartAsthmadetect) {
						that.processAsthmaBLEData(receiveData)
					}
				})

			},

			// 通知蓝牙设备可以发送数据
			noticeBluetoothStartSent(id) {
				let that = this
				if (that.isConnectedSleep) {
					var buffer = new ArrayBuffer(that.noticeBlueText.length)
					var dataView = new Uint8Array(buffer)
					for (var i = 0; i < that.noticeBlueText.length; i++) {
						dataView[i] = that.noticeBlueText.charCodeAt(i)
					}
					uni.writeBLECharacteristicValue({
						deviceId: that.connectBlueDeviceId,
						serviceId: that.BLEInformation.writeServiceId,
						characteristicId: that.BLEInformation.writeCharaterId,
						value: buffer,
						success: function(res) {
							console.log(res)
						},
						fail: function(res) {
							console.log(res)
							console.log('通知蓝牙发送数据失败')
						}
					})
				} else if (that.isConnectedCOPD) {
					var buffer = new ArrayBuffer(that.copdBlueComannd[id].length)
					var dataView = new Uint8Array(buffer)
					for (var i = 0; i < that.copdBlueComannd[id].length; i++) {
						dataView[i] = that.copdBlueComannd[id].charCodeAt(i)
					}
					console.log('copd')
					setTimeout(() => {
						uni.writeBLECharacteristicValue({
							deviceId: that.connectBlueDeviceId,
							serviceId: that.BLEInformation.writeServiceId,
							characteristicId: that.BLEInformation.writeCharaterId,
							value: dataView,
							writeType: 'write',
							success: function(res) {
								console.log(res)
							},
							fail: function(res) {
								console.log(res)
								console.log(that.BLEInformation.writeCharaterId)
								console.log(that.BLEInformation.writeServiceId)
								console.log('通知蓝牙发送数据失败')
							}
						})
					}, 1000)
				} else {
					uni.showToast({
						title: '蓝牙已断开',
						icon: 'fail',
						duration: 1000
					})
				}
			},

			// 设置设备发送的最大MTU ios无此方法
			setMaxMTU() {
				let that = this
				// 设置蓝牙设备 MTU 大小
				const mtu = 512;
				uni.setBLEMTU({
					deviceId: that.connectBlueDeviceId,
					mtu,
					success: (res) => {
						// console.log("设置最大发送MTU成功");
					},
					fail: (res) => {
						// console.log("设置最大发送MTU失败");
					}
				});
			},

			// 断开蓝牙
			disconnectBluetooth() {
				const that = this
				that.isConnectedSleep = false
				that.isConnectedCOPD = false
				that.bluetoothInfos = []
				uni.$off('value')
				// 断开蓝牙连接
				uni.closeBLEConnection({
					deviceId: that.connectBlueDeviceId, // 假设这里是保存了设备的 deviceId
					success(res) {
						console.log('断开蓝牙连接成功');
					},
					fail(err) {
						console.error('断开蓝牙连接失败', err)
					}
				});

				speak("蓝牙已断开");
				stopSpeak();
			},

			// 处理收到的心电数据
			processBlueReceiveBio(dataArray) {

				const headMark = dataArray[0]
				// 去掉字符串前面的 'B'
				let cleanedStr = headMark.substring(1);
				// // 使用 '-' 分割字符串
				let parts = cleanedStr.split('-');
				// 标识多少秒的数据
				let second = parseInt(parts[0], 10);
				// 标识某一秒第几部分的数据
				let indexOfSecond = parseInt(parts[1], 10);

				// 一秒总共分为几部分
				let partNum = 2

				// 数据分割
				let data = dataArray.slice(1).join(" ")
				// 每隔一分钟的数据保存文件
				let timeInterval = 60

				// 定义本次数据放在二维数组的位置
				let indexOfBioArrs = Math.floor(second / timeInterval) % 2

				// 数据在目标数组的下标
				let index = (second * partNum + indexOfSecond) % (partNum * timeInterval)
				// 存入数据
				this.bioArrs[indexOfBioArrs][index] = data

				// 触发保存数据到文件 多等5秒保存另一个数组数据
				if ((second % timeInterval == 4) && (indexOfSecond == 0)) {
					let anotherBioIndex = (indexOfBioArrs + 1) % 2
					if (this.bioArrs[anotherBioIndex].length > 0) {
						// 保存数据到文件
						let saveToFileDataArr = this.bioArrs[anotherBioIndex]
						this.bioArrs[anotherBioIndex] = []
						let fileName = 'bioelectricity_' + this.startTimeTamp + '.txt'
						appendBioDataToFile(fileName, saveToFileDataArr)
					}
				}
			},

			// 处理收到的声音电信号数据
			processBlueReceiveSnore(dataArray) {
				const headMark = dataArray[0]
				// 去掉字符串前面的 'S'
				let cleanedStr = headMark.substring(1);
				// 使用 '-' 分割字符串
				let parts = cleanedStr.split('-');

				// 标识多少秒的数据
				let second = parseInt(parts[0], 10);
				// 标识某一秒第几部分的数据
				let indexOfSecond = parseInt(parts[1], 10);
				// 一秒总共分为几部分
				let partNum = 200

				// 数据分割
				let data = dataArray.slice(1).join(" ")

				// 每隔一分钟的数据保存文件
				let timeInterval = 60

				// 定义本次数据放在二维数组的位置
				let indexOfsnoreArrs = Math.floor(second / timeInterval) % 2

				// 数据在目标数组的下表
				let index = (second * partNum + indexOfSecond) % (partNum * timeInterval)

				// 存入数据
				this.snoreArrs[indexOfsnoreArrs][index] = data
				// 触发保存数据到文件 多等10秒保存另一个数组数据
				if ((second % timeInterval == 9) && (indexOfSecond == 0)) {
					let anotherSnoreIndex = (indexOfsnoreArrs + 1) % 2
					if (this.snoreArrs[anotherSnoreIndex].length > 0) {
						// 保存数据到文件
						let saveToFileDataArr = this.snoreArrs[anotherSnoreIndex]
						this.snoreArrs[anotherSnoreIndex] = []
						let fileName = 'snore_' + this.startTimeTamp + '.txt'
						appendSnoreDataToFile(fileName, saveToFileDataArr)
					}
				}
			},

			// 处理接收到的血氧数据
			processBlueReceiveOxygen() {
				const headMark = dataArray[0]
				const second = headMark.charAt(1)
				// 每隔一分钟的数据保存文件
				let timeInterval = 60
				// 定义本次数据放在二维数组的位置
				let indexOfOxygenArrs = Math.floor(second / timeInterval) % 2
				let index = second % timeInterval
				// 取出数据
				let oxygenData = dataArray[1]
				// 存入数据
				this.oxygenArrs[indexOfOxygenArrs][index] = oxygenData
				if (second % timeInterval == 9) {
					let anotherOxygenIndex = (indexOfOxygenArrs + 1) % 2
					if (this.oxygenArrs[anotherOxygenIndex].length > 0) {
						let saveToFileDataArr = this.oxygenArrs[anotherOxygenIndex]
						this.oxygenArrs[anotherOxygenIndex] = []
						// 保存saveToFileDataArr数据到文件
						let fileName = 'oxygen_' + this.startTimeTamp + '.txt'
						appendOxygenDataToFile(fileName, saveToFileDataArr)
					}
				}
			},

			// 处理蓝牙接收到的数据
			processSleepBlueReceiveData(receiveData) {
				const dataArray = receiveData.split(" ")
				const headMark = dataArray[0]
				const dataSource = headMark.charAt(0)
				if (dataSource == "B") {
					this.processBlueReceiveBio(dataArray)
				} else if (dataSource == "P") {
					let data = dataArray.slice(1).join(",");
					appendPositionDataToFile('position_' + this.startTimeTamp + '.txt', data)
				} else if (dataSource == "S") {
					this.processBlueReceiveSnore(dataArray)
				} else if (dataSource == "O") {
					this.processBlueReceiveOxygen(dataArray)
				} else {
					console.log("发现无标识数据--->", dataArray)
				}
			},

			processCOPDBlueReceiveData(receiveData) {
				console.log("收到数据")
				const dataArray = receiveData.split(" ")
				// const dataArray=dataArray_1.filter(item => {
				//   const num = Number(item);
				//   return !isNaN(num) && item.trim() !== '';
				// });
				// console.log("处理后的")
				// console.log(dataArray)

				const headMark = dataArray[0]
				const dataSource = headMark.charAt(0)
				if (dataSource == "F") {
					this.processBlueCOPD_Flow(dataArray)
					this.blueStatuFile = 'F'
				} else if (dataSource == "I") {
					this.processBlueCOPD_IR(dataArray)
					this.blueStatuFile = 'I'
				} else if (dataSource == "R") {
					this.processBlueCOPD_R(dataArray)
					this.blueStatuFile = 'R'
				} else if (dataSource == "E") {
					this.processBlueCOPD_ECG(dataArray)
					this.blueStatuFile = 'E'
				} else if (dataSource == "B") {
					this.processBlueCOPD_Breath(dataArray)
					this.blueStatuFile = 'B'
				} else {
					if (this.blueStatuFile != undefined && this.blueStatuFile != null && this.blueStatuFile != '') {
						//dataArray.unshift(this.blueStatuFile) 
						console.log("发现无标识数据--->", dataArray)
						// this.processCOPDBlueReceiveData(dataArray)
					}
				}
			},
			processCOPDBLEData(dataChunk) {
				console.log("发现数据--->", dataChunk);
				this.bleCOPDDataBuffer += dataChunk;
				let lines = this.bleCOPDDataBuffer.split('#'); // 按行切分 
				while (lines.length > 1) {
					const completeLine = lines.shift(); // 一条完整数据
					console.log(completeLine)
					const store = useCommandStore()
					store.saveCollectedData(completeLine)
					this.processCOPDBlueReceiveData(completeLine);
				}
				this.bleCOPDDataBuffer = lines[0]; // 保留未完成的最后一行
			},

			processBlueCOPD_Flow(dataArray) {
				let saveToFileDataArr = dataArray.slice(1);
				let fileName = 'flow_' + this.startCOPDTimeTamp + '.txt'
				appendCOPDDataToFile(fileName, saveToFileDataArr)
			},
			processBlueCOPD_IR(dataArray) {
				let saveToFileDataArr = dataArray.slice(1);
				let fileName = 'ir_' + this.startCOPDTimeTamp + '.txt'
				appendCOPDDataToFile(fileName, saveToFileDataArr)
			},
			processBlueCOPD_R(dataArray) {
				let saveToFileDataArr = dataArray.slice(1);
				let fileName = 'r_' + this.startCOPDTimeTamp + '.txt'
				appendCOPDDataToFile(fileName, saveToFileDataArr)
			},
			processBlueCOPD_ECG(dataArray) {
				let saveToFileDataArr = dataArray.slice(1);
				let fileName = 'ecg_' + this.startCOPDTimeTamp + '.txt'
				appendCOPDDataToFile(fileName, saveToFileDataArr)
			},
			processBlueCOPD_Breath(dataArray) {
				let saveToFileDataArr = dataArray.slice(1);
				let fileName = 'resp_' + this.startCOPDTimeTamp + '.txt'
				appendCOPDDataToFile(fileName, saveToFileDataArr)
			},

			//获取用户最近一次睡眠数据上传时间
			getLatestUploadSleepTime() {
				let obj = {
					method: "GET",
					showLoading: true,
					url: `/user/getLatestSleepTime`,
					data: {

					},
					message: "正在获取数据"
				}
				request(obj).then(res => {
					let latestTimetamp = res.data
					if (latestTimetamp == null) {
						this.recentUpSleepTime = '暂无'
					} else {
						this.recentUpSleepTime = formatLatestSleepTime(latestTimetamp)
					}
				}).catch(err => {
					showToast("请稍后重试！", 1500)
				});
			},

			// 获取绑定的设备信息
			getBindDeviceInfos() {
				return new Promise((resolve, reject) => {

					let obj = {
						method: "GET",
						showLoading: false,
						url: `/device/getBindDevice`,
						data: {},
						message: "正在获取数据"
					}

					request(obj).then(res => {
						let resData = res.data
						// 1. 【新增】初始化/重置哮喘相关的数组
						this.isExistAsthmaDevice = false
						this.AsthmaDeviceInfos = []
						this.applyAsthmaDeviceInfos = []

						// ⭐⭐⭐ 原业务逻辑保持不变 ⭐⭐⭐
						this.isExistSleepDevice = false
						this.isExistCOPDDevice = false

						this.sleepDeviceInfos = []
						this.applySleepDeviceInfos = []
						this.COPDDeviceInfos = []
						this.applyCOPDDeviceInfos = []

						for (let i = 0; i < resData.length; i++) {
							let deviceData = resData[i]
							let color = "colorSet1"
							let iconSrc = "/static/images/device/sleep.png"
							let deviceInfo = {}
							deviceInfo.serialCode = deviceData.serialCode

							let date = ''
							if (deviceData.status == 1) {
								date = new Date(deviceData.activationTime);
							} else {
								date = new Date(deviceData.applicationTime);
							}

							const year = date.getFullYear();
							const month = (date.getMonth() + 1).toString().padStart(2, '0');
							const day = date.getDate().toString().padStart(2, '0');
							const formattedDate = `${year}-${month}-${day}`;

							if (deviceData.deviceName === '慢阻肺检测仪') {
								color = "colorSet2"
								iconSrc = "/static/images/device/manzufei.png"
							}

							//                    if (deviceData.deviceName === '哮喘检测仪') {
							//                                        color = "colorSet" // 使用与慢阻肺相同的紫色系，或者你在组件里自定义的颜色
							//                                        iconSrc = "/static/images/device/xiaochuan.png" // 确保static目录下有这张图
							//                                    }					

							if (deviceData.status == 1) {
								deviceInfo.activeDate = formattedDate
								deviceInfo.name = deviceData.deviceName
								let deviceInfoAll = {
									deviceInfo,
									isViewRule: false,

									// ===== 原有字段（睡眠 / 慢阻肺还能继续用）=====
									color: color,
									iconSrc: iconSrc,

									// ===== 新增字段（给哮喘用，不影响旧逻辑）=====
									bgTopClass: '',
									bgBottomClass: '',
									arrowClass: '',
									btnClass: ''
								}


								if (deviceData.deviceName === '睡眠呼吸检测仪') {
									this.isExistSleepDevice = true
									this.sleepDeviceInfos.push(deviceInfoAll)
								}

								if (deviceData.deviceName === '慢阻肺检测仪') {
									this.isExistCOPDDevice = true
									this.COPDDeviceInfos.push(deviceInfoAll)
								}
								// if (deviceData.deviceName === '哮喘检测仪') {

								//     this.isExistAsthmaDevice = true
								//     this.AsthmaDeviceInfos.push(deviceInfoAll)
								//      }
								if (deviceData.deviceName === '哮喘检测仪') {
									this.isExistAsthmaDevice = true

									// ⭐ 哮喘专属主题样式（你刚在 pages.device.css 里加的）
									deviceInfoAll.bgTopClass = 'bgColorTop5'
									deviceInfoAll.bgBottomClass = 'bgColorTBottom5'
									deviceInfoAll.arrowClass = 'arrowIcon5'
									deviceInfoAll.btnClass = 'useBtnBgColor5'

									// 图标还是正常给
									deviceInfoAll.iconSrc = "/static/images/device/xiaochuan.png"

									this.AsthmaDeviceInfos.push(deviceInfoAll)
								}

							} else {
								deviceInfo.applicationDate = formattedDate
								deviceInfo.status = deviceData.status
								deviceInfo.name = deviceData.deviceName
								let deviceInfoAll = {
									deviceInfo,
									isViewRule: false,
									color: color,
									iconSrc
								}

								if (deviceData.deviceName === '睡眠呼吸检测仪') {
									this.applySleepDeviceInfos.push(deviceInfoAll)
								}

								if (deviceData.deviceName === '慢阻肺检测仪') {
									this.applyCOPDDeviceInfos.push(deviceInfoAll)
								}

								if (deviceData.deviceName === '哮喘检测仪') {
									this.applyAsthmaDeviceInfos.push(deviceInfoAll)
								}
							}
						}

						resolve() // ⭐⭐⭐ 数据加载完成，通知外部 await

					}).catch(err => {
						showToast("请稍后重试！", 1500)
						reject(err) // ⭐ 失败也要 reject
					})

				})
			},


			// 处理文件二次上传情况
			async retryUpLoadFile() {
				showLoading('正在尝试重新上传睡眠检测数据')
				let isSuccess = await retryUploadSleepFilesToOss()
				if (isSuccess) {
					this.haveNotUpSleepFile = false
				}
			},

			// 处理蓝牙重新连接后继续监测,查询出文件
			processContinueMonitor() {
				let that = this;
				let timeStamp = null;
				let currentTimeStamp = new Date().getTime();
				// 获取 _documents/ 目录对象
				plus.io.resolveLocalFileSystemURL('_documents/', (entry) => {
					const directoryReader = entry.createReader();

					// 读取目录下的所有文件
					directoryReader.readEntries((entries) => {
						let snoreFile = null;
						let positionFile = null;
						let bioelectricityFile = null;

						// 遍历文件条目
						entries.forEach((entry) => {
							if (entry.isFile && entry.name.endsWith('.txt')) {
								// 匹配 snore、position、bioelectricity，并提取时间戳
								const snoreMatch = entry.name.match(/snore_(\d+)\.txt/);
								const positionMatch = entry.name.match(/position_(\d+)\.txt/);
								const bioelectricityMatch = entry.name.match(
									/bioelectricity_(\d+)\.txt/);

								// 如果找到 snore 文件
								if (snoreMatch) {
									const currentTimestamp = snoreMatch[1]; // 提取时间戳
									// 如果没有记录时间戳，则使用第一个找到的文件的时间戳
									if (!timeStamp) {
										timeStamp = currentTimestamp;
										snoreFile = entry.name;
									} else if (currentTimestamp === timeStamp) {
										snoreFile = entry.name; // 时间戳一致则记录
									}
								}

								// 如果找到 position 文件
								if (positionMatch) {
									const currentTimestamp = positionMatch[1]; // 提取时间戳
									if (!timeStamp) {
										timeStamp = currentTimestamp;
										positionFile = entry.name;
									} else if (currentTimestamp === timeStamp) {
										positionFile = entry.name; // 时间戳一致则记录
									}
								}

								// 如果找到 bioelectricity 文件
								if (bioelectricityMatch) {
									const currentTimestamp = bioelectricityMatch[1]; // 提取时间戳
									if (!timeStamp) {
										timeStamp = currentTimestamp;
										bioelectricityFile = entry.name;
									} else if (currentTimestamp === timeStamp) {
										bioelectricityFile = entry.name; // 时间戳一致则记录
									}
								}
							}
						});

						// 判断是否找到了三个文件且时间戳一致
						if (snoreFile && positionFile && bioelectricityFile && (currentTimeStamp -
								timeStamp <= 6000000)) {
							that.sleepFiles = [snoreFile, positionFile, bioelectricityFile];
							console.log('找到符合条件的文件:', that.sleepFiles);
						} else {
							// 如果没有找到匹配的文件或时间戳不一致，删除相关文件
							entries.forEach((entry) => {
								if (entry.isFile && entry.name.endsWith('.txt')) {
									// 检查文件名是否包含 snore、position、bioelectricity
									if (entry.name.includes('snore') || entry.name.includes(
											'position') || entry.name.includes('bioelectricity')) {
										// 删除文件
										entry.remove(() => {
											console.log('删除文件成功:', entry.name);
										}, (error) => {
											console.log('删除文件失败:', entry.name, error);
										});
									}
								}
							});
						}
					}, (error) => {
						console.log('读取目录出错：', error);
					});
				}, (error) => {
					console.log('无法访问目录：', error);
				});
			},

			// 封装的函数，检查状态并弹出询问弹窗
			requestBatteryOptimizationPermission() {
				// 检查当前是否忽略了电池优化
				let that = this
				checkBatteryOptimizeStatus().then((isIgnoring) => {
					that.isBatteryOptimizationIgnored = isIgnoring; // 存储状态
					if (isIgnoring) {
						console.log("应用当前已忽略电池优化，无需再次请求");
					} else {
						// 应用当前未忽略电池优化，弹窗询问用户
						uni.showModal({
							title: '后台运行权限',
							content: '是否授权应用后台无限制运行？授权后才能进行睡眠监测。',
							success: (res) => {
								if (res.confirm) {
									// 用户同意，尝试忽略电池优化
									requestIgnoreBatteryOptimization().then((result) => {
										that.isBatteryOptimizationIgnored = result; // 更新状态
										if (result) {
											console.log("用户允许忽略电池优化");
										} else {
											console.log("用户未允许忽略电池优化");
										}
									}).catch((err) => {
										console.log("忽略电池优化请求失败: ", err);
									});
								} else if (res.cancel) {
									console.log("用户拒绝忽略电池优化");
								}
							}
						});
					}
				}).catch((err) => {
					console.log("检查电池优化状态失败: ", err);
				});
			}
		},

		onPullDownRefresh() {

			// 连接数据先置空
			this.sleepDeviceInfos = []
			this.applySleepDeviceInfos = []
			this.COPDDeviceInfos = []
			this.applyCOPDDeviceInfos = []

			this.getBindDeviceInfos()
			this.getLatestUploadSleepTime()

			// 需要重新上传睡眠文件的情况
			if (uni.getStorageSync(isExistNotUpSleepFile)) {
				this.retryUpLoadFile()
			} else {
				this.haveNotUpSleepFile = false
			}

			uni.stopPullDownRefresh()
		},
		onLoad() {
			// 存在有未上传完成的文件
			if (uni.getStorageSync(isExistNotUpSleepFile)) {
				this.haveNotUpSleepFile = true
			} else {
				this.processContinueMonitor()
			}
			//this.getBindDeviceInfos()

			this.getLatestUploadSleepTime()

			checkBatteryOptimizeStatus().then((isIgnoring) => {
				this.isBatteryOptimizationIgnored = isIgnoring
			});
		}
	}
</script>

<style>
	@import "device.css";
</style>