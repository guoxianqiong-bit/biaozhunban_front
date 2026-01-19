<template>
  <view class="version-container">
    <!-- <view class="header-title">请选择使用模式</view> -->
    
    <view 
      class="version-card standard-card" 
      :class="{ active: currentVersion === 'STANDARD' }"
      @click="switchVersion('STANDARD')"
    >
      <view class="card-content">
        <view class="icon-box">
          <text class="card-icon">🏠</text> 
        </view>
        <view class="text-box">
          <text class="card-title">标准版</text>
          <text class="card-desc">适合个人居家长期监测。</text>
        </view>
      </view>
      <view class="check-mark" v-if="currentVersion === 'STANDARD'">✓</view>
    </view>

    <view 
      class="version-card community-card" 
      :class="{ active: currentVersion === 'COMMUNITY' }"
      @click="switchVersion('COMMUNITY')"
    >
      <view class="card-content">
        <view class="icon-box">
          <text class="card-icon">👥</text>
        </view>
        <view class="text-box">
          <text class="card-title">社区版</text>
          <text class="card-desc">支持录入多个受测者信息,适合社区义诊筛查。</text>
        </view>
      </view>
      <view class="check-mark" v-if="currentVersion === 'COMMUNITY'">✓</view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      currentVersion: 'STANDARD'
    };
  },
  onShow() {
    // 读取当前配置
    const ver = uni.getStorageSync('APP_VERSION_MODE');
    if (ver) {
      this.currentVersion = ver;
    }
  },
  methods: {
    switchVersion(mode) {
      this.currentVersion = mode;
      uni.setStorageSync('APP_VERSION_MODE', mode);
      
      uni.showToast({
        title: '切换成功',
        icon: 'success',
        duration: 1500
      });
      
      // 震动反馈 (提升交互感)
      uni.vibrateShort();
      
      // 1.5秒后返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  }
};
</script>

<style scoped>
.version-container {
  padding: 40rpx;
  background-color: #f5f7fa; /* 浅灰底色 */
  min-height: 100vh;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
  margin-left: 10rpx;
}

.version-card {
  position: relative;
  width: 100%;
  height: 240rpx;
  border-radius: 30rpx;
  margin-bottom: 40rpx;
  padding: 40rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.version-card:active {
  transform: scale(0.98);
}

/* 选中状态增加边框高亮 */
.version-card.active {
  border: 4rpx solid #fff;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.15);
}

/* 标准版：沉稳紫蓝 */
.standard-card {
  background: linear-gradient(
    135deg,
    #5a6ee0 0%,
    #6b7fe8 100%
  );
}
/* 社区版：医疗科技蓝 */
.community-card {
  background: linear-gradient(
    135deg,
    #2b6de9 0%,
    #4a8cff 100%
  );
}


.card-content {
  display: flex;
  align-items: center;
  z-index: 2;
}

.icon-box {
  width: 100rpx;
  height: 100rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 30rpx;
}

.card-icon {
  font-size: 50rpx;
}

.text-box {
  flex: 1;
  color: #ffffff;
}

.card-title {
  font-size: 38rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 12rpx;
}

.card-desc {
  font-size: 24rpx;
  opacity: 0.9;
  line-height: 1.4;
  display: block;
}

/* 对勾标记 */
.check-mark {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 50rpx;
  height: 50rpx;
  background-color: #ffffff;
  color: #333; /* 对勾颜色 */
  border-radius: 50%;
  text-align: center;
  line-height: 50rpx;
  font-weight: bold;
  font-size: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.2);
}

/* 针对标准版选中时的对勾颜色优化 */
.standard-card .check-mark {
  color: #667eea;
}

/* 针对社区版选中时的对勾颜色优化 */
.community-card .check-mark {
  color: #fda085;
}
</style>