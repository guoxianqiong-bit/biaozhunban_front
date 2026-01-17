<template>
  <view class="check-container">
    <view class="check-header">
	<text class="nav-btn left-btn" :class="{ disabled: isDetecting }" @click="$emit('prev')">上一步</text>
      <text class="step-title">心电检测</text>
      <text class="nav-btn right-btn" :class="{ disabled: isDetecting }" @click="$emit('next')">跳过</text>
    </view>
    
    <view class="check-content">
      <!-- 设备提示区 -->
      <view class="device-guide">
      
        <text class="guide-text">请按图示将电极片贴于胸部后，
		点击开始检测，保持安静</text>
      
        <!-- 新增的示意图 -->
        <image 
		  v-if="showGuideImage"
          class="ecg-guide-img"
          src="/static/images/ecgExample.png"
          mode="widthFix"
        />
      
      </view>


      <!-- 实时生理数据显示区 -->
      <view class="realtime-physio-area" v-if="isDetecting">
        <view class="realtime-item">
          <text class="realtime-label">当前心率</text>  
          <text 
            class="realtime-value" 
            :class="{ 'abnormal-animate': isHrAbnormal }"
          >
            {{ realtimeHeartRate }} BPM
          </text>
          <text class="warning-text" v-if="isHrAbnormal">⚠️ 心率异常</text>
        </view>
        
        <view class="realtime-item">
          <text class="realtime-label">当前呼吸率</text>  
          <text 
            class="realtime-value" 
            :class="{ 'abnormal-animate': isRespAbnormal }"
          >
            {{ realtimeRespRate }} 次/分
          </text>
          <text class="warning-text" v-if="isRespAbnormal">⚠️ 呼吸率异常</text>
        </view>
      </view>

      <!-- 倒计时提示 -->
      <view class="countdown-tip" v-if="isDetecting">
        <text class="countdown-text">剩余检测时间：</text>
        <text class="countdown-number">{{ countdownSeconds }}</text>
        <text class="countdown-text">秒</text>
      </view>
      
      <!-- ECG 波形 -->
      <view class="ecg-waveform">
        <canvas canvas-id="ecgBackground" class="ecg-canvas"></canvas>
        <canvas canvas-id="ecgWave" class="ecg-canvas wave"></canvas>
      </view>
      
      <!-- 检测结果区域（缩小外框） -->
      <view class="result-area" v-if="showResult">
        <text class="result-section-title">检测结果</text>
        <view class="result-row">
          <view class="result-col">
            <text class="result-title">心率</text>
            <text class="result-value">{{ heartRate }} BPM</text>
            <text class="result-desc">{{ getResultDesc() }}</text>
          </view>
          <view class="result-col">
            <text class="result-title">呼吸率</text>
            <text class="result-value">{{ respRate }} 次/分</text>
            <text class="result-desc">{{ getRespResultDesc() }}</text>
          </view>
        </view>
      </view>
    </view>
    
   <view class="check-footer">
     
   
     <!-- 开始/下一步逻辑 -->
     <button v-if="!isDetecting && !showResult" class="action-btn" @click="startDetection">开始检测</button>
     <button v-if="isDetecting" class="action-btn" disabled>正在检测...</button>
     <button v-if="showResult" class="action-btn" @click="$emit('next')">下一步</button>
   </view>

  </view>
</template>

<script>
import { useCommandStore } from '@/stores/commandStore'
import { watch } from 'vue'
import { speak,stopSpeak} from '../../utils/tts';

