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
            <view class="deviceSerial">序列码：{{ removeSubstringContext(item.deviceInfo.serialCode, "ynu_", false, true) }}</view>
            <view class="deviceDate">激活日期：{{ item.deviceInfo.activeDate }}</view>
          </view>
          <view class="ctr-right" v-if="isConnected">
            <text v-if="!isStartdetect" @click="startDetection()" class="useBtn useBtnBgColor2">
              进入检测
            </text>
            <text v-if="isStartdetect" @click="endDetection()" class="useBtn useBtnBgColor2">
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
        
        <view v-if="item.isViewRule" class="device-status-container">
          <uni-tag text="设备状态：已绑定" type="success" />
          <uni-tag 
            @click="unbindDevice(item)" 
            text="取消绑定" 
            type="danger" 
            class="unbind-uni-tag" 
          />
        </view>
      </view>
    </view>
    
    <HealthCheckModal
      v-if="showCheckModal"
      :need-ecg="isneedECG"
      @close="endWindow()"
      @complete="endDetection()"
    />
  </view>
</template>

<script>
import HealthCheckModal from './deviceList_HealthCheck.vue';
import { removeSubstring } from "@/utils/strFormat.js"
import { request } from "@/utils/httpUtils.js";

export default {
  name: "DeviceList_asthma",
  components: {
    HealthCheckModal
  },
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
    showCheckModal: {
      type: Boolean,
      default: false,
    },
    isneedECG: {
      type: Boolean,
      default: false,
    }
  },

  methods: {
    removeSubstringContext(oStr, sStr, sensi, global) {
      return removeSubstring(oStr, sStr, sensi, global)
    },
    viewRules(item) {
      this.$emit("view-rules", item);
    },
    startDetection() {
      // 检查连接状态
      if (!this.isConnected) {
        uni.showToast({ title: '请先连接蓝牙', icon: 'none' });
        return;
      }
      // 通知父组件或直接跳转
      this.$emit("start-detection");
    },
    endDetection() {
      this.$emit("end-detection");
    },
    endWindow() {
      this.$emit("end-window");
    },
    unbindDevice(item) {
      const serialCode = item.deviceInfo.serialCode;
      uni.showModal({
        title: "提示",
        content: "确定取消绑定该哮喘设备吗？",
        success: async (res) => {
          if (!res.confirm) return;
          const payload = { deviceSerialCode: serialCode };
          let obj = {
            method: "POST",
            showLoading: true,
            url: `/device/unbind`, 
            data: payload, 
            message: "正在解绑设备"
          }
          request(obj).then(res => {
            if (res.code === 200) {
              this.$emit("unbind-success", item);
            } else {
              uni.showToast({
                title: res.msg || "取消失败",
                icon: "none"
              });
            }
          }).catch(err => {
            uni.showToast({
              title: "网络错误",
              icon: "none"
            });
          })
        }
      });
    }
  },
};
</script>

<style scoped>
.colorSet1 .deviceTop {
  background: radial-gradient(circle at left bottom, #e0f7fa, #e0f7fa);
}
.colorSet1 .deviceBottom {
  background: radial-gradient(circle at left top, #b2ebf2, #b2ebf2);
}
.colorSet1 .deviceName {
  color: #00796b;
}
.colorSet1 .deviceSerial,
.colorSet1 .deviceDate,
.colorSet1 .ruleBtn,
.colorSet1 .infoList {
  color: #004d40;
}
.colorSet1 .arrowIcon {
  border-top: 1px solid #004d40;
  border-right: 1px solid #004d40;
}

.colorSet2 .deviceTop {
  background: radial-gradient(circle at left bottom, #f3e5f5, #f3e5f5);
}
.colorSet2 .deviceBottom {
  background: radial-gradient(circle at left top, #e1bee7, #e1bee7);
}
.colorSet2 .deviceName {
  color: #6a1b9a;
}
.colorSet2 .deviceSerial,
.colorSet2 .deviceDate,
.colorSet2 .ruleBtn,
.colorSet2 .infoList {
  color: #6a1b9a;
}
.colorSet2 .arrowIcon {
  border-top: 1px solid #6a1b9a;
  border-right: 1px solid #6a1b9a;
}

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

.device-status-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 0 0;
  gap: 10px;
}

.unbind-uni-tag {
  width: 73.7px;
  text-align: center;
  padding: 0 !important;
  font-size: 12px !important;
  border: 1px solid #f53f3f !important;
  background-color: #f53f3f !important;
  height: 21.8px !important;
  line-height: 22px !important;
}

.unbind-uni-tag:active {
  opacity: 0.8;
}
</style>