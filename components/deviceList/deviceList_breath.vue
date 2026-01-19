<template>
  <view class="check-container">
    <view class="check-header">
      <text class="nav-btn left-btn" :class="{ disabled: !detecting }" @click="!detecting && $emit('prev')">上一步</text>
      <text class="step-title">呼吸检测</text>

      <!-- 重听提示：播放当前步骤提示 -->
      <text 
        class="replay-btn"
        v-if="!detecting && !showResult" 
        @click="replaySpeak"
      >
        重听提示
      </text>
    </view>

    <view class="check-content">
      <view class="device-guide">
        <!-- 步骤流容器：整体居中 -->
        <view class="step-flow">
          <!-- 步骤1：猛吸一口气 -->
          <view class="step-item" :class="{ active: currentStep === 0 }">
            <text class="step-text">用力猛吸一口气</text>
          </view>
          
          <!-- 向下箭头 -->
          <view class="arrow-down">↓</view>
          
          <!-- 步骤2：猛吹一口气 -->
          <view class="step-item" :class="{ active: currentStep === 0 }">
            <text class="step-text">  再用肺部猛吹一口气（持续6秒）</text>
          </view>
          
          <!-- 向下箭头 -->
          <view class="arrow-down">↓</view>
          
          <!-- 步骤3：再猛吸一口气 -->
          <view class="step-item" :class="{ active: currentStep === 0 }">
            <text class="step-text">最后再猛吸一口气</text>
          </view>
		  <view class="step-item" :class="{ active: currentStep === 0 }">
		    <text class="step-text1">请全程捏住鼻子，咬住吹嘴，一次性连续完成这三步</text>
		  </view>
        </view>
      
        <!-- 页面内演示视频区域：弹窗显示时先透明占位，关闭后自然显现 -->
        <view 
          class="demo-video-box" 
          v-if="!detecting && !showResult && !showBlowTest"
          v-show="!showVideoPopup"
        >

          <text class="demo-video-title">演示视频</text>
          <video
            id="demoVideo"
            src="/static/blow_demo.mp4"
			poster="http://132.232.152.65:24642/blow_demo_cover.png"
            controls
			object-fit="contain"
			@ended="onEnded"
            @play="onVideoPlay"
            style="width: 100%; height: auto; aspect-ratio: 16/9;background-color: white;margin-bottom: 10px;"   
          ></video>
        </view>

        <view class="countdown" v-if="detecting">
          检测剩余：{{ countdown }} 秒
        </view>
      </view>

      <!-- 呼吸动画 -->
      <view class="breath-animation" v-if="detecting">
        <view
          class="breath-circle"
          :style="{ transform: 'scale(' + breathScale + ')', opacity: breathOpacity }"
        ></view>
        <text class="breath-guide">{{ breathPhase }}</text>
      </view>

      <!-- 结果展示 -->
      <view class="result-area" v-if="showResult">
        <text class="result-value">肺功能呼吸检测已完成</text>
      </view>
    </view>


	<!-- 加载中 -->
	<BlowTest
	  v-if="showBlowTest"
	  :mode="blowTestMode"
	  :flow="flowData"
	  :rule="blowTestRule"
	  @done="onBlowTestDone"
	/>


    <!-- ⭐ 进入页面弹出的视频弹窗：视频看起来从这里飞到上面的 demo-video-box  -->
    <view class="video-popup-mask" v-if="showVideoPopup">
      <view 
        class="video-popup-box"
        ref="popupBox"
        :class="{ animating: isAnimating }"
        :style="{ transform: popupTransform }"
      >
        <text class="video-popup-title">演示视频</text>
    
        <video
          id="popupDemoVideo"
          src="/static/blow_demo.mp4"
		  poster="http://132.232.152.65:24642/blow_demo_cover.png"
          controls
		  object-fit="contain"
          @play="onPopupVideoPlay"
		  @ended="onEnded"
          style="width: 100%; height: auto; aspect-ratio: 16/9;background-color: white;" 
		  
        ></video>
    
        <button class="video-popup-close" @click="closeVideoPopup">关闭</button>
      </view>
    </view>

    <view class="check-footer">
      <button class="action-btn" @click="handleAction">
        {{ buttonText }}
      </button>
    </view>
  </view>
