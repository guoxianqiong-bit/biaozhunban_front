<template>
  <div class="copd-danger">
    <!-- 顶部图文区域 -->
    <div class="header-section">
<!--      <img
        :src="copdImg"
        alt="慢阻肺病理示意图"
        class="copd-img"
      > -->
	  <view>
	     <image :src="copdImg"
        alt="慢阻肺病理示意图"
        class="copd-img"></image>
	  </view>
      <h1>慢性阻塞性肺疾病：不容忽视的健康威胁</h1>
    </div>

    <!-- 内容说明区域 -->
    <div class="content-section">
      <p>
        慢性阻塞性肺疾病（慢阻肺）是一种严重威胁人类健康的呼吸系统疾病，其病理改变会对肺部造成不可逆的损伤，进而引发一系列致命风险。它绝非“简单的咳嗽气喘”，而是隐藏在呼吸之间的健康杀手。
      </p>

      <div class="danger-list">
        <!-- 肺部结构破坏 -->
        <div class="danger-item">
          <h2>肺部结构的毁灭性破坏</h2>
          <p>
            慢阻肺会导致细支气管狭窄、肺泡大量破坏，使肺部正常的气体交换功能严重受损。健康的肺部如精密的“气体交换站”，而慢阻肺患者的肺部则因结构破坏变得“千疮百孔”，氧气吸入和二氧化碳排出的效率急剧下降，为全身器官缺氧埋下隐患。
          </p>
        </div>

        <!-- 全身器官连锁损伤 -->
        <div class="danger-item">
          <h2>全身器官的连锁“崩溃”</h2>
          <p>
            肺部损伤并非孤立存在，它会引发多米诺骨牌式的全身并发症。长期缺氧会导致心脏负荷剧增，诱发肺源性心脏病（肺心病）；大脑因缺氧出现认知功能下降、甚至昏迷；还可能引发骨质疏松、肌肉萎缩等，让患者生活能力快速丧失。
          </p>
        </div>

        <!-- 急性加重的致命风险 -->
        <div class="danger-item">
          <h2>急性加重的致命“风暴”</h2>
          <p>
            慢阻肺患者极易出现急性加重，每一次急性加重都可能是“生死考验”。感染、空气污染等诱因会让呼吸功能在短时间内急剧恶化，出现严重呼吸困难、呼吸衰竭，若抢救不及时，会直接导致死亡。即便抢救成功，也会让肺功能“雪上加霜”，加速疾病进展。
          </p>
        </div>
      </div>

      <p>
        慢阻肺的危险性贯穿疾病全程，从肺部结构的悄然破坏，到全身器官的连锁损伤，再到急性加重的致命风暴，每一环都在威胁生命健康。重视早期筛查、坚持规范治疗、远离吸烟等危险因素，是抵御这一“呼吸杀手”的关键。切勿因早期症状轻微而忽视，及时干预才能打破危险的恶性循环。
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CopdDanger',
  data() {
    return {
      copdImg: '/static/images/copd/card3.png' // 可替换为实际慢阻肺病理图的真实地址
    }
  }
}
</script>

<style scoped>
.copd-danger {
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

.copd-img {
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

.danger-list {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.danger-item {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.danger-item h2 {
  font-size: 20px;
  color: #e74c3c;
  margin-bottom: 10px;
}
</style>