<template>
  <view class="report-module doctor-review-module">
    <view class="module-title">医生审核</view>

    <!-- 等级选择（仅选择，不提交） -->
    <view class="buttons">
      <button
        v-for="item in levels"
        :key="item"
        :class="['btn', itemClass(item), { active: localLevel === item }]"
        @click="chooseLevel(item)"
      >
        {{ item }}
      </button>
    </view>

    <!-- ⭐ 上次审核提示（仅已审核时显示） -->
    <view v-if="isReviewed&&localLevel!=value" class="last-review-tip">
      <view class="tip-title">上次审核结果</view>
      <view class="tip-content">
        <text>等级：{{ value }}</text>
        <text v-if="doctorAdvice">意见：{{ doctorAdvice }}</text>
      </view>
    </view>

    <!-- 结果 + 编辑 + 提交 -->
    <view v-if="localLevel" class="result-wrapper">
      <view :class="['result', `result-${localLevel}`]">
        <!-- 编辑状态 -->
        <textarea
          v-if="editing"
          ref="editor"
          class="result-editor"
          v-model="editableText"
          :focus="editorFocus"
          :cursor="cursorPos"
          auto-height
          maxlength="-1"
          @blur="onEditorBlur"
        />

        <!-- 展示状态 -->
        <text v-else class="result-text">
          {{ editableText }}
        </text>

        <!-- 编辑按钮 -->
        <view
          v-if="!editing"
          class="edit-btn"
          @click.stop="startEdit"
        >
          编辑
        </view>
      </view>

      <!-- 提交 / 重新提交审核按钮 -->
      <button class="submit-btn" @click="submitReview">
        {{ isReviewed ? '重新提交审核' : '提交审核' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DoctorReview',
  props: {
    /** 父组件传入的已审核等级 */
    value: {
      type: String,
      default: ''
    },
    /** 父组件传入的医生建议文本 */
    doctorAdvice: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      levels: ['正常', '轻度', '中度', '重度', '极重度'],

      /** 本地草稿等级 */
      localLevel: '',

      editing: false,
      editableText: '',
      editorFocus: false,
      cursorPos: 0
    }
  },
  computed: {
    /** 是否已审核过 */
    isReviewed() {
      return this.levels.includes(this.value)
    }
  },
  watch: {
    /** 回填父组件等级 */
    value: {
      immediate: true,
      handler(val) {
        if (val) {
          this.localLevel = val
        }
      }
    },
    /** 回填父组件医生建议（非编辑态才覆盖） */
    doctorAdvice: {
      immediate: true,
      handler(val) {
        if (!this.editing && val) {
          this.editableText = val
        }
      }
    }
  },
  methods: {
    /** 仅选择等级（不提交） */
    chooseLevel(level) {
      this.localLevel = level
      this.editing = false
      this.editorFocus = false

      // 若选择的是上次审核等级，使用历史意见
      if (level === this.value && this.doctorAdvice) {
        this.editableText = this.doctorAdvice
      } else {
        this.editableText = this.getResultText(level)
      }
    },

    /** 进入编辑态 */
    startEdit() {
      this.editing = true
      this.cursorPos = (this.editableText || '').length

      this.$nextTick(() => {
        this.editorFocus = true
        try {
          this.$refs.editor && this.$refs.editor.focus()
        } catch (e) {}
      })
    },

    onEditorBlur() {
      this.editorFocus = false
    },

    /** 提交 / 重新提交审核 */
    submitReview() {
      this.editing = false
      this.editorFocus = false

      // 只负责通知父组件
      this.$emit('change', this.localLevel, this.editableText)
	  uni.setStorageSync('hasChanged', true)
    },

    itemClass(level) {
      switch (level) {
        case '正常': return 'level-normal'
        case '轻度': return 'level-mild'
        case '中度': return 'level-moderate'
        case '重度': return 'level-severe'
        case '极重度': return 'level-very-severe'
        default: return ''
      }
    },

    getResultText(level) {
      const texts = {
        正常: '您的肺功能检查结果正常，呼吸功能良好。',
        轻度: '您患有轻度慢阻肺，目前对日常生活影响较小，建议定期复查。',
        中度: '您患有中度慢阻肺，可能出现咳嗽、气短等症状，建议规范治疗。',
        重度: '您患有重度慢阻肺，日常活动可能受限，需要积极治疗和康复。',
        极重度: '您患有极重度慢阻肺，对生活影响较大，请遵医嘱规范治疗。'
      }
      return texts[level] || ''
    }
  }
}
</script>

<style scoped>
/* 标题 */
.module-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}

/* 等级按钮 */
.buttons {
  display: flex;
  gap: 12rpx;
}

.btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 12rpx;
  background: linear-gradient(180deg, #f9fafc, #f2f4f8);
  font-size: 26rpx;
  color: #333;
  border: 1rpx solid #e3e6ec;
}

.btn.active.level-normal {
  background: linear-gradient(180deg, #5ddc7a, #22c55e);
  color: #fff;
}
.btn.active.level-mild {
  background: linear-gradient(180deg, #b7eb8f, #73d13d);
  color: #fff;
}
.btn.active.level-moderate {
  background: linear-gradient(180deg, #ffd666, #fa8c16);
  color: #fff;
}
.btn.active.level-severe {
  background: linear-gradient(180deg, #ff7875, #f5222d);
  color: #fff;
}
.btn.active.level-very-severe {
  background: linear-gradient(180deg, #b37feb, #722ed1);
  color: #fff;
}

/* 上次审核提示 */
.last-review-tip {
  margin-top: 16rpx;
  padding: 14rpx 18rpx;
  background-color: #fff7e6;
  border: 1rpx solid #ffe7ba;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #8c6d1f;
}

.tip-title {
  font-weight: 600;
  margin-bottom: 6rpx;
}

.tip-content text {
  display: block;
  line-height: 1.6;
}

/* 结果区域 */
.result-wrapper {
  margin-top: 20rpx;
}

.result {
  position: relative;
  padding: 16rpx 20rpx;
  padding-right: 120rpx;
  border-radius: 10rpx;
  background-color: #f5faff;
  font-size: 26rpx;
  line-height: 1.6;
  border: 1rpx solid #d6e8ff;
  text-indent: 2em;
}

.result-text {
  display: block;
}

/* 编辑框 */
.result-editor {
  width: 100%;
  min-height: 160rpx;
  font-size: 26rpx;
  background: #fff;
  border: 1rpx solid #cfe3ff;
  border-radius: 10rpx;
  padding: 16rpx;
  box-sizing: border-box;
  text-indent: 2em;
}

/* 编辑按钮 */
.edit-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24rpx;
  color: #2563eb;
}

/* 提交按钮 */
.submit-btn {
  margin-top: 24rpx;
  width: 100%;
  height: 80rpx;
  border-radius: 14rpx;
  background: linear-gradient(180deg, #6366f1, #4f46e5);
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

/* 模块背景 */
.doctor-review-module {
  background-color: #f2f0fa;
  border: 1px solid #dcd8f0;
  padding: 20rpx;
  border-radius: 16rpx;
}
</style>