</template>

<script>
import { useCommandStore } from '@/stores/commandStore'
import { speak, stopSpeak } from '../../utils/tts';
import BlowTest from './BlowTest.vue';

export default {
  data() {
    return {
      showVideoPopup: false,          // 进入页面先弹出视频
      isAnimating: false,            // 弹窗是否在执行飞行动画
      popupTransform: 'translate(0px, 0px) scale(1, 1)',

      timer2: null,
      breathPhase: '深吸一口气',
      breathScale: 0.45,
      breathOpacity: 0.7,

      showResult: false,
      animationInterval: null,
      breathCounter: 0,
      startTime: null,
      detecting: false, 
      finished: false,
      failedOnce: false,

      inhaleDuration: 1200,
      exhaleDuration: 4000,
      animationIntervalMs: 50,

      countdown: 20,
      countdownInterval: null,

      currentStep: 0 ,// 主步骤索引（保持0）
	  
	  // 评估状态
	  showBlowTest: false,
	  flowData : [],
	  blowTestMode : '',
	  blowTestRule :{},
	  
	   detectAudio: null   // ⭐ 用来控制检测中的 MP3
    }
  },
  
  components: {
      BlowTest
    },
  computed: {
    buttonText() {
      if (this.detecting && !this.showResult) return '正在检测...'
      if (this.showResult) return '完成检测'
      if (this.failedOnce && !this.detecting) return '重新检测'
      return '开始检测'
    }
  },

  methods: {
	  /* ▶️ 开始播放检测 MP3（循环） */
	  playDetectMp3() {
	    // 防止重复创建
	    this.stopDetectMp3();
	  
	    // #ifdef APP-PLUS
	    const audio = uni.createInnerAudioContext();
	    this.detectAudio = audio;
	  
	    audio.autoplay = true;
	    audio.loop = true;
	    audio.volume = 1.0;
	  
	    // ⭐ 关键：直接使用 _www 下的静态资源
	    audio.src = '_www/static/tarBarIcon/breath.mp3';
	  
	    audio.onPlay(() => {
	      console.log('[MP3] 检测语音开始播放');
	    });
	  
	    audio.onError(err => {
	      console.error('[MP3] 播放失败', err);
	    });
	  
	    audio.play();
	    // #endif
	  },
	  
	  /* ⏹ 停止检测 MP3 */
	  stopDetectMp3() {
	    if (this.detectAudio) {
	      try {
	        this.detectAudio.stop();
	        this.detectAudio.destroy();
	      } catch (e) {}
	      this.detectAudio = null;
	    }
	  },

	  onEnded() {
	    const ctx = uni.createVideoContext('popupDemoVideo')
		const ctx2 = uni.createVideoContext('demoVideo')
	    // 强制回到 0（比系统默认更严格）
	    ctx.seek(0)
	    ctx2.seek(0)
	    // 不自动 play，让系统按钮继续生效
	  },

	   /**
	   * 供父组件调用
	   * @param {Array<number>} flowData
	   */
	  openEvaluate(flowData) {
	    // 1️⃣ 接收主 vue 的吹气数据
	    this.flowData = flowData
	
	    // 2️⃣ 直接开始评估（调后端 + 弹窗）
	    this.evaluateBlow()
	  },
	
	  async evaluateBlow() {
	    // 这里是你已经写好的
	    // 调宝塔 API
	    // this.showResult = true
	  },
	  
	  
    // 页面内视频开始播放 → 立即停止语音
    onVideoPlay() {
      stopSpeak()
    },

    // 弹窗视频播放 → 也打断语音
    onPopupVideoPlay() {
      stopSpeak()
    },
  
    stopVideoIfPlaying() {
      // 只暂停页面内的演示视频
      if (this.videoCtx) {
        this.videoCtx.pause()
      }
    },

    // 关闭弹出视频，并让弹窗“飞”到页面内演示视频的位置
    closeVideoPopup() {
      const query = uni.createSelectorQuery().in(this)
    
      query
        .select('.video-popup-box')
        .fields({ rect: true })
        .select('.demo-video-box')
        .fields({ rect: true })
        .selectViewport()
        .scrollOffset()
        .exec(res => {
          const popupRect = res[0]    // 弹窗位置
          const targetRect = res[1]   // 页面视频位置
          const viewport = res[2]     // 包含 scrollTop
    
          if (!popupRect || !targetRect || !viewport) {
            this.showVideoPopup = false
            return
          }
    
          // 把两个 rect 转换为屏幕绝对坐标
          const popupTop = popupRect.top + viewport.scrollTop
          const popupLeft = popupRect.left
    
          const targetTop = targetRect.top + viewport.scrollTop
          const targetLeft = targetRect.left
    
          // 计算缩放比例
          const scaleX = targetRect.width / popupRect.width
          const scaleY = targetRect.height / popupRect.height
          // 计算位移（绝对屏幕坐标）
          const translateX = targetLeft - popupLeft
          const translateY = targetTop - popupTop
    
          // 暂停视频
          const popupCtx = uni.createVideoContext('popupDemoVideo', this)
          popupCtx.pause()
          this.isAnimating = true
          // 飞行动画
          this.popupTransform =`translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`
          // 动画结束
            this.isAnimating = false
            this.showVideoPopup = false
            this.popupTransform = 'translate(0px, 0px) scale(1,1)'
         
        })
		stopSpeak()
		speak("请全程捏住鼻子、咬住吹嘴，一次性连续完成这三步：先用力猛吸一口气，再用肺部猛吹一口气，持续六秒，最后再猛吸一口气")
		
    },


    /* 播报当前步骤的提示语（统一管理） */
    playStepGuide(step) {
      stopSpeak()
      this.stopVideoIfPlaying()
      if (step === 0) {
        speak("请全程捏住鼻子、咬住吹嘴，一次性连续完成这三步：先用力猛吸一口气，再用肺部猛吹一口气，持续六秒，最后再猛吸一口气")
      }
    },

    /* 重听提示：播放当前步骤提示语 */
    replaySpeak() {
      this.playStepGuide(this.currentStep)
    },

    /* 正式检测步骤 — 深吸→呼出→再吸 */
    startBreathAnimation() {
      if (this.animationInterval) clearInterval(this.animationInterval)

      this.currentStep = 0
      stopSpeak()
      const inhale1Duration = 6000
      const exhaleDuration = 8000
      const inhale2Duration = 6000
      const totalGuideTime = inhale1Duration + exhaleDuration + inhale2Duration

      let elapsed = 0
      const baseScale = 0.6
      const maxScale = 1.25
      const minScale = 0.45

      this.animationInterval = setInterval(() => {
        elapsed += this.animationIntervalMs

        let scale
        if (elapsed <= inhale1Duration) {
          const t = elapsed / inhale1Duration
          scale = baseScale + t * (maxScale - baseScale)
          this.breathPhase = '深吸一口气'
        } else if (elapsed <= inhale1Duration + exhaleDuration) {
          const t = (elapsed - inhale1Duration) / exhaleDuration
          scale = maxScale - t * (maxScale - minScale)
          this.breathPhase = '用力呼出'
        } else if (elapsed <= totalGuideTime) {
          const t = (elapsed - inhale1Duration - exhaleDuration) / inhale2Duration
          scale = minScale + t * (maxScale - minScale)
          this.breathPhase = '再深吸一口气'
        } else {
          scale = maxScale
          this.breathPhase = '保持呼吸'
        }

        const opacity = 0.6 + (scale - minScale) * 0.4
        this.breathOpacity = Math.min(1, Math.max(0.6, opacity))
        this.breathScale = scale

      }, this.animationIntervalMs)
    },

    /* 按钮点击逻辑 */
    handleAction() {
      if (!this.detecting && !this.showResult) {
        this.startDetection()
        return
      }

      if (this.showResult) {
        this.$emit('complete')
      }
    },

    /* 开始检测 */
    startDetection() {
      const parent = this.$parent.$parent.$parent

      if (!parent || !parent.startCOPDTimeTamp) {
        uni.showToast({
          title: '父组件未传入时间戳',
          icon: 'none',
          duration: 3000
        })
        return
      }
      
      this.startTime = parent.startCOPDTimeTamp
      uni.setStorageSync('monitorStartTime', this.startTime)

      this.detecting = true
      this.showResult = false
      this.failedOnce = false
      this.currentStep = 0
	  // 🔇 先停掉 TTS，避免抢音频焦点
	  stopSpeak();
	  
	  // ⏱ 延迟一点点，确保系统释放音频焦点
	  setTimeout(() => {
	    this.playDetectMp3();
	  }, 300);

      this.countdown = 20
      const ts = uni.getStorageSync('monitorStartTime')
      const fileName = `flow_${ts}.txt`
      this.clearFlowFile(fileName, (err) => {
        if (err) {
          console.error('清空文件失败:', err);
          return;
        }
        console.log('文件内容已清空');
      });  
      this.startBreathAnimation()
      useCommandStore().sendCommand('FLOW')

      if (this.countdownInterval) clearInterval(this.countdownInterval)
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 0) this.countdown--
      }, 1000)

      this.timer2 = setTimeout(() => {
        if (this.animationInterval) clearInterval(this.animationInterval)
        if (this.countdownInterval) clearInterval(this.countdownInterval)

        this.detecting = false
        useCommandStore().sendCommand('STOP')
		this.stopDetectMp3();

        
        const ts = uni.getStorageSync('monitorStartTime')
        const fileName = `flow_${ts}.txt`

        this.readFlowFile(fileName, content => {
          if (!content || content.trim() === '') {
            uni.showToast({ title: '未检测到数据', icon: 'none' })
            this.retryBlow()
            return
          }
      
          const raw = content.split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
          const { sequence , lsequence ,lend} = this.findPositiveSegmentAroundPeak(raw, 100)
          console.log("吹气数据",sequence,"123456",lsequence)
          this.evaluateBlowQuality(sequence ,lsequence ,lend)

        
          
        })
      }, 20000)
    },

    /* 读取文件 */
    readFlowFile(fileName, callback) {
      const filePath = `_documents/${fileName}`
      plus.io.resolveLocalFileSystemURL(
        filePath,
        entry => {
          entry.file(file => {
            const reader = new plus.io.FileReader()
            reader.onloadend = e => callback(e.target.result)
            reader.readAsText(file, 'utf8')
          })
        },
        err => {
          console.warn('文件不存在:', filePath)
          callback(null)
        }
      )
    },

    /* 清空文件 */
    clearFlowFile(fileName, callback) {
      const filePath = `_documents/${fileName}`;
      plus.io.resolveLocalFileSystemURL(
        filePath,
        (entry) => {
          entry.createWriter(
            (writer) => {
              writer.onwriteend = () => {
                console.log('文件内容清空成功:', filePath);
                callback(null);
              };
              writer.onerror = (err) => {
                console.error('清空文件内容失败:', filePath, err);
                callback(err);
              };
              writer.seek(0);
              writer.write('');
              writer.truncate(0);
            },
            (err) => {
              console.error('创建文件写入器失败:', filePath, err);
              callback(err);
            }
          );
        },
        (err) => {
          console.warn('文件不存在，创建空文件:', filePath);
          const dirPath = '_documents';
          plus.io.resolveLocalFileSystemURL(
            dirPath,
            (dirEntry) => {
              dirEntry.getFile(
                fileName,
                { create: true, exclusive: false },
                () => {
                  console.log('空文件创建成功:', filePath);
                  callback(null);
                },
                (createErr) => {
                  console.error('创建空文件失败:', filePath, createErr);
                  callback(createErr);
                }
              );
            },
            (dirErr) => {
              console.error('解析目录失败:', dirPath, dirErr);
              callback(dirErr);
            }
          );
        }
      );
    },

    /* 查找峰值 + 最负负序列（leak） */
    findPositiveSegmentAroundPeak(rawData) {
      if (!rawData || !rawData.length)
        return { peakIndex: -1, sequence: [] }
    
      /* ====== 1. 找最高峰 ====== */
      let peakIndex = 0
      let peakValue = rawData[0]
      for (let i = 1; i < rawData.length; i++) {
        if (rawData[i] > peakValue) {
          peakValue = rawData[i]
          peakIndex = i
        }
      }
    
      /* ====== 2. 找正值连续区段 ====== */
      let start = peakIndex
      while (start > 0 && rawData[start - 1] > 0) start--
    
      let end = peakIndex
      while (end < rawData.length - 1 && rawData[end + 1] > 0) end++
    
      const sequence = rawData.slice(start, end + 1)
    
      /* ==================================================
         3. 从 end+1 开始扫描所有负数区段，
            找出“绝对值最大”的那一段（最负序列）
         ================================================== */
      let best_lstart = -1
      let best_lend = -1
      let best_leak_index = -1
      let best_min_value = 0  // 记录负段中“最负”的值（越小越好）
    
      let i = end + 1
    
      while (i < rawData.length) {
        // 找下一段负序列开始
        if (rawData[i] >= 0) {
          i++
          continue
        }
    
        // 当前负段起点
        let lstart = i
        let segment_min_value = rawData[i]
        let segment_min_index = i
    
        // 向后扩展负数区段
        while (i < rawData.length && rawData[i] < 0) {
          if (rawData[i] < segment_min_value) {
            segment_min_value = rawData[i]
            segment_min_index = i
          }
          i++
        }
    
        // 当前负段结束位置
        let lend = i - 1
    
        // 比较该段是否更“负”
        if (segment_min_value < best_min_value) {
          best_min_value = segment_min_value
          best_lstart = lstart
          best_lend = lend
          best_leak_index = segment_min_index
        }
      }
    
      /* ====== 4. 生成 lsequence ====== */
      let lsequence = []
      if (best_lstart !== -1) {
        lsequence = [0, ...rawData.slice(best_lstart, best_lend + 1), 0]
      }
	  // console.log("123456:"+lsequence);
    
      /* ====== 5. 返回所有结果 ====== */
      return {
        /* 正序列 */
        peakIndex,
        start,
        end,
        sequence: [0, ...sequence, 0],
    
        /* 最负序列（leak） */
        leakIndex: best_leak_index,
        lstart: best_lstart,
        lend: best_lend,
        lsequence
      }
    },
	
	// 将二维流量数组（单位 L/s, 100Hz）积分为体积变化量（单位 L）
	integrateFlowToVolume(flow, freq = 100) {
	  if (!Array.isArray(flow) || flow.length < 2) return 0;
	
	  const dt = 1 / freq;
	  let total = 0;
	
	  for (let i = 1; i < flow.length; i++) {
	    // 梯形面积 = (f(i-1) + f(i)) * dt / 2
	    total += (flow[i - 1] + flow[i]) * 0.5 * dt;
	  }
	
	  return total; // 单位：L
	},

	onBlowTestDone(passed) {
	  // 1️⃣ 关闭窗口
	  this.showBlowTest = false
	
	  // 2️⃣ 你要的结果就在这里
	  console.log('评估结果 passed =', passed)
	
	  if (passed.passed) {
	    // ✅ 吹气合格
	    // 👉 进入下一个状态
	    // 1.5【吸气体积判定】
			uni.showToast({ title: '吹气检测完成', icon: 'success' })
			speak("吹气检测完成")
			this.showResult = true
			this.saveToDatabase(flowData)
			return 1;
			  
	  } else {
	    // ❌ 吹气不合格
	    // 👉 引导用户重新吹气
	      this.retryBlow()
	      return
	  }
	},


    /* 评估吹气质量 */
    evaluateBlowQuality(flowData ,lflowData ,lend) {
      const fs = 100
      const f = flowData
	  const lf = lflowData
	  const le = lend
      
        this.flowData = f
       
        const VB = this.integrateFlowToVolume(f)
        const VL = this.integrateFlowToVolume(lf)
        const seconds = (f.length / 100).toFixed(1)
		
        // ===== 规则失败 0：时间不够 =====
        if (f.length < 1.7) {
          this.showBlowTest = true
          this.blowTestMode = 'rule'
          this.blowTestRule = {
            title: '吹气时间不够',
            message: `本次测试中持续吹气时间太短，只有${seconds}秒，请尽量持续吹气6秒。`,
            passed: false
          }
		  // 直接读取刚刚设置好的 message 进行播报
		    speak(this.blowTestRule.message)
          return
        }

        // ===== 规则失败 1：吸气不够 =====
        if (VB - Math.abs(VL) > 0.6) {
          this.showBlowTest = true
          this.blowTestMode = 'rule'
          this.blowTestRule = {
            title: '吸气不够完全',
            message: '本次测试中吸气量不足，请重新深吸一口气后再进行吹气。',
            passed: false
          }
		  // 直接读取刚刚设置好的 message 进行播报
		    speak(this.blowTestRule.message)
          return
        }
      
        // ===== 规则失败 2：吹气不够 =====
        if (VB - Math.abs(VL) < -0.4) {
          this.showBlowTest = true
          this.blowTestMode = 'rule'
          this.blowTestRule = {
            title: '吹气不够完全',
            message: '本次测试中吹气量不足，请尽量一次性、持续吹气。',
            passed: false
          }
		  // 在这里播报，直接引用上面定义好的 message
		    speak(this.blowTestRule.message)
          return
        }
      
        // ===== 通过规则 → 进入 AI 诊断 =====
        this.showBlowTest = true
        this.blowTestMode = 'ai'
      // // 1【吹气时间判定】
      // if (f.length / fs < 2.0) {
      //   uni.showToast({ title: '吹气时间太短，请重新吹气', icon: 'none' })
      //   speak("吹气时间太短，请重新吹气")
      //   this.retryBlow()
      //   return
      // }
	  
    //   // 2【吹气力度判断】
    //   const maxVal = Math.max(...f.map(v => Math.abs(v)))
    //   const maxIndex = f.indexOf(maxVal)
    
    //   if (maxVal < 3) {
    //     uni.showToast({ title: '吹气力度不足，请重新吹气', icon: 'none' })
    //     speak("吹气力度不足，请重新吹气")
    //     this.retryBlow()
    //     return
    //   }
    
    //   // 3【无时间限制的“完整凸峰”二次峰检测】
    //   const windowSize = Math.floor(fs * 0.10)      
    //   const prominenceFactor = 0.25                 
    //   const minRise = 0.15                           
    //   const minFall = 0.15                           
    
    //   let hasSecondPeak = false
    
    //   for (let i = 1; i < f.length - 4; i++) {
    //     if (i === maxIndex) continue
    //     if (!(f[i] > f[i - 1] && f[i] > f[i + 1])) continue
    
    //     const left = Math.max(0, i - windowSize)
    //     const right = Math.min(f.length - 1, i + windowSize)
    
    //     let sum = 0, count = 0
    //     for (let j = left; j <= right; j++) {
    //       sum += f[j]
    //       count++
    //     }
    //     const localMean = sum / count
    
    //     if (f[i] < localMean * (1 + prominenceFactor)) continue
    //     if (f[i] - f[i - 3] < minRise) continue
    //     if (f[i] - f[i + 3] < minFall) continue
    
    //     hasSecondPeak = true
    //     break
    //   }
    
    //   if (hasSecondPeak) {
    //     uni.showToast({ title: '吹气不连续，请保持一次持续用力', icon: 'none' })
    //     speak("吹气不连续，请保持一次持续用力")
    //     this.retryBlow()
    //     return
    //   }
    
    //   // 4【噪声水平检测】
    //   let diffSum = 0
    //   for (let i = 1; i < f.length; i++) diffSum += Math.abs(f[i] - f[i - 1])
    
    //   const noiseLevel = diffSum / (maxVal * f.length)
    
    //   if (noiseLevel > 0.22) {
    //     uni.showToast({ title: '吹气不稳定，请匀速吹气', icon: 'none' })
    //     speak("吹气过程不稳定，请匀速用力吹气")
    //     this.retryBlow()
    //     return
    //   }
    
    //   // 5【峰尖锐度判断（是否快速用力）】
    //   let t10 = 0
    //   for (let i = 0; i < maxIndex; i++) {
    //     if (f[i] > maxVal * 0.1) {
    //       t10 = i
    //       break
    //     }
    //   }
    
    //   const riseTime = (maxIndex - t10) / fs
    
    //   if (riseTime > 0.25) {
    //     uni.showToast({ title: '吹气峰值不够尖锐，请更快速用力吹气', icon: 'none' })
    //     speak("吹气峰值不够尖锐，请更快速用力吹气")
    //     this.retryBlow()
    //     return
    //   }
     
    //   // 6【所有检测通过 → 合格】
    //   uni.showToast({ title: '吹气检测完成', icon: 'success' })
    //   speak("吹气检测完成")
    //   this.showResult = true
    //   this.saveToDatabase(flowData)
    },

    /* 保存数据 */
    saveToDatabase(flowData) {
      const ts = this.startTime
      const fileName = 'flow_' + ts + '.txt'

      uni.request({
        url: '',
        method: 'POST',
        data: { fileName, timestamp: ts, flowData },
        header: { 'Content-Type': 'application/json', token: uni.getStorageSync('token') || '' },
        success: res => {
          uni.showToast({ title: '数据已上传', icon: 'success' })
          this.showResult = true
          this.finished = true
        }
      })
    },

    /* 重试吹气 */
    retryBlow() {
	 this.stopDetectMp3();
	 
      this.detecting = false
      this.showResult = false
      this.failedOnce = true
      this.currentStep = 0
      this.breathPhase = "深吸一口气"
      useCommandStore().sendCommand('STOP')
	  setTimeout(() => {
	    const ts = uni.getStorageSync('monitorStartTime')
	    const fileName = `flow_${ts}.txt`
	    this.clearFlowFile(fileName, (err) => {
	      if (err) {
	        console.error('清空文件失败:', err);
	        return;
	      }
	      console.log('文件内容已清空');
	    });  
	  }, 100);
    }
  },

  beforeUnmount() {
    if (this.timer2) {
      clearTimeout(this.timer2)
      this.timer2 = null
    }
	  this.stopDetectMp3();
    stopSpeak() 
  },

  mounted() {
    stopSpeak()
    // 初始化播报直接播放正式检测提示
    speak("肺功能呼吸检测：请先观看操作演示视频再进入检测")
  
    // 页面内演示视频的上下文（用于暂停）
    this.videoCtx = uni.createVideoContext('demoVideo', this)
  
    this.currentStep = 0
  }
}
</script>

