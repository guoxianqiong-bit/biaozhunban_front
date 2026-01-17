<template>
  <view class="report-module">
    <text class="module-title">6. 呼吸（RESP）监测</text>
    <view class="chart-container waveform-chart">
      <text class="chart-title">
        呼吸波形（{{ totalSeconds }}秒）
        <text class="duration-info">（可左右滑动查看）</text>
      </text>
      <view class="scroll-container">
        <view 
          class="canvas-wrapper" 
          :style="{ width: canvasWidth + 'px' }"
        >
          <!-- 新增：加载状态提示，数据处理/绘制时显示 -->
          <view class="loading-tip" v-if="isLoading">
            <text>呼吸波形加载中...</text>
          </view>
          <!-- 呼吸波Canvas：新增渐显动画控制 -->
          <canvas 
            id="respCanvas"
            canvas-id="respCanvas" 
            class="wave-chart"
            :width="canvasWidth" 
            :height="waveChartHeight"
            :style="{ 
              width: canvasWidth + 'px', 
              height: waveChartHeight + 'px',
              opacity: isLoading ? 0 : 1  // 控制渐显过渡
            }"
          ></canvas>
        </view>
      </view>
      <view class="wave-marker">
        <text class="marker-text">呼吸频率：{{ respRate }}次/分</text>
        <text class="marker-text">时长: {{ totalSeconds }}秒</text>
        <text class="marker-text">数据点: {{ respWaveData.length }}个</text>
        <text class="marker-text">X缩放: {{ xScale.toFixed(2) }}x</text>
      </view>
    </view>

    <view class="data-grid">
      <view class="data-item">
        <text class="data-label">平均呼吸频率</text>
        <text class="data-value warn">{{ respRate }}次/分</text>
      </view>
      <view class="data-item">
        <text class="data-label">呼吸暂停次数</text>
        <text class="data-value">{{ respApnea }}次</text>
      </view>
      <view class="data-item">
        <text class="data-label">最长暂停时长</text>
        <text class="data-value">{{ respApneaMax }}秒</text>
      </view>
    </view>

    <view class="analysis-box">
      <text class="analysis-title">分析：</text>
      <text class="analysis-content">{{ respAdivce }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    respReportData: { type: Array, default: () => [] },
    // 修正：respAdivce应为字符串类型（原默认数组，与实际使用场景匹配）
    respAdivce: { type: String, default: '' },
    xScale: { type: Number, default: 0.5 },
    yScale: { type: Number, default: 0.3 },
    respRate: { type: Number, default: 16 }
  },
  data() {
    return {
      waveChartHeight: 180,
      visibleWidth: 0,
      canvasWidth: 0,
      totalSeconds: 0,
      sampleRate: 125,
      respApnea: 0,
      respApneaMax: 0,
      respWaveData: [],
      resizeHandler: null,
      isLoading: true  // 新增：加载状态控制变量
    }
  },
  watch: {
    respReportData(newVal) {
      console.log('[RESP] 接收真实数据长度：', newVal.length);
      this.isLoading = true; // 数据更新时，重置为加载状态
      this.processRespData(newVal);
    },
    xScale() { 
      this.isLoading = true; // 缩放变化时，重置为加载状态
      this.processRespData(this.respReportData); 
    },
    yScale() { 
      this.isLoading = true; // 缩放变化时，重置为加载状态
      this.drawRespWaveform(); 
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getVisibleWidth();
    });
    
    this.resizeHandler = () => {
      this.$nextTick(() => {
        this.isLoading = true; // 窗口resize时，重置为加载状态
        this.getVisibleWidth();
      });
    };
    
    uni.onWindowResize(this.resizeHandler);
  },
  beforeUnmount() {
    if (this.resizeHandler) {
      try {
        uni.offWindowResize(this.resizeHandler);
      } catch (e) {
        console.warn('移除窗口 resize 监听失败:', e);
      }
      this.resizeHandler = null;
    }
  },
  methods: {
    getVisibleWidth() {
      uni.createSelectorQuery().in(this)
        .select('.scroll-container')
        .boundingClientRect(rect => {
          if (rect) {
            this.visibleWidth = Math.floor(rect.width);
            this.processRespData(this.respReportData);
            console.log('[RESP] 滚动容器宽度：', this.visibleWidth);
          }
        })
        .exec(() => {});
    },

    processRespData(data) {
      const paddingLeft = 10;
      const paddingRight = 10;

      if (data && data.length > 0) {
        this.respWaveData = data.filter(val => !isNaN(val) && isFinite(val));
        console.log('[RESP] 过滤后数据长度：', this.respWaveData.length);

        this.totalSeconds = Number((this.respWaveData.length / this.sampleRate).toFixed(1));

        const contentWidth = this.respWaveData.length * this.xScale;
        this.canvasWidth = Math.ceil(paddingLeft + contentWidth + paddingRight);
        console.log('[RESP] 数据总宽度：', contentWidth, '| 画布总宽度：', this.canvasWidth);

        this.drawRespWaveform();
      } else {
        this.totalSeconds = 20;
        this.isLoading = false; // 无数据时，隐藏加载状态
      }
    },


    drawRespWaveform() {
      if (!this.respWaveData.length || !this.visibleWidth || !this.canvasWidth) {
        console.warn('[RESP] 绘制条件不满足（数据/宽度未就绪）');
        this.isLoading = false; // 条件不满足时，隐藏加载状态
        return;
      }

      uni.createSelectorQuery().in(this)
        .select('#respCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
          if (res[0]) {
            const canvas = res[0].node;
            canvas.width = this.canvasWidth;
            canvas.height = this.waveChartHeight;

            const ctx = uni.createCanvasContext('respCanvas', this);
            const padding = { top: 20, right: 10, bottom: 20, left: 10 };
            const drawWidth = this.canvasWidth - padding.left - padding.right;
            const drawHeight = this.waveChartHeight - padding.top - padding.bottom;
            const baseLineY = padding.top + drawHeight / 2;

            // 清空画布
            ctx.clearRect(0, 0, this.canvasWidth, this.waveChartHeight);
            ctx.setFillStyle('#f9f9f9');
            ctx.fillRect(0, 0, this.canvasWidth, this.waveChartHeight);

            // 绘制横向网格线
            ctx.setStrokeStyle('#eee');
            ctx.setLineWidth(1);
            for (let i = 0; i <= 4; i++) {
              const gridY = padding.top + (drawHeight / 4) * i;
              ctx.beginPath();
              ctx.moveTo(padding.left, gridY);
              ctx.lineTo(padding.left + drawWidth, gridY);
              ctx.stroke();
            }

            // 纵向网格线（每1秒1条）
            const secPixelInterval = Math.ceil(this.sampleRate * this.xScale);
            const totalSec = Math.floor(this.totalSeconds);
            for (let i = 0; i <= totalSec; i++) {
              const gridX = padding.left + secPixelInterval * i;
              if (gridX > padding.left + drawWidth) break;

              ctx.setLineWidth(i % 5 === 0 ? 1.5 : 1);
              ctx.setStrokeStyle(i % 5 === 0 ? '#ddd' : '#eee');
              ctx.beginPath();
              ctx.moveTo(gridX, padding.top);
              ctx.lineTo(gridX, padding.top + drawHeight);
              ctx.stroke();

              if (i % 5 === 0) {
                ctx.setFillStyle('#999');
                ctx.setFontSize(12);
                ctx.fillText(`${i}s`, gridX + 5, padding.top + 15);
              }
            }

            // 绘制基线
            ctx.setStrokeStyle('#ccc');
            ctx.setLineWidth(1);
            ctx.beginPath();
            ctx.moveTo(padding.left, baseLineY);
            ctx.lineTo(padding.left + drawWidth, baseLineY);
            ctx.stroke();

            // 绘制呼吸波形
            ctx.setStrokeStyle('#4CD964');
            ctx.setLineWidth(1.5);
            ctx.beginPath();

            this.respWaveData.forEach((value, index) => {
              const safeValue = isNaN(value) || !isFinite(value) ? 0 : value;
              const pointX = padding.left + (index * this.xScale);
              const maxAmplitude = drawHeight * 0.4 * this.yScale;
              let pointY = baseLineY - safeValue * maxAmplitude;
              pointY = Math.max(padding.top + 5, Math.min(padding.top + drawHeight - 5, pointY));

              if (index === 0) {
                ctx.moveTo(pointX, pointY);
              } else {
                ctx.lineTo(pointX, pointY);
              }
            });

            ctx.stroke();
            // 绘制完成后，延迟100ms隐藏加载状态（确保动画平滑）
            ctx.draw(false, () => {
              setTimeout(() => {
                this.isLoading = false;
              }, 100);
              console.log('[RESP] 波形绘制完成，动画开始');
            });
          } else {
            this.isLoading = false;
          }
        });
    }
  }
}
</script>

