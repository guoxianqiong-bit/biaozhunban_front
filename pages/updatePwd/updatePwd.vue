<template>
  <view class="container">
    <!-- 输入当前密码 -->
    <view class="input-box">
      <view class="input-label">当前密码</view>
      <input
        class="input"
        type="password"
        placeholder="请输入当前密码"
        v-model="currentPassword"
      />
    </view>

    <!-- 输入新密码 -->
    <view class="input-box">
      <view class="input-label">新密码</view>
      <input
        class="input"
        type="password"
        placeholder="请输入新密码"
        v-model="newPassword"
      />
    </view>

    <!-- 确认新密码 -->
    <view class="input-box">
      <view class="input-label">确认新密码</view>
      <input
        class="input"
        type="password"
        placeholder="请再次确认新密码"
        v-model="confirmPassword"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="button-box">
      <button class="submit-btn" @click="submitChange">确认修改</button>
    </view>
  </view>
</template>

<script>
import { request } from "/utils/httpUtils.js";
import { showToast } from "/utils/ui.js";
export default {
  data() {
    return {
      currentPassword: "", // 当前密码
      newPassword: "", // 新密码
      confirmPassword: "", // 确认新密码
    };
  },
  methods: {
    // 提交修改密码
    submitChange() {
      if (!this.currentPassword) {
        uni.showToast({
          title: "当前密码不能为空",
          icon: "none",
        });
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        uni.showToast({
          title: "两次输入的新密码不一致",
          icon: "none",
        });
        return;
      }

      if (!this.newPassword) {
        uni.showToast({
          title: "新密码不能为空",
          icon: "none",
        });
        return;
      }
      let that = this;
      let obj = {
        method: "POST",
        showLoading: true,
        url: `/user/updatePwd`,
        data: {
          oldPwd: that.currentPassword,
          newPwd: that.newPassword,
        },
        message: "正在修改",
      };
      request(obj)
        .then((res) => {
          that.currentPassword = "";
          that.newPassword = "";
          that.confirmPassword = "";
          showToast("密码修改成功！", 1500);
        })
        .catch((err) => {
          showToast("现有密码输入错误", 1500);
        });
    },
  },
  onLoad() {},
};
</script>

<style scoped>
/* 页面容器 */
.container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f6fa;
  min-height: 100vh;
}

/* 标题样式 */
.title {
  font-size: 40rpx;
  color: #2f3542;
  margin-bottom: 40rpx;
  font-weight: bold;
}

/* 输入框外部容器 */
.input-box {
  width: 100%;
  margin-bottom: 30rpx;
}

/* 标签样式 */
.input-label {
  font-size: 28rpx;
  color: #57606f;
  margin-bottom: 10rpx;
}

/* 输入框样式 */
.input {
  width: 100%;
  padding: 20rpx;
  font-size: 30rpx;
  border-radius: 8rpx;
  border: 1rpx solid #dfe4ea;
  background-color: #ffffff;
}

/* 提交按钮容器 */
.button-box {
  width: 100%;
  margin-top: 40rpx;
  display: flex;
  justify-content: center; /* 按钮居中显示 */
}

/* 提交按钮样式 */
.submit-btn {
  width: 25%; /* 进一步减少按钮宽度为容器宽度的25% */
  padding: 12rpx 0; /* 适当调整垂直方向的padding */
  font-size: 28rpx; /* 减小字体大小适应按钮尺寸 */
  color: #ffffff;
  background-color: #1e90ff;
  border: none;
  border-radius: 25rpx; /* 维持半圆角设计 */
  text-align: center;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.submit-btn:active {
  background-color: #1c86ee;
}
</style>