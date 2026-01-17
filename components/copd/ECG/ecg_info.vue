<template>
  <view class="report-module">
    <text class="module-title">5. 心电图（ECG）监测</text>

    <!-- 波形显示区 -->
    <view class="chart-container waveform-chart">
      <text class="chart-title">
        心电波形（{{ totalSeconds }}秒）
        <text class="duration-info">（可左右滑动查看）</text>
      </text>

      <!-- 横向滚动容器 -->
      <view class="scroll-container">
        <view 
          class="canvas-wrapper" 
          :style="{ width: canvasWidth + 'px' }"
        >
          <!-- 加载状态提示：数据处理/绘制时显示 -->
          <view class="loading-tip" v-if="isLoading">
            <text>心电图加载中...</text>
          </view>
          <!-- 心电图Canvas：绘制完成后渐显 -->
          <canvas 
            id="ecgCanvas"
            canvas-id="ecgCanvas" 
            class="wave-chart"
            :style="{ 
              width: canvasWidth + 'px', 
              height: waveChartHeight + 'px',
              opacity: isLoading ? 0 : 1  // 控制渐显动画
            }"
            :width="canvasWidth" 
            :height="waveChartHeight"
          ></canvas>
        </view>
      </view>

      <view class="wave-marker">
        <text class="marker-text">10mm/mV</text>
        <text class="marker-text">25mm/s</text>
        <text class="marker-text">总时长: {{ totalSeconds }}秒</text>
        <text class="marker-text">数据点: {{ ecgWaveData.length }}个</text>
        <text class="marker-text">X缩放: {{ xScale.toFixed(2) }}x</text>
      </view>
    </view>

    <!-- 数据与分析 -->
    <view class="data-grid">
      <view class="data-item" v-for="item in metrics" :key="item.label">
        <text class="data-label">{{ item.label }}</text>
        <text class="data-value">{{ item.value }}</text>
      </view>
    </view>

    <view class="analysis-box">
      <text class="analysis-title">分析：</text>
      <text class="analysis-content">{{ ecgAdivce }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    heartRate: { type: Number, required: true },
    ecgReportData: { type: Array, default: () => [] },
    ecgAdivce: { type: String, default: '' },
    xScale: { type: Number, default: 0.5 },
    yScale: { type: Number, default: 0.3 }
  },
  data() {
    return {
      waveChartHeight: 180,
      visibleWidth: 0,
      canvasWidth: 0,
      totalSeconds: 0,
      sampleRate: 125,
      ecgWaveData: [],
      ecgHr: 72,
      prInterval: 160,
      qrsDuration: 90,
      qtInterval: 380,
      resizeHandler: null,
      isLoading: true  // 新增：控制加载状态和动画
    }
  },
  computed: {
    metrics() {
      return [
        { label: '心率', value: `${this.ecgHr}次/分` },
        { label: 'PR间期', value: `${this.prInterval}ms` },
        { label: 'QRS时限', value: `${this.qrsDuration}ms` },
        { label: 'QT间期', value: `${this.qtInterval}ms` }
      ];
    }
  },
  watch: {
    ecgReportData(newVal) {
      console.log('[ECG] 接收真实数据长度：', newVal.length);
      this.isLoading = true; // 数据更新时，重新显示加载状态
      this.processEcgData(newVal);
    },
    xScale() { 
      this.isLoading = true; // 缩放变化时，重新显示加载状态
      this.processEcgData(this.ecgReportData); 
    },
    yScale() { 
      this.isLoading = true; // 缩放变化时，重新显示加载状态
      this.drawEcgWaveform(); 
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getVisibleWidth();
    });
    this.resizeHandler = () => {
      this.$nextTick(() => {
        this.isLoading = true; // 窗口 resize 时，重新显示加载状态
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
            this.processEcgData(this.ecgReportData);
            console.log('[ECG] 容器宽度：', this.visibleWidth);
          }
        })
        .exec(() => {});
    },

    processEcgData(data) {
      const paddingLeft = 10;
      const paddingRight = 10;

      if (data && data.length > 0) {
        this.ecgWaveData = data.filter(val => !isNaN(val) && isFinite(val));
        console.log('[ECG] 过滤后数据长度：', this.ecgWaveData.length);

        this.totalSeconds = Number((this.ecgWaveData.length / this.sampleRate).toFixed(1));

        const contentWidth = this.ecgWaveData.length * this.xScale;
        this.canvasWidth = Math.ceil(paddingLeft + contentWidth + paddingRight);
        console.log('[ECG] 画布宽度：', this.canvasWidth);

        this.drawEcgWaveform();
      } else {
        this.isLoading = false; // 无数据时隐藏加载状态
      }
    },

    drawEcgWaveform() {
      if (!this.ecgWaveData.length || !this.visibleWidth || !this.canvasWidth) {
        console.warn('[ECG] 绘制条件不满足');
        this.isLoading = false;
        return;
      }

      uni.createSelectorQuery().in(this)
        .select('#ecgCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
          if (res[0]) {
            const canvas = res[0].node;
            canvas.width = this.canvasWidth;
            canvas.height = this.waveChartHeight;

            const ctx = uni.createCanvasContext('ecgCanvas', this);
            const padding = { top: 20, right: 10, bottom: 20, left: 10 };
            const drawWidth = this.canvasWidth - padding.left - padding.right;
            const drawHeight = this.waveChartHeight - padding.top - padding.bottom;
            const baseLineY = padding.top + drawHeight / 2;

            // 清空画布
            ctx.clearRect(0, 0, this.canvasWidth, this.waveChartHeight);
            ctx.setFillStyle('#fafafa');
            ctx.fillRect(0, 0, this.canvasWidth, this.waveChartHeight);

            // 横向网格线
            ctx.setStrokeStyle('#eee');
            ctx.setLineWidth(1);
            for (let i = 0; i <= 4; i++) {
              const y = padding.top + (drawHeight / 4) * i;
              ctx.beginPath();
              ctx.moveTo(padding.left, y);
              ctx.lineTo(padding.left + drawWidth, y);
              ctx.stroke();
            }

            // 纵向网格（每秒一条）
            const secPixelInterval = Math.ceil(this.sampleRate * this.xScale);
            const totalSec = Math.floor(this.totalSeconds);
            for (let i = 0; i <= totalSec; i++) {
              const x = padding.left + secPixelInterval * i;
              if (x > padding.left + drawWidth) break;
              ctx.setLineWidth(i % 5 === 0 ? 1.5 : 1);
              ctx.setStrokeStyle(i % 5 === 0 ? '#ddd' : '#eee');
              ctx.beginPath();
              ctx.moveTo(x, padding.top);
              ctx.lineTo(x, padding.top + drawHeight);
              ctx.stroke();
              if (i % 5 === 0) {
                ctx.setFillStyle('#999');
                ctx.setFontSize(12);
                ctx.fillText(`${i}s`, x + 5, padding.top + 15);
              }
            }

            // 基线
            ctx.setStrokeStyle('#ccc');
            ctx.setLineWidth(1);
            ctx.beginPath();
            ctx.moveTo(padding.left, baseLineY);
            ctx.lineTo(padding.left + drawWidth, baseLineY);
            ctx.stroke();

            // ECG 波形
            ctx.setStrokeStyle('#F63451');
            ctx.setLineWidth(1.5);
            ctx.beginPath();

            const amp = drawHeight * 0.4 * this.yScale;
            this.ecgWaveData.forEach((val, i) => {
              const safeVal = isNaN(val) || !isFinite(val) ? 0 : val;
              const x = padding.left + i * this.xScale;
              const y = baseLineY - safeVal * amp;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });

            ctx.stroke();
            ctx.draw(false, () => {
              // 绘制完成后，延迟100ms隐藏加载状态（让动画更自然）
              setTimeout(() => {
                this.isLoading = false;
              }, 100);
              console.log('[ECG] 波形绘制完成，动画开始');
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
  position: relative; /* 为加载状态定位 */
}
.canvas-wrapper {
  display: block;
  white-space: nowrap;
  box-sizing: border-box;
  padding: 0 !important;
  margin: 0 !important;
  min-width: 100%;
}
/* 新增：Canvas 渐显动画，过渡时长0.5秒 */
.wave-chart {
  display: block;
  vertical-align: top;
  background: #fafafa;
  transition: opacity 0.5s ease; 
}
/* 新增：加载状态样式，居中显示在Canvas容器内 */
.loading-tip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  z-index: 10; /* 确保在Canvas上方显示 */
}
.loading-tip text {
  font-size: 24rpx;
  color: #999;
}

/* 原有样式保持不变 */
.module-title { font-size: 32rpx; font-weight: bold; color: #333; }
.chart-title { font-size: 28rpx; color: #666; font-weight: 500; }
.duration-info { font-size: 24rpx; color: #999; margin-left: 10rpx; }
.wave-marker { margin-top: 10rpx; font-size: 24rpx; color: #999; line-height: 1.5; }
.marker-text { margin-right: 20rpx; font-size: 24rpx; }
.data-grid { display: flex; flex-wrap: wrap; gap: 20rpx; margin-top: 30rpx; }
.data-item { flex: 1; min-width: 120rpx; background: #f5f5f5; padding: 15rpx; border-radius: 8rpx; }
.data-label { font-size: 24rpx; color: #999; }
.data-value { font-size: 28rpx; color: #333; font-weight: bold; margin-top: 5rpx; display: block; }
.analysis-box { margin-top: 30rpx; background: #f9f9f9; padding: 20rpx; border-radius: 8rpx; }
.analysis-title { font-size: 28rpx; color: #333; font-weight: bold; }
.analysis-content { font-size: 24rpx; color: #666; margin-top: 10rpx; display: block; line-height: 1.6; }
.scroll-container::-webkit-scrollbar { height: 6px; background: #f1f1f1; border-radius: 3px; }
.scroll-container::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
.scroll-container::-webkit-scrollbar-thumb:hover { background: #ccc; }
</style>