<style scoped lang="css">
/* 原有样式保持不变，新增加载状态和渐显动画相关样式 */
.report-module {
  padding: 20rpx 16rpx;
  box-sizing: border-box;
  overflow: visible !important;
  width: 100%;
}
.chart-container {
  width: 100%;
  margin-top: 20rpx;
  box-sizing: border-box;
  overflow: visible !important;
}
.scroll-container {
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  -webkit-overflow-scrolling: touch;
  display: block;
  margin-top: 10rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  position: relative; /* 新增：为加载提示定位 */
}
.canvas-wrapper {
  display: block;
  white-space: nowrap;
  box-sizing: border-box;
  padding: 0 !important;
  margin: 0 !important;
  min-width: 100%;
}
/* 新增：Canvas渐显动画，与心电图组件保持一致 */
.wave-chart {
  display: block;
  vertical-align: top;
  background: #f9f9f9;
  transition: opacity 0.5s ease; /* 0.5秒平滑过渡 */
}
/* 新增：加载提示样式，居中覆盖在Canvas上方 */
.loading-tip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  z-index: 10; /* 确保在Canvas上方显示 */
}
.loading-tip text {
  font-size: 24rpx;
  color: #999;
}

/* 原有样式继续保留 */
.module-title { font-size: 32rpx; font-weight: bold; color: #333; }
.chart-title { font-size: 28rpx; color: #666; font-weight: 500; }
.duration-info { font-size: 24rpx; color: #999; margin-left: 10rpx; }
.wave-marker { margin-top: 10rpx; font-size: 24rpx; color: #999; line-height: 1.5; }
.marker-text { margin-right: 20rpx; font-size: 24rpx; }
.data-grid { display: flex; flex-wrap: wrap; gap: 20rpx; margin-top: 30rpx; }
.data-item { flex: 1; min-width: 120rpx; background: #f5f5f5; padding: 15rpx; border-radius: 8rpx; }
.data-label { font-size: 24rpx; color: #999; }
.data-value { font-size: 28rpx; color: #333; font-weight: bold; margin-top: 5rpx; display: block; }
.data-value.warn { color: #FF7D00; }
.analysis-box { margin-top: 30rpx; background: #f9f9f9; padding: 20rpx; border-radius: 8rpx; }
.analysis-title { font-size: 28rpx; color: #333; font-weight: bold; }
.analysis-content { font-size: 24rpx; color: #666; margin-top: 10rpx; display: block; line-height: 1.6; }
.scroll-container::-webkit-scrollbar { height: 6px; background: #f1f1f1; border-radius: 3px; }
.scroll-container::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
.scroll-container::-webkit-scrollbar-thumb:hover { background: #ccc; }
</style>