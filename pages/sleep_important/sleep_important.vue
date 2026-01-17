<template>
  <div class="copd-monitoring">
    <!-- 顶部图文区域 -->
    <div class="header-section">
      <img
        src="https://picsum.photos/id/1015/800/400" 
        alt="慢阻肺监测场景"
        class="header-img"
      >
      <h1>慢阻肺监测为何至关重要</h1>
    </div>

    <!-- 内容说明区域 -->
    <div class="content-section">
      <p>
        慢性阻塞性肺疾病（慢阻肺）是一种以持续呼吸道症状和气流受限为特征的慢性肺部疾病，监测是管理它的核心环节。
        你或许觉得“偶尔咳嗽气短”无关紧要，但慢阻肺的进展具有隐蔽性，及时监测能让你在疾病早期就捕捉到风险信号。
      </p>

      <p>
        慢阻肺监测可产生多维度的关键价值。它不仅能帮助你和医生清晰掌握肺功能的变化趋势，还能从根源上优化治疗方案、预防急性加重、提升生活质量。
        监测可及时发现肺功能的细微下降，助力调整用药策略；能提前预警急性发作的可能，降低住院风险；甚至可以让你更科学地进行呼吸康复训练，逐步提升活动耐力。
        若忽视监测，慢阻肺可能会在不知不觉中加速进展，导致呼吸困难加剧、生活无法自理，甚至危及生命。
      </p>

      <p>
        那么如何判断监测是否有效且规范？如果每次监测后能让你对自身肺功能“心中有数”，治疗方案能随之动态优化，通常说明监测是到位的。
        不同病情阶段的慢阻肺患者，监测的频率和重点也因人而异。总体而言，稳定期患者建议每3个月进行一次肺功能核心指标监测，急性加重高风险患者需增加症状和血氧的日常监测，而住院患者则应在治疗期间动态监测肺功能及炎症指标。
      </p>

      <p>
        随着病程推进，你的肺功能压力会逐渐累积。你可能会频繁出现咳嗽加重、气短加剧或痰液异常的情况。这是身体在告诉你，该重视监测并及时就医了。
      </p>
    </div>

    <!-- 底部辅助图文区域 -->
    <div class="footer-section">
      <img
        src="https://picsum.photos/id/1019/800/300" 
        alt="慢阻肺监测工具示意"
        class="footer-img"
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'CopdMonitoring',
}
</script>

<style scoped>
.copd-monitoring {
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

.header-img {
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
  margin-bottom: 30px;
}

.content-section p {
  margin-bottom: 20px;
  text-indent: 2em;
}

.footer-section {
  text-align: center;
}

.footer-img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>