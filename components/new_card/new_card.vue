<template>
  <view class="container">
    <!-- 上半部分图片 -->
    <view class="image-container">
      <image class="image" :src="news_info.imgSrc" mode="aspectFill"></image>
    </view>

    <!-- 下半部分文字 -->
    <view class="text-container">
      <view class="title">{{news_info.title}}</view>
      <view class="description">{{news_info.description}}</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
		
	};
  },
  props: {
      news_info: {
        type: Object,
        default: () => ({})
      }
  },
};
</script>

<style scoped>
/* 整体布局 */
.container {
  width: 95%; /* 固定宽度 */
  height: 430rpx; /* 高度为400rpx */
  border-radius: 20rpx; /* 圆角 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f5f5;
  margin: 0 auto; /* 页面左右居中 */
  margin-top: 30rpx;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}

/* 上半部分图片样式 */
.image-container {
  width: 100%;
  height: 70%; /* 占80%高度 */
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持图片比例 */
}

/* 下半部分文字样式 */
.text-container {
  width: 100%;
  height: 30%; /* 占20%高度 */
  background-color: whitesmoke;
  padding-top: 20rpx;
  padding-left: 40rpx;
}

.title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.description {
  font-size: 24rpx;
  color: #666;
}
</style>