<template>
  <!-- 血氧（SpO₂）模块 -->
  <view class="report-module">
    <text class="module-title">1. 血氧（SpO₂）监测</text>

    <!-- 血氧状态卡片 -->
    <view class="spo2-card">
      <view class="spo2-value-area">
        <!-- ✅ 主血氧值：仅颜色变化 -->
        <text class="spo2-value" :style="{ color: oxygenStatusColor }">
          {{ formattedOxygen }}
        </text>
        <text class="spo2-label">血氧浓度</text>
      </view>

      <view class="oxygen-status">
        <text class="status-text">本次测量</text>
        <!-- ✅ 状态文字：仅颜色变化 -->
        <text class="status-text" :style="{ color: oxygenStatusColor }">
          {{ oxygenStatus }}
        </text>
      </view>

      <view class="divider"></view>

      <!-- 参考范围 -->
      <view class="spo2-reference">
        <text class="reference-title">血氧浓度参考范围</text>
        <view class="reference-range">
          <view class="range-section normal" :style="{ width: '33.33%' }">
            <text class="range-text">正常</text>
            <text class="range-value">≥95%</text>
          </view>
          <view class="range-section low" :style="{ width: '33.33%' }">
            <text class="range-text">偏低</text>
            <text class="range-value">90%-94%</text>
          </view>
          <view class="range-section too-low" :style="{ width: '33.33%' }">
            <text class="range-text">过低</text>
            <text class="range-value">&lt;90%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 血氧分析 -->
    <view class="analysis-box">
      <text class="analysis-title">分析：</text>
      <text class="analysis-content">
        患者血氧浓度{{ (oxygen * 100).toFixed(2) }}%。
      </text>
    </view>
  </view>
</template>

<script>
export default {
  name: "BloodOxygen",
  props: {
    oxygen: {
      type: Number,
      required: true,
    },
    oxygenAdivce: {
      type: String,
      default: "",
    },
  },

  computed: {
    // 百分比格式
    formattedOxygen() {
      return `${(this.oxygen * 100).toFixed(2)}%`;
    },

    // 状态文本
    oxygenStatus() {
      const val = this.oxygen * 100;
      if (val >= 95) return "血氧水平正常";
      if (val >= 90) return "血氧水平偏低";
      return "血氧水平过低，请注意！";
    },

    // ✅ 动态字体颜色（绿色 / 橙色 / 红色）
    oxygenStatusColor() {
      const val = this.oxygen * 100;
      if (val >= 95) return "#52c41a"; // 正常
      if (val >= 90) return "#faad14"; // 偏低
      return "#f5222d"; // 过低
    },
  },
};
</script>

<style scoped>
@import "blood_oxygen.css";
@import "../../../pages/copd/report/report.css";

/* ✅ 不修改原字体大小，只加平滑颜色过渡 */
.spo2-value,
.status-text {
  transition: color 0.25s ease;
}
</style>
