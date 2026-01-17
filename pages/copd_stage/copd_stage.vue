<template>
  <div class="copd-stages">
    <!-- 顶部图文区域 -->
    <div class="header-section">
      <image
        :src="stageImg"
        alt="慢阻肺发展阶段示意图"
        class="stage-img"
      ></image>
      <h1>慢阻肺发展阶段：从早期到晚期的演变</h1>
    </div>

    <!-- 内容说明区域 -->
    <div class="content-section">
      <p>
        慢性阻塞性肺疾病（慢阻肺）是一种进行性发展的肺部疾病，其病程会经历不同阶段的演变。了解这些阶段，能帮助患者和家属更早识别信号、及时干预，从而延缓疾病进展。
      </p>

      <div class="stages-list">
        <!-- 早期阶段 -->
        <div class="stage-item">
          <h2>早期：轻微咳嗽，少量阴影</h2>
          <p>
            此阶段症状较为隐匿，患者多表现为偶尔的轻微咳嗽，可能伴有少量白色黏液痰。肺部影像学检查仅可见少量阴影，肺功能损伤处于轻度阶段，日常活动通常不受明显影响。很多患者会误以为是普通感冒或支气管炎，从而忽视早期干预。
          </p>
        </div>

        <!-- 中期阶段 -->
        <div class="stage-item">
          <h2>中期：咳嗽加重伴喘息，阴影扩大</h2>
          <p>
            随着病情发展，咳嗽频率和程度明显加重，活动后易出现喘息、气短症状，痰液量增多且可能变稠。肺部阴影范围扩大，肺功能进一步下降，患者在爬楼梯、快步走等活动中会感到明显吃力，生活质量开始受到影响。此时若及时规范治疗，仍可有效延缓疾病向晚期进展。
          </p>
        </div>

        <!-- 晚期阶段 -->
        <div class="stage-item">
          <h2>晚期：呼吸困难需吸氧，大面积阴影</h2>
          <p>
            进入晚期后，患者即使在静息状态下也会出现明显的呼吸困难，日常穿衣、洗漱等简单活动都可能引发严重气促，需要长期吸氧维持。肺部影像学可见大面积阴影，肺功能严重受损，还可能伴随心力衰竭、呼吸衰竭等严重并发症，对生命健康构成极大威胁。
          </p>
        </div>
      </div>

      <p>
        慢阻肺的发展是一个逐渐加重的过程，每个阶段的症状和肺部损伤程度差异明显。早期识别、定期监测、规范治疗是延缓病情进展的关键。当出现持续咳嗽、喘息加重等信号时，应及时就医评估，切勿忽视身体发出的“预警”。
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CopdStages',
  data() {
    return {
      stageImg: '../../static/images/copd/card2.png' // 可替换为实际慢阻肺阶段示意图的真实地址
    }
  }
}
</script>

<style scoped>
.copd-stages {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Microsoft YaHei", sans-serif;
  color: #333;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.stage-img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 28px;
  font-weight: bold;
  margin-top: 20px;
  color: #2c3e50;
}

.content-section {
  line-height: 1.8;
  font-size: 16px;
}

.stages-list {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stage-item {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stage-item h2 {
  font-size: 20px;
  color: #e74c3c;
  margin-bottom: 10px;
}
</style>