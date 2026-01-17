<template>
  <view class="container">
    <!-- 背景图片 -->
    <image class="header-image" src="../../static/images/sleep/sleep_state_img.jpg" mode="widthFix"></image>
    
    <!-- 标题 -->
    <view class="title">了解睡眠阶段</view>
    
    <!-- 内容段落 -->
    <view class="content">
      <text>
        睡眠期间，你的身体会经历不同的睡眠阶段，一般而言，睡眠阶段由你产生的脑电波类型确定。一个睡眠时段内，大多数人会多次循环经历不同阶段。尽管科学家和医生可以识别你所处的睡眠阶段，但他们依然致力于充分理解每-阶段对身体的影响。
      </text>
    </view>

    <image class="header-image" src="../../static/images/sleep/R-C.835e1205cf855c9d0bf0e005ecd95898.jpeg" mode="widthFix"></image>
    
    <!-- 清醒时间 -->
    <view class="subSection">
      <view class="circle red"></view>
      <view class="subTitle">清醒时间</view>
    </view>
    <view class="content">
      <text>
        一次睡眠期间，你可能会醒来几次。偶尔醒来很正常。可能你会立刻再次入睡，并不记得曾在夜间醒来。
      </text>
    </view>

    <!-- 快速眼动睡眠 -->
    <view class="subSection">
      <view class="circle blue"></view>
      <view class="subTitle">快速眼动睡眠</view>
    </view>
    <view class="content">
      <text>
        这一睡眠阶段可能对学习和记忆产生一定影响。在此阶段，你的肌肉最为放松，眼球也会快速左右移动。这也是你大多数梦境出现的阶段。
      </text>
    </view>

    <!-- 核心睡眠 -->
    <view class="subSection">
      <view class="circle blue"></view>
      <view class="subTitle">核心睡眠</view>
    </view>
    <view class="content">
      <text>
        这一阶段有时也称为浅睡期，与其他阶段一样重要。此阶段通常占据你每晚大部分的睡眠时间。对于认知至关重要的脑电波会在这一阶段产生。
      </text>
    </view>

    <!-- 深度睡眠 -->
    <view class="subSection">
      <view class="circle darkblue"></view>
      <view class="subTitle">深度睡眠</view>
    </view>
    <view class="content">
      <text>
        因为脑电波的特征，这一阶段也称为慢波睡眠。在此阶段，身体组织得到修复，并释放重要荷尔蒙。它通常出现在睡眠的前半段，且持续时间较长。深度睡眠期间，身体非常放松，因此相较于其他阶段，你可能更难在此阶段醒来。
      </text>
    </view>
    
    <view style="height: 200rpx;"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style scoped>
.container {
  width: 95%;
  margin: 0 auto;
}

.header-image {
  width: 100%;
  height: auto;
}

.title {
  font-size: 50rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

/* 修改后的布局，circle和subTitle并排 */
.subSection {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.circle {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.red {
  background-color: red;
}

.blue {
  background-color: #00aaff;
}

.darkblue {
  background-color: #0000aa;
}

.subTitle {
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  width: 98%;
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.content text {
  text-align: justify;
  display: block;
  margin-bottom: 20rpx;
  color: #222;
}
</style>