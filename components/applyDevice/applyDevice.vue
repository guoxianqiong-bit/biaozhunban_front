<template>
  <view class="deviceMain">
    <view
      class="device"
      v-for="(item, index) in applyDevices"
      :key="`apply-${index}`"
      :class="item.color"
    >
      <view class="deviceTop">
        <view class="deviceTopLeft">
          <image class="imgType" :src="item.iconSrc"></image>
        </view>
        <view class="deviceTopRight">
          <view class="ctr-left">
            <view class="deviceName">{{item.deviceInfo.name}}</view>
            <view class="deviceSerial">序列码：{{ item.deviceInfo.serialCode }}</view>
            <view class="deviceDate">申请日期：{{ item.deviceInfo.applicationDate }}</view>
          </view>
          <view class="ctr-right">
            <text v-if="item.deviceInfo.status == 0" class="useBtn useBtnBgColor3">正在审核</text>
            <text v-if="item.deviceInfo.status == -1" class="useBtn useBtnBgColor2">拒绝绑定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "ApplyDeviceList",
  props: {
    applyDevices: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
/* 默认颜色配比 */
.colorSet1 .deviceTop {
  background: radial-gradient(circle at left bottom, #edf4ff, #edf4ff);
}
.colorSet1 .deviceBottom {
  background: radial-gradient(circle at left top, #dae6ff, #dae6ff);
}
.colorSet1 .deviceName {
  color: #2b6feb;
}
.colorSet1 .deviceSerial,
.colorSet1 .deviceDate,
.colorSet1 .ruleBtn,
.colorSet1 .infoList {
  color: #5f98ff; /* 跟随配色 */
}
.colorSet1 .arrowIcon {
  border-top: 1px solid #5f98ff;
  border-right: 1px solid #5f98ff;
}

/* 第二种颜色配比 - 调整为紫色系 */
.colorSet2 .deviceTop {
  background: radial-gradient(circle at left bottom, #f3e5f5, #f3e5f5); /* 浅紫色背景 */
}
.colorSet2 .deviceBottom {
  background: radial-gradient(circle at left top, #e1bee7, #e1bee7); /* 深一点的紫色 */
}
.colorSet2 .deviceName {
  color: #6a1b9a; /* 深紫色字体 */
}
.colorSet2 .deviceSerial,
.colorSet2 .deviceDate,
.colorSet2 .ruleBtn,
.colorSet2 .infoList {
  color: #6a1b9a; /* 深紫色字体 */
}
.colorSet2 .arrowIcon {
  border-top: 1px solid #6a1b9a; /* 深紫色边框 */
  border-right: 1px solid #6a1b9a;
}

/* 公用样式 */
.useBtnBgColor2 {
  background-color: #ff5555;
}
.useBtnBgColor3 {
  background-color: seagreen;
}
.rotate {
  transform: rotate(-45deg);
}
.backRotate {
  transform: rotate(135deg);
}
.deviceDetail {
  display: flex;
  flex-direction: column;
}
.infoList {
  padding-top: 10px;
  font-size: 12px;
}
</style>