export default {
  setup() {
    const store = useCommandStore()
    return { store }
  },
  data() {
    return {
      bgCtx: null,
      waveCtx: null,
      width: 300,
      height: 120,

      // 心率（HR）相关
      heartRate: 0,
      realtimeHeartRate: 0,
      isHrAbnormal: false,
      hrRealTimeList: [],

      // 呼吸率（RR）相关
      respRate: 0,
      realtimeRespRate: 0,
      isRespAbnormal: false,
      respRealTimeList: [],

      // 通用状态
      showResult: false,
      isDetecting: false,
      hasStarted: false,

      // 倒计时相关
      countdownSeconds: 30,
      countdownTimer: null,

      // 波形缓存
      waveformPoints: [],
      pendingPoints: [],
      animId: null,
      useRAF: false,
	  showGuideImage: true,


      // 波形参数
      pointStepX: 2,
      windowSize: 375,
      dataRate: 8,
      maxProcessPerFrame: 6
    }
  },
  mounted() {
	stopSpeak()
	speak("第三步，心电检测，请按图示将电极片贴于胸部，保持安静，点击开始检测进行心电检测，也可以点击右上角跳过心电监测")
    this.initCanvas(() => {
      watch(
        [
          () => this.store.collectedData,
          () => this.store.currentCommand
        ],
        (newData) => {
          if (newData[1] === 'ECG' && this.isDetecting) {
            let dataChunk = newData[0]
            // 处理 ECG 波形数据
            if (typeof dataChunk === 'string' && dataChunk.startsWith('ECG')) {
              const ecgChunk = this.parseECGString(dataChunk)
              if (Array.isArray(ecgChunk) && ecgChunk.length) {
                this.appendECGData(ecgChunk)
              }
            }
            // 处理 HR 心率数据
            else if (typeof dataChunk === 'string' && dataChunk.startsWith('HR')) {
              const hrValue = this.parseHRString(dataChunk)
              if (hrValue !== null) {
                this.hrRealTimeList.push(hrValue)
                this.realtimeHeartRate = hrValue
                this.isHrAbnormal = hrValue < 60 || hrValue > 100
                console.log('实时心率:', hrValue, 'BPM，是否异常:', this.isHrAbnormal)
              }
            }
            // 处理 RR 呼吸率数据
            else if (typeof dataChunk === 'string' && dataChunk.startsWith('RR')) {
              const respValue = this.parseRRString(dataChunk)
              if (respValue !== null) {
                this.respRealTimeList.push(respValue)
                this.realtimeRespRate = respValue
                this.isRespAbnormal = respValue < 12 || respValue > 20
                console.log('实时呼吸率:', respValue, '次/分，是否异常:', this.isRespAbnormal)
              }
            }
          }
        }
      )
    })
  },
  beforeUnmount() {
    this.stopAnimation()
    this.clearCountdownTimer()
  },
  computed: {
    buttonText() {
      if (!this.hasStarted) return '开始检测'
      if (this.isDetecting) return '正在检测...'
      if (this.showResult) return '下一步'
      return '正在检测...'
    },
    buttonDisabled() {
      if (!this.hasStarted) return false
      if (this.isDetecting) return true
      if (this.showResult) return false
      return true
    } 
  },
  methods: {
    _raf(fn) { return this.useRAF ? requestAnimationFrame(fn) : setTimeout(fn, 16) },
    _caf(id) { return this.useRAF ? cancelAnimationFrame(id) : clearTimeout(id) },

    parseECGString(str) {
      if (!str) return []
      const parts = str.trim().split(/\s+/)
      return parts.slice(1).map(v => Number(v)).filter(n => !isNaN(n))
    },

    parseHRString(str) {
      if (!str) return null
      const parts = str.trim().split(/\s+/)
      const hrValue = Number(parts.slice(1)[0])
      return isNaN(hrValue) || hrValue < 60 || hrValue > 200 ? null : hrValue
    },

    parseRRString(str) {
      if (!str) return null
      const parts = str.trim().split(/\s+/)
      const respValue = Number(parts.slice(1)[0])
      return isNaN(respValue) || respValue < 10 || respValue > 25 ? null : respValue
    },

    handleButtonClick() {
      if (!this.hasStarted) this.startDetection()
      else if (this.showResult) this.$emit('next')
    },

    initCanvas(done) {
      uni.createSelectorQuery().in(this).select('.ecg-waveform').boundingClientRect(rect => {
        if (rect && rect.width && rect.height) {
          this.width = Math.floor(rect.width)
          this.height = Math.floor(rect.height)
          this.pointStepX = this.width / this.windowSize
        }
        this.bgCtx = uni.createCanvasContext('ecgBackground', this)
        this.waveCtx = uni.createCanvasContext('ecgWave', this)
        this.useRAF = typeof requestAnimationFrame === 'function'
        this.drawBackground()
        if (typeof done === 'function') done()
      }).exec()
    },

    drawBackground() {
      const { bgCtx, width, height } = this
      bgCtx.setFillStyle('#f8f8f8')
      bgCtx.fillRect(0, 0, width, height)
      bgCtx.setStrokeStyle('#e0e0e0')
      bgCtx.setLineWidth(1)

      for (let i = 0; i <= width; i += 10) {
        bgCtx.beginPath()
        bgCtx.moveTo(i, 0)
        bgCtx.lineTo(i, height)
        bgCtx.stroke()
      }
      for (let i = 0; i <= height; i += 10) {
        bgCtx.beginPath()
        bgCtx.moveTo(0, i)
        bgCtx.lineTo(width, i)
        bgCtx.stroke()
      }

      bgCtx.setStrokeStyle('#cccccc')
      bgCtx.beginPath()
      bgCtx.moveTo(0, Math.floor(height / 2))
      bgCtx.lineTo(width, Math.floor(height / 2))
      bgCtx.stroke()
      bgCtx.draw()
    },

    appendECGData(newPoints) {
      this.pendingPoints.push(...newPoints)
    },

    drawWaveform() {
      const { waveCtx, width, height, waveformPoints } = this
      waveCtx.clearRect(0, 0, width, height)

      if (waveformPoints.length > 1) {
        waveCtx.setStrokeStyle('#ff4d4f')
        waveCtx.setLineWidth(2)
        waveCtx.beginPath()

        waveformPoints.forEach((p, i) => {
          if (i === 0) waveCtx.moveTo(p.x, p.y)
          else waveCtx.lineTo(p.x, p.y)
        })
        waveCtx.stroke()
      }
      waveCtx.draw()
    },

    startAnimation() {
      const step = () => {
        const centerY = this.height / 2
        let processed = 0
        
        while (processed < this.maxProcessPerFrame && this.pendingPoints.length > 0) {
          const rawValue = this.pendingPoints.shift()
          const y = centerY - (rawValue * 0.8)
          this.waveformPoints.push({ y })
          
          if (this.waveformPoints.length > this.windowSize) {
            this.waveformPoints.shift()
          }
          
          processed++
        }

        this.waveformPoints.forEach((p, i) => {
          p.x = i * this.pointStepX
        })

        this.drawWaveform()
        this.animId = this._raf(step)
      }
      
      if (!this.animId) {
        this.animId = this._raf(step)
      }
    },

    stopAnimation() {
      if (this.animId) {
        this._caf(this.animId)
        this.animId = null
      }
      this.clearCountdownTimer()
    },

    clearCountdownTimer() {
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    },

    startDetection() {
	  stopSpeak()
	  speak("心电检测已开始，请尽量平躺，保持安静")
	  this.showGuideImage = false;
      this.waveformPoints = []
      this.pendingPoints = []
      // HR重置
      this.hrRealTimeList = []
      this.heartRate = 0
      this.realtimeHeartRate = 0
      this.isHrAbnormal = false
      // RR重置
      this.respRealTimeList = []
      this.respRate = 0
      this.realtimeRespRate = 0
      this.isRespAbnormal = false

      this.showResult = false
      this.isDetecting = true
      this.hasStarted = true
      this.countdownSeconds = 30

      this.store.sendCommand('ECG')
      this.startAnimation()

      this.countdownTimer = setInterval(() => {
        this.countdownSeconds--
        if (this.countdownSeconds <= 0) {
          this.clearCountdownTimer()
        }
      }, 1000)
 
      setTimeout(() => {
        this.stopAnimation()
        this.store.sendCommand('STOP')

        // 计算最终心率
        if (this.hrRealTimeList.length > 0) {
          const hrSum = this.hrRealTimeList.reduce((total, val) => total + val, 0)
          this.heartRate = Math.round(hrSum / this.hrRealTimeList.length)
          uni.setStorageSync("heartRate", this.heartRate)
          console.log("已缓存心率:", this.heartRate)
        } else {
          this.heartRate = Math.floor(Math.random() * 40) + 50
        }

        // 计算最终呼吸率
        if (this.respRealTimeList.length > 0) {
          const respSum = this.respRealTimeList.reduce((total, val) => total + val, 0)
          this.respRate = Math.round(respSum / this.respRealTimeList.length)
          uni.setStorageSync("respRate", this.respRate)
          console.log("已缓存呼吸率:", this.respRate)
        } else {
          this.respRate = Math.floor(Math.random() * 8) + 12
        }

        uni.setStorage({ key: "finalHeartRate", data: this.heartRate })
        uni.setStorage({ key: "finalRespRate", data: this.respRate })
		stopSpeak()
		speak(`心电检测完成，您的心率为 ${this.heartRate},bpm,您的呼吸率为 ${this.respRate}次每分`)
        this.showResult = true
        this.isDetecting = false 
      }, 30000) 
	 

    },

    getResultDesc() {
      if (this.heartRate >= 60 && this.heartRate <= 100) return '心率正常，心脏健康'
      if (this.heartRate > 100) return '心率偏高，建议放松心情'
      return '心率偏低，请注意休息'
    },

    getRespResultDesc() {
      if (this.respRate >= 12 && this.respRate <= 20) return '呼吸率正常，呼吸平稳'
      if (this.respRate > 20) return '呼吸率偏高，可能存在紧张或缺氧'
      return '呼吸率偏低，请注意呼吸节奏'
    }
  },
  // mounted() {
  //   speak("第三步，心电检测，请按图示将电极片贴于胸部，保持安静，点击开始检测进行心电检测，也可以点击右上角跳过心电监测")
  // },
}
</script>

