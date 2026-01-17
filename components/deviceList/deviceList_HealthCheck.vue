<template>
  <view class="health-check-modal">
    <!-- 遮罩层 -->
    <view class="mask" @click="closeModal"></view>

    <!-- 检测步骤容器 -->
    <view class="check-steps-container">
      <!-- 步骤指示器 -->
	  
     <!-- 顶部步骤条（最终稳定版本） -->
     <view class="steps-bar">
       <view 
         v-for="(step, index) in steps" 
         :key="index"
         class="step-wrapper"
       >
     
         <!-- 步骤圆角框 -->
         <view class="step-box" :class="{ active: currentStep === index + 1 }">
           <text class="step-text">{{ step }}</text>
         </view>
     
         <!-- 箭头：独立绝对定位（不会撑开布局） -->
         <text 
           v-if="index < steps.length - 1"
           class="step-arrow"
         >
           >>
         </text>
     
       </view>
     </view>


    

 
      <!-- 当前步骤内容 -->
      <view class="step-content">
        <!-- 信息录入 -->
		
        <view v-if="currentStep === 1" class="info-form">
		<view class="check-container">
          <text class="form-title">信息录入</text>

          <view class="form-section">
            <view class="form-row" @tap="setFocus('name')">
              <text class="form-label">姓名</text>
              <input
                class="native-input"
                type="text"
                v-model="userInfo.name"
                placeholder="请输入姓名"
                :focus="focusField === 'name'"
                confirm-type="next"
                cursor-spacing="20"
              />
            </view>

            <!-- ✅ 性别选择框：与输入框样式一致 -->
            <view class="form-row" @click="showSexPicker = true">
              <text class="form-label">性别</text>
              <view class="picker-input">
                {{ userInfo.sex || '请选择性别' }}
              </view>
            </view>

            <view v-if="showSexPicker" class="sex-popup">
              <view class="popup-mask" @click="showSexPicker = false"></view>
              <view class="popup-box">
                <view class="popup-title">请选择性别</view>
                <view class="popup-options">
                  <view
                    class="popup-option"
                    :class="{ active: userInfo.sex === '男' }"
                    @click="selectSex('男')"
                  >
                    男
                  </view>
                  <view
                    class="popup-option"
                    :class="{ active: userInfo.sex === '女' }"
                    @click="selectSex('女')"
                  >
                    女
                  </view>
                </view>
                <view class="popup-cancel" @click="showSexPicker = false">
                  取消
                </view>
              </view>
            </view>

            <view class="form-row" @tap="setFocus('age')">
              <text class="form-label">年龄(岁)</text>
              <input
                class="native-input"
                type="number"
                v-model="userInfo.age"
                placeholder="请输入年龄"
                :focus="focusField === 'age'"
                confirm-type="next"
                cursor-spacing="20"
              />
            </view>

            <view class="form-row" @tap="setFocus('height')">
              <text class="form-label">身高(cm)</text>
              <input
                class="native-input"
                type="number"
                v-model="userInfo.height"
                placeholder="请输入身高"
                :focus="focusField === 'height'"
                confirm-type="next"
                cursor-spacing="20"
              />
            </view>

            <view class="form-row" @tap="setFocus('weight')">
              <text class="form-label">体重(kg)</text>
              <input
                class="native-input"
                type="number"
                v-model="userInfo.weight"
                placeholder="请输入体重"
                :focus="focusField === 'weight'"
                confirm-type="done"
                cursor-spacing="20"
              />
            </view>
          </view>

          <button class="next-btn" @click="confirmUserInfo">下一步</button>
        </view>
		</view>

        <!-- 检测步骤 -->
        <OxygenCheck v-if="currentStep === 2" @next="goToNextStep" @prev="goToPrevStep"@close="closeModal" />
       <EcgCheck
         v-if="needEcg && currentStep === steps.indexOf('心电') + 1"
         @next="goToNextStep"
         @prev="goToPrevStep"
         @close="closeModal"
       />

        <BreathCheck
          v-if="currentStep === steps.indexOf('呼吸') + 1"
          @complete="completeCheck"
          @prev="goToPrevStep"
          @close="closeModal"
        />

      </view>
    </view>
  </view>
</template>

<script>
import OxygenCheck from './deviceList_Oxygen.vue';
import EcgCheck from './deviceList_ecg.vue';
import BreathCheck from './deviceList_breath.vue';
import { useCommandStore } from '@/stores/commandStore';
import { speak,stopSpeak} from '../../utils/tts';

