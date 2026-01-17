<template>
  <view class="deviceMain">
    <view class="device" v-for="(item, index) in devices" :key="index" :class="item.color">
      <view class="deviceTop">
        <view class="deviceTopLeft">
          <image class="imgType" :src="item.iconSrc"></image>
        </view>
        <view class="deviceTopRight">
          <view class="ctr-left">
            <view class="deviceName">{{ item.deviceInfo.name }}</view>
            <view class="deviceSerial">序列码：{{ item.deviceInfo.serialCode }}</view>
            <view class="deviceDate">激活日期：{{ item.deviceInfo.activeDate }}</view>
          </view>
          <view class="ctr-right" v-if="isConnected">
            <text v-if="isStartdetect" @click="stopDetection()" class="useBtn useBtnBgColor2">
              停止检测
            </text>
          </view>
        </view>
      </view>
      <view class="deviceBottom">
        <view class="ruleLabel">
          <view class="ruleBtn" @click.stop="viewRules(item)">
            <text style="margin-right: 6px;">当前使用信息</text>
            <view class="arrowIcon" :class="[item.isViewRule ? 'rotate' : 'backRotate']"></view>
          </view>
          <view>
            <uni-tag v-if="isConnected" text="蓝牙已连接" type="success" />
            <uni-tag v-if="!isConnected" text="蓝牙未连接" />
          </view>
        </view>
        <view v-if="item.isViewRule" class="deviceDetail">
          <view class="infoList">设备状态：已绑定</view>
          <view class="infoList">设备使用套餐：黄金VIP（使用次数剩余48次）</view>
          <view class="infoList">最近数据同步时间：{{ recentUpSleepTime }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "DeviceList",
  props: {
    devices: {
      type: Array,
      required: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    isStartdetect: {
      type: Boolean,
      default: false,
    },
    recentUpSleepTime: {
      type: String,
      default: "",
    },
  },
  methods: {
    stopDetection() {
      this.$emit("stop-detection");
    },
    viewRules(item) {
      this.$emit("view-rules", item);
    },
  },
};
</script>

<style scoped>
/* 优化后的颜色配比 */
.colorSet1 .deviceTop {
  background: radial-gradient(circle at left bottom, #e0f7fa, #e0f7fa); /* 淡蓝绿背景 */
}
.colorSet1 .deviceBottom {
  background: radial-gradient(circle at left top, #b2ebf2, #b2ebf2); /* 深一点的蓝绿色 */
}
.colorSet1 .deviceName {
  color: #00796b; /* 深蓝绿色字体 */
}
.colorSet1 .deviceSerial,
.colorSet1 .deviceDate,
.colorSet1 .ruleBtn,
.colorSet1 .infoList {
  color: #004d40; /* 深蓝绿色，强调文本信息 */
}
.colorSet1 .arrowIcon {
  border-top: 1px solid #004d40;
  border-right: 1px solid #004d40;
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