<style scoped>
/* ========== 仅修改弹窗和关闭按钮样式 ========== */
.video-popup-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0px; /* 防止弹窗贴边 */
  box-sizing: border-box;
}

.video-popup-box {
  width: 85%; /* 适配不同屏幕宽度 */
  max-width: 400px; /* 大屏不超宽 */
  min-height: 280px; /* 最小高度保证按钮显示 */
  height: auto; /* 关键：移除固定35%高度，自适应内容 */
  background: #fff;
  border-radius: 12px;
  padding: 12px 6px 12px; /* 底部多留空间给按钮 */
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between; /* 按钮固定在底部 */
  transition: transform 0.4s ease;
  box-sizing: border-box;
}

.video-popup-title {
  margin-top: 4px;
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 2px;
}


/* 关闭按钮：仅降低高度，宽度保持适配 */
.video-popup-close {
  width: 60%; /* 宽度保持适中（可根据需求微调） */
  min-width: 100px; /* 小屏不截断 */
  max-width: 160px; /* 大屏不超宽 */
  background-color: #409eff;
  margin-top: 0px;
  /* 核心修改：垂直内边距从6px缩到3px，大幅降低按钮高度 */
  padding: 8px 0; 
  font-size: 13px; /* 字体大小不变，保证文字清晰 */
  line-height: 1.2; /* 行高适配，避免文字垂直居中异常 */
  border-radius: 16px;
  color: white;
  font-weight: 500;
  border: none;
  outline: none;
  box-sizing: border-box;
}