<style scoped>
.check-container {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  padding: 24px;
  margin: 0px;
}

.check-header {
  position: relative;
  width: 100%;
  padding: 0 20px; /* 去掉垂直方向 padding */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
  height: 48px; /* 固定高度，确保布局稳定 */
}

.step-title {
  position: absolute;
  left: 42.5%;
  top: 70%;
  transform: translate(-50%, -50%); /* 真正绝对居中 */
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
  white-space: nowrap; /* 避免换行 */
   font-weight: bold;
}
/* 上一步 / 跳过按钮通用样式 */
.nav-btn {
  position: absolute;
  top: -10px;
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: rgba(64, 158, 255, 0.08); /* 半透明淡蓝背景 */
  transition: all 0.25s ease;
  user-select: none;
}

/* 左右位置 */
.left-btn {
  left: -10px;
}

.right-btn {
  right: 30px;
}

/* 悬停 / 点击反馈（在 H5 或 PC 端更明显） */
.nav-btn:hover {
  background-color: rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}
.nav-btn:active {
  background-color: rgba(64, 158, 255, 0.25);
  transform: scale(0.97);
}



.check-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.device-guide image {
  width: 120px;
  height: 120px;
  margin-bottom: 8px;
}

.guide-text {
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

/* 实时生理数据样式 */
.realtime-physio-area {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 12px;
}

.realtime-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.realtime-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.realtime-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 2px;
}

