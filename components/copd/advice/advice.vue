<template>
	<view class="report-module diagnosis-module">
	  <text class="module-title">综合诊断与建议</text>

	  <view class="diagnosis-content">
	    <!-- ✨ 包含结果判断提示 -->
	    <text class="diagnosis-item">
	      血氧为 {{(oxygen * 100).toFixed(2) }}%，FEV1/FVC 为 {{ (FEV1FVC * 100).toFixed(2) }}%。（{{ copdConclusion }}）
	    </text>
	  </view>

	  <!-- 医生信息 -->
	  <view class="doctor-info">
	    <text class="doctor-name">诊断医生：{{ doctorName }}</text>
	    <text class="diagnose-date">诊断日期：{{ reportDate }}</text>
	  </view>
	</view>
</template>



<script>
export default {
  props: {
	oxygen: { type: Number, required: true },
	FEV1FVC: { type: Number, required: true },
	allAdivce: { type:String, default:"" }
  },

  data() {
    return {
        doctorName:"李XX",
    }
  },

  computed: {
    /* ============================
       ⭐ COPD 智能判断
       ============================ */
    copdConclusion() {
      let oxy = this.oxygen;
      let ratio = this.FEV1FVC;

      /* ---- 1. 明显异常，疑似慢阻肺 ---- */
      if (ratio < 0.70) {
        return "提示：FEV1/FVC 明显下降，疑似存在慢性阻塞性肺疾病（COPD），建议进一步检查";
      }

      /* ---- 2. 边缘情况，有慢阻肺趋势 ---- */ 
      if (ratio >= 0.70 && ratio < 0.75) {
        if (oxy < 0.95) {
          return "提示：FEV1/FVC 较低且血氧偏低，存在慢阻肺发展趋势，建议随访监测";
        }
        return "提示：FEV1/FVC 接近临界值，存在轻度通气受限的趋势，请注意定期复查";
      }

      /* ---- 3. FEV1/FVC 正常，但血氧偏低 ---- */
      if (ratio >= 0.75 && oxy < 0.95) {
        return "提示：血氧饱和度略低，建议关注呼吸功能及生活方式";
      }

      /* ---- 4. 完全正常 ---- */
      return "呼吸功能指标正常";
    }
  }
}
</script>


<style>
	@import "../../../pages/copd/report/report.css";
</style>