/* 小屏适配：同步降低垂直内边距 */
@media screen and (max-height: 500px) {
  .video-popup-close {
    padding: 2px 0; /* 小屏垂直内边距再减 */
    font-size: 12px;
    margin-top: 8px;
  }
}

.video-popup-box.animating {
  pointer-events: none;
}
/* 弹窗存在期间，页面内视频区域先透明占位，让动画飞过去更自然 */
.hidden-box {
  opacity: 0;
}

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
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
  height: 48px;
}

.step-title {
  position: absolute;
  left: 42.5%;
  top: 70%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
  white-space: nowrap;
  font-weight: bold;
}

.nav-btn {
  position: absolute;
  top: -10px;
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: rgba(64, 158, 255, 0.08);
  transition: all 0.25s ease;
  user-select: none;
}

.left-btn {
  left: -10px;
}

.right-btn {
  right: 30px;
}

/* 重听按钮样式 */
.replay-btn {
  position: absolute;
  top: -10px;
  right: 30px;
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: rgba(64, 158, 255, 0.08);
  transition: all 0.25s ease;
  user-select: none;
}

.replay-btn:hover {
  background-color: rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}
.replay-btn:active {
  background-color: rgba(64, 158, 255, 0.25);
  transform: scale(0.97);
}

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
  margin-bottom: 5px;
}