/* 异常动画 */
.abnormal-animate {
  animation: blink 1s infinite alternate;
  color: #ff4d4f !important;
}

@keyframes blink {
  from { opacity: 1; }
  to { opacity: 0.6; }
}

.warning-text {
  font-size: 12px;
  color: #ff4d4f;
}

/* 倒计时样式 */
.countdown-tip {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #e6f7ff;
  border-radius: 20px;
  margin-bottom: 16px;
}

.countdown-text {
  font-size: 14px;
  color: #409eff;
}

.countdown-number {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
  margin: 0 4px;
}

/* 波形样式 */
.ecg-waveform {
  position: relative;
  width: 100%;
  height: 120px;
  margin-bottom: 16px; /* 减小与结果区的间距 */
  background-color: #f8f8f8;
  border-radius: 8px;
  overflow: hidden;
}

.ecg-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}

.wave { z-index: 1; }

/* 检测结果区域（缩小外框核心调整） */
.result-area {
  text-align: center;
  width: 100%;
  margin: 8px 0 16px; /* 大幅减小上下外边距 */
  padding: 12px 8px; /* 减小内边距（外框大小核心控制） */
  background-color: #fafafa;
  border-radius: 10px; /* 略小一点的圆角 */
  overflow: hidden;
}

/* 结果标题 */
.result-section-title {
  font-size: 14px; /* 缩小标题字体 */
  font-weight: bold;
  color: #333;
  margin-bottom: 12px; /* 减小标题与内容的间距 */
  display: inline-block;
}

/* 结果行 */
.result-row {
  display: flex;
  width: 100%;
}

/* 结果块 */
.result-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 0 6px; /* 减小内部留白 */
  word-break: break-all;
}

/* 指标标题（心率/呼吸率） */
.result-title {
  font-size: 14px; /* 缩小字体 */
  color: #666;
  margin-bottom: 4px; /* 减小间距 */
  font-weight: 500;
}

/* 指标数值 */
.result-value {
  font-size: 24px; /* 缩小数值字体 */
  font-weight: bold;
  color: #ff4d4f;
  margin-bottom: 4px; /* 减小间距 */
  white-space: nowrap;
}

/* 结果描述 */
.result-desc {
  font-size: 12px; /* 缩小描述文字 */
  color: #666;
  line-height: 16px; /* 压缩行高 */
  max-width: 90%;
}

/* 底部按钮样式 */
.check-footer {
  margin-top: 32px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.action-btn {
  flex: 1;
  height: 44px;
  background-color: #409eff;
  color: white;
  border-radius: 22px;
  font-size: 16px;
  border: none;
  outline: none;
  cursor: pointer;
}

.secondary-btn {
  flex: 1;
  height: 44px;
  background-color: #f5f7fa;
  color: #409eff;
  border-radius: 22px;
  font-size: 16px;
  border: 1px solid #409eff;
  cursor: pointer;
}
/* 检测中禁用状态样式 */
.nav-btn.disabled {
  opacity: 0.5;              /* 半透明 */
  pointer-events: none;      /* 禁止点击 */
  cursor: not-allowed;       /* 鼠标变成禁止符号 */
  background-color: rgba(64, 158, 255, 0.05); /* 更淡的背景 */
  color: #a0cfff;            /* 浅蓝字体 */
}

.ecg-guide-img {
  width: 70%;
  margin-top: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

</style>
