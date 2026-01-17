<template>
  <view class="mask">
    <view class="box">

      <!-- 标题 -->
      <view class="title">
        {{ title }}
      </view>

      <!-- 加载中 -->
      <view v-if="status === 'loading'" class="row">
        正在分析吹气质量，请稍候…
      </view>

      <!-- ===== 评估完成 ===== -->
      <view v-else-if="status === 'done'">

        <!-- ===== 规则失败 ===== -->
        <view v-if="mode === 'rule'">
          <view class="row message bad">
            {{ message }}
          </view>
        </view>

        <!-- ===== AI 诊断 ===== -->
        <view v-else-if="mode === 'ai'">

          <!-- 合格 -->
          <view v-if="passed" class="row ok">
            吹气质量良好，本次测试合格。
          </view>

          <!-- 不合格 -->
          <view v-else>
            <view class="row bad">
              主要问题：{{ report.primary.name }}
            </view>

            <view
              v-if="report.locations && report.locations.length"
              class="row"
            >
              <view
                v-for="(loc, i) in report.locations"
                :key="i"
                class="item"
              >
                {{ loc.timeRange[0] }}s – {{ loc.timeRange[1] }}s：
                {{ loc.name }}
              </view>
            </view>

            <view class="row">
              <view
                v-for="(tip, i) in report.advice"
                :key="i"
                class="item"
              >
                • {{ tip }}
              </view>
            </view>
          </view>

        </view>

        <!-- 确认按钮（统一） -->
        <button type="primary" class="btn" @click="confirm">
          我知道了
        </button>

      </view>

      <!-- ===== 接口 / 系统错误 ===== -->
      <view v-else class="row bad">
        评估失败，请重新测试
        <button type="primary" class="btn" @click="confirmError">
          我知道了
        </button>
      </view>

    </view>
  </view>
</template>

<script>
	import { speak, stopSpeak } from '../../utils/tts';
export default {
  name: 'BlowTest',

  props: {
    /* 模式：rule | ai */
    mode: {
      type: String,
      required: true
    },

    /* AI 诊断使用的 flow */
    flow: {
      type: Array,
      default: () => []
    },

    /* 规则失败信息 */
    rule: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      status: 'loading', // loading | done | error
      title: '',
      message: '',
      passed: false,
      report: null
    }
  },

  mounted() {
    // ⭐ 防止任何状态残留（非常关键）
    this.resetState()

    if (this.mode === 'rule') {
      this.initRule()
    } else {
      this.evaluateAI()
    }
  },

  methods: {
    /* ===== 状态重置（防止通过/不通过串状态） ===== */
    resetState() {
      this.status = 'loading'
      this.title = ''
      this.message = ''
      this.passed = false   // ⭐ 统一初始化为 false
      this.report = null
    },

    /* ===== 规则失败初始化 ===== */
    initRule() {
      this.title = this.rule?.title || '吹气存在问题'
      this.message = this.rule?.message || ''

      // ⭐⭐ 核心语义：规则失败 = 必然不通过
      this.passed = false

      this.status = 'done'
    },

    /* ===== AI 诊断 ===== */
    async evaluateAI() {
      this.title = '吹气质量评估'
      this.status = 'loading'
      
      try {
        // if (!Array.isArray(this.flow) || this.flow.length < 50) {
        //   throw new Error('flow invalid')
        // }
		console.log("sss",)  
        console.log("sss",this.flow)  
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: 'http://42.193.14.241:25132/api/v13/predict',
            method: 'POST',
            data: { flow: this.flow },
            success: resolve,
            fail: reject
          })
        })
		console.log('【AI接口完整返回 res】', res)
		console.log('【res.data 是什么】', res.data)
		console.log('【res.data 的 keys】', res.data && Object.keys(res.data))
        console.log("sss",res)  
        if (!res.data || res.data.code !== 0) {
		
          throw new Error('backend error')
        }

        this.report = res.data.data

        // ⭐ AI 唯一允许 passed=true 的地方
        this.passed = this.report.primary.type === 'G'

        this.status = 'done'
		// if (!this.passed) {
		//            // speak('主要问题：' + this.report.primary.name )
		// 		   speak('主要问题：' + this.report.primary.name + '。' + this.report.advice.join(''))
		//         }
		if (this.passed) {
		  // ✅ 合格播报（固定一句，和 UI 一致）
		  speak('吹气质量良好，本次测试合格。')
		} else {
		  // ❌ 不合格播报（你现在已经验证正确的）
		  speak(
		    '主要问题：' +
		    this.report.primary.name +
		    '。' +
		    this.report.advice.join('')
		  )
		}


      } catch (e) {
        console.error('[BlowTest] evaluate error', e)
        this.status = 'error'
        this.passed = false
		  speak('评估失败，请重新测试。')
      }
    },

    /* ===== 用户确认 ===== */
    confirm() {
	  stopSpeak();
      this.$emit('done', {
        passed: this.passed,
        mode: this.mode
      })
    },

    confirmError() {
      this.$emit('done', {
        passed: false,
        mode: this.mode
      })
    }
  }
}
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.box {
  width: 80%;
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.row {
  margin-top: 16rpx;
}

.message {
  font-size: 28rpx;
}

.ok {
  color: #39b54a;
}

.bad {
  color: #e54d42;
}

.item {
  margin-top: 8rpx;
  color: #555;
}

.btn {
  margin-top: 24rpx;
}
</style>