.device-guide {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
  width: 100%;
}

/* 步骤流容器：整体居中，垂直排列 */
.step-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 8px;
}

/* 步骤项：居中显示 */
.step-item {
  display: flex;
  align-items: center;
  margin: 0;
  opacity: 0.4;
  transition: all 0.25s ease;
  width: fit-content;
  flex-shrink: 0;
}
 
.step-index {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  border-radius: 50%;
  color: #fff;
  text-align: center;
  line-height: 22px;
  font-size: 13px;
  margin-right: 10px;
  font-weight: 600;
  box-shadow: 0 0 6px rgba(64,158,255,0.4);
  flex-shrink: 0; 
  box-sizing: border-box;
}

.step-text {
  font-size: 15px;
  color: #333;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  text-align: center;
}

.step-text1 {
  font-size: 15px;
  color: red;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  text-align: center;
}

.step-item.active {
  opacity: 1;
}

/* 向下箭头样式 */
.arrow-down {
  font-size: 15px;
  color: #409eff;
  font-weight: bold;
  margin: 0px 0 0 0;
  text-align: center;
}

.countdown {
  font-size: 16px;
  color: #409eff;
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
}

.breath-animation {
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.breath-circle {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at 30% 30%, #7ecbff, #409eff);
  border-radius: 50%;
  box-shadow: 0 0 16px rgba(64,158,255,0.6);
  transition: all 0.35s ease;
}

.breath-guide {
  margin-top: 26px;
  font-size: 15px;
  color: #666;
}

.result-area {
  text-align: center;
}

.result-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.check-footer { 
  margin-top: 0px;
  width: 100%;
}

.action-btn {
  width: 100%;
  height: 44px;
  background-color: #409eff;
  color: white;
  border-radius: 22px;
  font-size: 16px;
  border: none;
  outline: none;
  cursor: pointer;
}

.action-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.demo-video-box {
  width: 100%;
  background: #f7f9fc;
  border-radius: 12px;
  padding: 0px;
  margin: 12px 0px 0px 0px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.demo-video-title {
  display: block;
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  color: #409eff;
  margin-top: 6px;
  margin-bottom: 6px;
  text-align: center;
  letter-spacing: 1px;
}
</style>
