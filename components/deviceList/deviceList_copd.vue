<template>
  <view class="deviceMain">
    <!-- 原有设备列表渲染 -->
    <view class="device" v-for="(item, index) in devices" :key="index" :class="item.color">
      <view class="deviceTop">
        <view class="deviceTopLeft">
          <image class="imgType" :src="item.iconSrc"></image>
        </view>
        <view class="deviceTopRight">
          <view class="ctr-left">
            <view class="deviceName">{{ item.deviceInfo.name }}</view>
            <view class="deviceSerial">序列码：{{ removeSubstringContext(item.deviceInfo.serialCode,"ynu_",false,true) }}</view>
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
          <!-- 蓝牙状态tag -->
          <view>
            <uni-tag v-if="isConnected" text="蓝牙已连接" type="success" />
            <uni-tag v-if="!isConnected" text="蓝牙未连接" />
          </view>
        </view>
        
        <!-- 最终优化版：设备状态+解绑按钮区域 -->
        <view v-if="item.isViewRule" class="device-status-container">
          <!-- 设备状态tag（匹配蓝牙tag样式） -->
          <uni-tag text="设备状态：已绑定"  type="success" />
          <!-- 取消绑定按钮：红色danger类型 + 匹配蓝牙未连接tag长度 -->
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
// 引入检测步骤组件
import HealthCheckModal from './deviceList_HealthCheck.vue'; 
import OxygenCheck from './deviceList_Oxygen.vue';
import EcgCheck from './deviceList_ecg.vue';
import BreathCheck from './deviceList_breath.vue';
import {removeSubstring} from  "@/utils/strFormat.js"
import { request } from "@/utils/httpUtils.js";
export default {
  name: "DeviceList_copd",
  components: {
    HealthCheckModal,
    OxygenCheck,
    EcgCheck,
    BreathCheck
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
    removeSubstringContext(oStr,sStr,sensi,global) {
      return removeSubstring(oStr,sStr,sensi,global)
    },
    viewRules(item) {
      this.$emit("view-rules", item);
    },
    startDetection() {
      this.$emit("start-detection");
    },
    endDetection() {
      this.$emit("end-detection");
    },
    endWindow() {
      this.$emit("end-window");
    },
    handleCheckComplete(results) {
      console.log("检测结果：", results);
      this.$emit("check-complete", results);
      uni.showToast({
        title: "检测已完成",
        icon: "success"
      });
    },
    unbindDevice(item) {
      const serialCode = item.deviceInfo.serialCode;
      uni.showModal({
        title: "提示",
        content: "确定取消绑定该设备吗？",
        success: async (res) => {
          if (!res.confirm) return;
          const payload = { deviceSerialCode: serialCode };
          const token = uni.getStorageSync("token");
          // let obj = {
          //   method: "POST",
          //   showLoading: true,
          //   url: `/deviceUse/failDevice`,
          //   data: payload,
          //   message: "正在申请解绑" 
          // }
		  let obj = {
		    method: "POST",
		    showLoading: true,
		    url: `/device/unbind`,   // ✅ 对应 DeviceController
		    data: payload,               // ✅ 后端不需要任何参数
		    message: "正在解绑设备"
		  }

          request(obj).then(res => {
            console.log("📌 后端响应 =", res);
            if (res.code === 200) {
              this.$emit("unbind-success", item);
            } else {
              uni.showToast({
                title: res.msg || "取消失败",
                icon: "none"
              });
            }
          }).catch(err => {
            console.error("❌解绑请求异常", err);
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
/* 原有样式保持不变 */
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

/* 核心优化：设备状态容器 - 两端对齐 */
.device-status-container {
  display: flex;
  justify-content: space-between; /* 设备状态左，解绑按钮右 */
  align-items: center;
  padding: 10px 0 0 0; /* 和蓝牙tag区域间距统一 */
  gap: 10px; /* 最小间距，防止挤在一起 */
}

/* 关键：匹配蓝牙未连接tag的长度 + 红色danger样式优化 */
.unbind-uni-tag {
  /* 强制宽度匹配「蓝牙未连接」tag（实测蓝牙未连接tag宽度约80px） */
  width: 73.7px;
  /* 保证文字居中，和蓝牙tag一致 */
  text-align: center;
  /* 移除默认多余间距，精准匹配长度 */
  padding: 0 !important;
  /* 保持和其他tag一致的字号 */
  font-size: 12px !important;
  border: 1px solid #f53f3f !important;
  background-color: #f53f3f !important;
  height: 21.8px !important;
  line-height: 22px !important;
}

/* 可选：点击态优化（增强交互） */
.unbind-uni-tag:active {
  opacity: 0.8;
}
</style>