export default {
  name: 'HealthCheckModal',
  props: {
      needEcg: { type: Boolean, default: true }   // ← 新增
    },
  components: { OxygenCheck, EcgCheck, BreathCheck },
  data() {
    return {
      currentStep: 1,
      focusField: '',
      showSexPicker: false,
      userInfo: { name: '', sex: '', age: '', height: '', weight: '' },
    };
  },
  computed: {
    steps() {
      // needEcg 来自 props
      return this.needEcg
        ? ["信息", "血氧", "心电", "呼吸"]
        : ["信息", "血氧", "呼吸"];
    }
  },

  methods: {
	goToPrevStep() {
	  if (this.currentStep > 1) {
	    this.currentStep--;
	  }
	if (this.currentStep === 1) {
	    speak("第一步，请开始填写检测前的基本信息");
	  }
	},

    setFocus(field) {
      this.focusField = field;
    },
    selectSex(sex) {
      this.userInfo.sex = sex;
      this.showSexPicker = false;
    },
	
   goToNextStep() {
     if (this.currentStep < this.steps.length) {
       this.currentStep++;
     }
   
     const store = useCommandStore();
     store.sendCommand("STOP");
   },

    confirmUserInfo() {
      const { name, sex, age, height, weight  } = this.userInfo;
      if (!name || !sex || !age || !height || !weight) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }
	 // —— 数值范围校验 ——
	  const ageNum = Number(age);
	  const heightNum = Number(height);
	  const weightNum = Number(weight);
	
	  if (ageNum < 1 || ageNum > 120) {
	    uni.showToast({ title: '年龄超出合理范围', icon: 'none' });
	    return;
	  }
	
	  if (heightNum < 50 || heightNum > 250) {
	    uni.showToast({ title: '身高超出合理范围', icon: 'none' });
	    return;
	  }
	
	  if (weightNum < 10 || weightNum > 300) {
	    uni.showToast({ title: '体重超出合理范围', icon: 'none' });
	    return;
	  }
	  
      uni.setStorageSync('currentUser', this.userInfo);
      this.currentStep = 2;
    },
    closeModal() {
      this.$emit('close');
    },
    completeCheck() {
      const user = uni.getStorageSync('currentUser') || {};
      this.$emit('complete', {
        user,
        oxygen: Math.floor(Math.random() * 5) + 95,
        heartRate: Math.floor(Math.random() * 40) + 60,
        breathRate: Math.floor(Math.random() * 8) + 12,
      });
    },
  },
  mounted() {
	stopSpeak()
    speak("第一步，请开始填写检测前的基本信息")
  },

};
</script>

<style scoped>
.health-check-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.check-steps-container {
  position: relative;
  width: 90%;
  max-width: 420px;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  z-index: 1000;
}

.step-indicators {
  display: flex;
  align-items: center;
  padding: 24px;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  font-size: 14px;
  font-weight: bold;
}

.step-indicator.active {
  background-color: #409eff;
  color: white;
}

.step-label {
  margin-top: 6px;
  font-size: 12px;
}

.step-line {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 4px;
}

.step-line.active {
  background-color: #409eff;
}

.step-content {
  min-height: 200px;
  padding: 0 20px 30px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
}

.form-row {
  display: flex;
  align-items: center;
  background-color: #f8f9fb;
  border-radius: 10px;
  padding: 10px 12px;
}

.form-label {
  flex: 0 0 80px;
  color: #333;
  font-size: 14px;
}

.native-input,
.picker-input {
  flex: 1;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
  height: 38px;
  line-height: 38px;
  color: #555;
}

/* 性别选择弹窗样式 */
.sex-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.popup-box {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 20px 0;
  animation: slide-up 0.3s ease;
}

.popup-title {
  text-align: center;
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
}

.popup-options {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.popup-option {
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #555;
  padding: 10px 0;
  border-right: 1px solid #eee;
}

.popup-option:last-child {
  border-right: none;
}

.popup-option.active {
  color: #409eff;
  font-weight: 600;
}

.popup-cancel {
  text-align: center;
  font-size: 16px;
  color: #999;
  padding: 12px 0;
  border-top: 1px solid #eee;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.next-btn {
  width: 100%;
  height: 42px;
  background-color: #409eff;
  color: white;
  border-radius: 21px;
  font-size: 16px;
  border: none;
}

.form-title {
  display: block;
  width: 100%;
  text-align: center; 
  font-size: 18px;           /* 字号 */
  font-weight: bold;         /* 粗体（等同 font-weight: 600）*/
  color: #2c3e50;            /* 字体颜色 */
  margin-bottom: 18px;
  letter-spacing: 0.5px;     /* 字间距 */
  white-space: nowrap;       /* 不换行 */
}




.step-text.active {
  color: #409eff;
  font-weight: 700;
}

.arrow-symbol {
  margin: 0 10px;
  color: #ccc;
  font-size: 18px;
  font-weight: bold;
}
/* 整个步骤条 */
.steps-bar {
  width: 100%;
  padding: 16px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

/* 单个步骤容器（等宽） */
.step-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative; /* 让箭头能绝对定位 */
  min-width: 0;       /* 防止 iOS 撑开 */
}

/* 步骤圆角框 */
.step-box {
  padding: 8px 14px;
  background-color: #eeeeee;
  border-radius: 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  white-space: nowrap;

  /* iOS 禁止竖排 */
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  -webkit-writing-mode: horizontal-tb !important;
}

/* 高亮 */
.step-box.active {
  background-color: #409eff;
}
.step-box.active .step-text {
  color: #fff;
  font-weight: 600;
}

/* 文本 */
.step-text {
  font-size: 14px;
  color: #555;
  writing-mode: horizontal-tb !important;
}

/* 箭头 —— 绝对定位，不参与 flex 布局 */
.step-arrow {
  position: absolute;
  right: -12px; /* 让箭头居中在两个步骤之间 */
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #aaa;
  font-weight: bold;

  writing-mode: horizontal-tb !important;
  white-space: nowrap;
}

/* 基础容器样式 */
.check-container {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  padding: 24px;
  margin: 0px;
}

</style>
