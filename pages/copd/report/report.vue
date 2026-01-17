<template>
  <view class="main">
    <!-- 报告头部：标题+基础信息 -->
    <view class="report-header">
      <text class="report-title">慢阻肺（COPD）监测报告</text>
      <view class="report-base-info">
        <text class="info-item">监测日期：{{ reportDate }}</text>
        <text class="info-item">患者姓名：{{ patientName }}</text>
        <text class="info-item">报告编号：{{ reportNo }}</text>
      </view>
    </view>

    <!-- 1. 血氧（SpO₂）模块 -->
    <view class="report-module">
      <text class="module-title">1. 血氧（SpO₂）监测</text>
      <!-- 血氧状态卡片 -->
      <view class="spo2-card">
        <view class="spo2-value-area">
          <text class="spo2-value" :class="spo2StatusClass">{{ currentSpO2 }}%</text>
          <text class="spo2-label">血氧浓度</text>
        </view>
        <text class="spo2-status" :class="spo2StatusClass">{{ spo2StatusText }}</text>
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
              <text class="range-value"><90%</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 血氧分析 -->
      <view class="analysis-box">
        <text class="analysis-title">分析：</text>
        <text class="analysis-content">患者血氧浓度{{ currentSpO2 }}%，处于正常范围。提示：慢阻肺患者常因通气功能障碍会导致血氧饱和度下降，低于95%，建议活动后再次监测，若持续低于90%需考虑氧疗。</text>
      </view>
    </view>

    <!-- 2. 心电图（ECG）模块 -->
    <view class="report-module">
      <text class="module-title">2. 心电图（ECG）监测</text>
      <view class="chart-container waveform-chart">
        <text class="chart-title">心电波形（5秒片段）</text>
        <canvas 
          canvas-id="ecgCanvas" 
          class="wave-chart"
          :width="waveChartWidth"
          :height="waveChartHeight"
        ></canvas>
        <view class="wave-marker">
          <text class="marker-text">10mm/mV</text>
          <text class="marker-text">25mm/s</text>
        </view>
      </view>
      <!-- 关键数据 -->
      <view class="data-grid">
        <view class="data-item">
          <text class="data-label">心率</text>
          <text class="data-value">{{ ecgHr }}次/分</text>
        </view>
        <view class="data-item">
          <text class="data-label">PR间期</text>
          <text class="data-value">{{ prInterval }}ms</text>
        </view>
        <view class="data-item">
          <text class="data-label">QRS时限</text>
          <text class="data-value">{{ qrsDuration }}ms</text>
        </view>
        <view class="data-item">
          <text class="data-label">QT间期</text>
          <text class="data-value">{{ qtInterval }}ms</text>
        </view>
      </view>
      <!-- 心电图分析 -->
      <view class="analysis-box">
        <text class="analysis-title">分析：</text>
        <text class="analysis-content">窦性心律，心率{{ ecgHr }}次/分，节律存在生理性变异。各波群形态、时限正常，未发现心肌缺血及心律失常表现，提示心脏电活动目前无明显异常。</text>
      </view>
    </view>

    <!-- 3. 呼吸（RESP）模块 -->
    <view class="report-module">
      <text class="module-title">3. 呼吸（RESP）监测</text>
      <view class="chart-container waveform-chart">
        <text class="chart-title">呼吸波形（30秒片段）</text>
        <canvas 
          canvas-id="respCanvas" 
          class="wave-chart"
          :width="waveChartWidth"
          :height="waveChartHeight"
        ></canvas>
        <view class="wave-marker">
          <text class="marker-text">呼吸频率：{{ respRate }}次/分</text>
        </view>
      </view>
      <!-- 关键数据 -->
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
      <!-- 呼吸分析 -->
      <view class="analysis-box">
        <text class="analysis-title">分析：</text>
        <text class="analysis-content">呼吸频率{{ respRate }}次/分，高于正常静息范围（12-20次/分），提示存在呼吸代偿。监测到{{ respApnea }}次短暂呼吸暂停，可能与气道阻塞相关，需结合临床评估。</text>
      </view>
    </view>

    <!-- 4. 肺功能（FEV₁/FVC）模块 - 完全显示优化 -->
    <view class="report-module lung-module">
      <text class="module-title">4. 肺功能（FEV₁/FVC）检测</text>
      <!-- 流量-时间曲线（核心优化：缩小高度+精准边距） -->
      <view class="chart-container lung-chart-container">
        <text class="chart-title">流量-时间曲线 (L/s)</text>
        <canvas 
          canvas-id="lungCanvas" 
          class="lung-chart"
          :width="lungChartWidth"
          :height="lungChartHeight"
        ></canvas>
      </view>
      <!-- 肺功能数据卡片 -->
      <view class="lung-data">
        <view class="lung-item">
          <text class="lung-label">FEV₁（第一秒用力呼气量）</text>
          <text class="lung-value">{{ fev1 }} L</text>
        </view>
        <view class="lung-item">
          <text class="lung-label">FVC（用力肺活量）</text>
          <text class="lung-value">{{ fvc }} L</text>
        </view>
        <view class="lung-item">
          <text class="lung-label">FEV₁/FVC 比值</text>
          <text class="lung-value">{{ fev1FvcRatio }}%</text>
          <text class="lung-reference">≥ {{ fev1FvcRef }}%</text>
        </view>
        <view class="lung-item diagnosis">
          <text class="lung-label">诊断结果</text>
          <text class="lung-diagnosis">{{ lungDiagnosis }}</text>
        </view>
      </view>
      <!-- 肺功能分析 -->
      <view class="analysis-box">
        <text class="analysis-title">分析：</text>
        <text class="analysis-content">FEV₁/FVC比值为{{ fev1FvcRatio }}%，大于参考值{{ fev1FvcRef }}%，气流受限不明显。流量曲线呈现快速上升至峰值后缓慢下降特征，符合正常用力呼气模式。</text>
      </view>
    </view>

    <!-- 5. 综合诊断与建议 -->
    <view class="report-module diagnosis-module">
      <text class="module-title">5. 综合诊断与建议</text>
      <view class="diagnosis-content">
        <text class="diagnosis-item">● 诊断：结合各项监测结果，符合<strong>慢性阻塞性肺疾病（COPD）{{ copdSeverity }}</strong>诊断</text>
        <text class="diagnosis-item">● 风险提示：血氧水平偏低，呼吸频率偏快，存在呼吸负荷增加</text>
        <text class="diagnosis-title">建议：</text>
        <text class="diagnosis-item">1. 遵医嘱规律使用支气管舒张剂，必要时启动家庭氧疗</text>
        <text class="diagnosis-item">2. 严格戒烟，避免接触刺激性气体；坚持呼吸功能锻炼</text>
        <text class="diagnosis-item">3. 定期复查肺功能及血氧，症状加重及时就医</text>
      </view>
      <!-- 医生信息 -->
      <view class="doctor-info">
        <text class="doctor-name">诊断医生：{{ doctorName }}</text>
        <text class="diagnose-date">诊断日期：{{ reportDate }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 报告基础信息
      reportDate: "2025-08-04",
      patientName: "邓海敏",
      reportNo: "COPD-20250804-001",
      doctorName: "李医生（呼吸科主治医师）",
      
      // 图表尺寸（最终优化：缩小肺功能画布高度）
      waveChartWidth: 0,
      waveChartHeight: 180,
      lungChartWidth: 0,
      lungChartHeight: 180, // 从200rpx 降至180rpx，彻底解决遮挡
      
      // 1. 血氧（SpO₂）数据
      currentSpO2: 95.03,
      
      // 2. 心电图（ECG）数据
      ecgHr: 72,
      prInterval: 160,
      qrsDuration: 90,
      qtInterval: 380,
      ecgWaveData: [],
      
      // 3. 呼吸（RESP）数据
      respRate: 21,
      respApnea: 2,
      respApneaMax: 3,
      respWaveData: [],
      
      // 4. 肺功能数据
      fev1: 2.84,
      fvc: 3.72,
      fev1FvcRatio: 76.3,
      fev1FvcRef: 70.0,
      lungDiagnosis: "正常",
      copdSeverity: "轻度",
      lungFlowData: []
    };
  },
  computed: {
    // 血氧状态逻辑
    spo2StatusClass() {
      if (this.currentSpO2 >= 95) return "status-normal";
      if (this.currentSpO2 >= 90 && this.currentSpO2 < 95) return "status-low";
      return "status-too-low";
    },
    spo2StatusText() {
      if (this.currentSpO2 >= 95) return "本次测量血氧水平正常";
      if (this.currentSpO2 >= 90 && this.currentSpO2 < 95) return "本次测量血氧水平偏低";
      return "本次测量血氧水平过低，需警惕";
    }
  },
  onLoad() {
    // 获取屏幕宽度，确保左右无溢出
    const { windowWidth } = uni.getSystemInfoSync();
    this.waveChartWidth = windowWidth - 60;
    this.lungChartWidth = windowWidth - 60;
    
    // 生成波形数据
    this.generateEcgWaveform();
    this.generateRespWaveform();
    this.generateLungFlowWaveform();
  },
  onReady() {
    // 绘制图表
    this.drawEcgWaveform();
    this.drawRespWaveform();
    this.drawLungFlowChart();
  },
  methods: {
    // 生成带噪声的心电波形
    generateEcgWaveform() {
      const sampleRate = 250;
      const duration = 5;
      const points = sampleRate * duration;
      const heartRate = this.ecgHr;
      const cycle = 60 / heartRate;
      const samplesPerBeat = sampleRate * cycle;
      
      this.ecgWaveData = [];
      
      for (let i = 0; i < points; i++) {
        const beatPhase = (i % samplesPerBeat) / samplesPerBeat;
        let value = 0;
        
        // P波：随机变化
        const pStart = 0.05 + (Math.random() - 0.5) * 0.02;
        const pEnd = 0.15 + (Math.random() - 0.5) * 0.02;
        const pAmp = 0.2 + (Math.random() - 0.5) * 0.05;
        if (beatPhase >= pStart && beatPhase < pEnd) {
          const pPhase = (beatPhase - pStart) / (pEnd - pStart);
          value += Math.sin(pPhase * Math.PI) * pAmp;
        }
        
        // QRS波群：随机变化
        const qrsStart = 0.2 + (Math.random() - 0.5) * 0.02;
        const qrsEnd = 0.3 + (Math.random() - 0.5) * 0.02;
        const qAmp = -0.5 + (Math.random() - 0.5) * 0.1;
        const rAmp = 1.2 + (Math.random() - 0.5) * 0.2;
        const sAmp = -0.3 + (Math.random() - 0.5) * 0.05;
        if (beatPhase >= qrsStart && beatPhase < qrsEnd) {
          const qrsPhase = (beatPhase - qrsStart) / (qrsEnd - qrsStart);
          if (qrsPhase < 0.2) {
            value += qAmp * (1 - Math.cos(qrsPhase * 5 * Math.PI));
          } else if (qrsPhase < 0.5) {
            value += rAmp * (1 - Math.cos((qrsPhase - 0.2) * 6.67 * Math.PI));
          } else {
            value += sAmp * (1 - Math.cos((qrsPhase - 0.5) * 5 * Math.PI));
          }
        }
        
        // T波：随机变化
        const tStart = 0.4 + (Math.random() - 0.5) * 0.02;
        const tEnd = 0.6 + (Math.random() - 0.5) * 0.02;
        const tAmp = 0.4 + (Math.random() - 0.5) * 0.1;
        if (beatPhase >= tStart && beatPhase < tEnd) {
          const tPhase = (beatPhase - tStart) / (tEnd - tStart);
          value += tAmp * Math.sin(tPhase * Math.PI) * Math.exp(-2 * (tPhase - 0.5));
        }
        
        // 基线漂移和噪声
        value += Math.sin(i * 0.02 + Math.random() * 0.1) * 0.03;
        value += (Math.random() - 0.5) * 0.03;
        
        this.ecgWaveData.push(value);
      }
    },
    
    // 生成呼吸波形
    generateRespWaveform() {
      const sampleRate = 50;
      const duration = 30;
      const points = sampleRate * duration;
      const respRate = this.respRate;
      const cycle = 60 / respRate;
      const samplesPerCycle = sampleRate * cycle;
      
      this.respWaveData = [];
      
      for (let i = 0; i < points; i++) {
        const phase = (i % samplesPerCycle) / samplesPerCycle;
        let value;
        
        // 呼吸波形：吸气陡、呼气缓
        const inhaleDur = 0.4 + (Math.random() - 0.5) * 0.1;
        const exhaleDur = 1 - inhaleDur;
        if (phase < inhaleDur) {
          value = 0.5 * (1 - Math.cos(phase / inhaleDur * Math.PI));
        } else {
          value = 0.5 * (1 + Math.cos((phase - inhaleDur) / exhaleDur * Math.PI));
        }
        
        // 呼吸深度变化
        const depth = 0.9 + Math.sin(i * 0.005) * 0.1 + (Math.random() - 0.5) * 0.05;
        value = value * depth;
        
        // 模拟呼吸暂停
        if ((i > points * 0.3 && i < points * 0.35) || (i > points * 0.7 && i < points * 0.73)) {
          value = (Math.random() - 0.5) * 0.05;
        }
        
        this.respWaveData.push(value);
      }
    },
    
    // 生成肺功能流量曲线
    generateLungFlowWaveform() {
      const sampleRate = 50;
      const duration = 6;
      const points = sampleRate * duration;
      this.lungFlowData = [];
      
      const maxFlow = 6.2; // 最大流量
      
      for (let i = 0; i < points; i++) {
        const time = i / sampleRate;
        let flow = 0;
        
        if (time > 0.1) {
          if (time <= 0.5) {
            // 上升期
            const risePhase = (time - 0.1) / 0.4;
            flow = maxFlow * Math.sin(risePhase * Math.PI/2);
          } else if (time <= 1.0) {
            // 快速下降期（FEV1）
            const fallPhase1 = (time - 0.5) / 0.5;
            flow = maxFlow * (1 - 0.3 * fallPhase1);
          } else {
            // 缓慢下降期
            const fallPhase2 = (time - 1.0) / 5.0;
            flow = maxFlow * 0.7 * Math.exp(-fallPhase2 * 2);
          }
          
          // 添加测量噪声
          flow += (Math.random() - 0.5) * 0.2;
        }
        
        this.lungFlowData.push(flow);
      }
    },
    
    // 绘制心电波形
    drawEcgWaveform() {
      const ctx = uni.createCanvasContext('ecgCanvas', this);
      const padding = { top: 10, right: 10, bottom: 10, left: 10 };
      const drawWidth = this.waveChartWidth - padding.left - padding.right;
      const drawHeight = this.waveChartHeight - padding.top - padding.bottom;
      const centerY = padding.top + drawHeight / 2;
      
      // 背景和网格
      ctx.setFillStyle('#f9f9f9');
      ctx.fillRect(0, 0, this.waveChartWidth, this.waveChartHeight);
      ctx.setStrokeStyle('#eee');
      ctx.setLineWidth(1);
      
      // 横向网格
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (drawHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + drawWidth, y);
        ctx.stroke();
      }
      
      // 纵向网格
      for (let i = 0; i <= 5; i++) {
        const x = padding.left + (drawWidth / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + drawHeight);
        ctx.stroke();
      }
      
      // 基线和波形
      ctx.setStrokeStyle('#ccc');
      ctx.beginPath();
      ctx.moveTo(padding.left, centerY);
      ctx.lineTo(padding.left + drawWidth, centerY);
      ctx.stroke();
      
      ctx.setStrokeStyle('#F63451');
      ctx.setLineWidth(1.5);
      ctx.beginPath();
      
      this.ecgWaveData.forEach((value, index) => {
        const x = padding.left + (drawWidth / (this.ecgWaveData.length - 1)) * index;
        const maxAmplitude = drawHeight * 0.4;
        const y = centerY - value * maxAmplitude;
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();
      ctx.draw();
    },
    
    // 绘制呼吸波形
    drawRespWaveform() {
      const ctx = uni.createCanvasContext('respCanvas', this);
      const padding = { top: 10, right: 10, bottom: 10, left: 10 };
      const drawWidth = this.waveChartWidth - padding.left - padding.right;
      const drawHeight = this.waveChartHeight - padding.top - padding.bottom;
      const centerY = padding.top + drawHeight / 2;
      
      // 背景和网格
      ctx.setFillStyle('#f9f9f9');
      ctx.fillRect(0, 0, this.waveChartWidth, this.waveChartHeight);
      ctx.setStrokeStyle('#eee');
      ctx.setLineWidth(1);
      
      // 横向/纵向网格
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (drawHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + drawWidth, y);
        ctx.stroke();
      }
      
      for (let i = 0; i <= 5; i++) {
        const x = padding.left + (drawWidth / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + drawHeight);
        ctx.stroke();
      }
      
      // 基线和波形
      ctx.setStrokeStyle('#ccc');
      ctx.beginPath();
      ctx.moveTo(padding.left, centerY);
      ctx.lineTo(padding.left + drawWidth, centerY);
      ctx.stroke();
      
      ctx.setStrokeStyle('#4CD964');
      ctx.setLineWidth(1.5);
      ctx.beginPath();
      
      this.respWaveData.forEach((value, index) => {
        const x = padding.left + (drawWidth / (this.respWaveData.length - 1)) * index;
        const maxAmplitude = drawHeight * 0.4;
        const y = centerY - value * maxAmplitude;
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();
      ctx.draw();
    },
    
    /**
     * 绘制完全显示的肺功能曲线
     * 最终优化：高度180rpx + 精准边距计算
     */
    drawLungFlowChart() {
      const ctx = uni.createCanvasContext('lungCanvas', this);
      // 最小化内边距，确保内容完整
      const padding = { top: 20, right: 10, bottom: 25, left: 35 };
      const drawWidth = this.lungChartWidth - padding.left - padding.right;
      const drawHeight = this.lungChartHeight - padding.top - padding.bottom;
      
      // 1. 绘制白色背景
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, this.lungChartWidth, this.lungChartHeight);
      
      // 2. 绘制网格线
      ctx.setStrokeStyle('#eee');
      ctx.setLineWidth(1);
      
      // 横向网格（4条，更紧凑）
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (drawHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + drawWidth, y);
        ctx.stroke();
        
        // 流量值标签（缩小字体+右对齐）
        const flowValue = (4 - i) * 1.8; // 调整范围至0-7.2 L/s
        ctx.setFillStyle('#999');
        ctx.setFontSize(14);
        ctx.fillText(flowValue.toFixed(1), padding.left - 22, y + 3);
      }
      
      // 纵向网格（6条，每1秒）
      for (let i = 0; i <= 6; i++) {
        const x = padding.left + (drawWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + drawHeight);
        ctx.stroke();
        
        // 时间标签（缩小字体）
        ctx.setFillStyle('#999');
        ctx.setFontSize(14);
        ctx.fillText(i, x - 3, padding.top + drawHeight + 15);
      }
      
      // 3. 绘制坐标轴
      ctx.setStrokeStyle('#333');
      ctx.setLineWidth(1.5);
      
      // Y轴（流量）
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, padding.top + drawHeight);
      ctx.stroke();
      
      // X轴（时间）
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + drawHeight);
      ctx.lineTo(padding.left + drawWidth, padding.top + drawHeight);
      ctx.stroke();
      
      // 坐标轴标题（进一步缩小）
      ctx.setFillStyle('#666');
      ctx.setFontSize(14);
      ctx.fillText('流量(L/s)', padding.left - 30, padding.top - 3);
      ctx.fillText('时间(秒)', padding.left + drawWidth - 35, padding.top + drawHeight + 25);
      
      // 4. 绘制流量曲线（严格边界限制）
      ctx.setStrokeStyle('#4285F4');
      ctx.setLineWidth(2.5);
      ctx.beginPath();
      
      this.lungFlowData.forEach((flow, index) => {
        const time = index / 50;
        // 确保x/y完全在画布内
        const x = Math.min(
          padding.left + (drawWidth / 6) * time,
          padding.left + drawWidth - 1
        );
        const yRaw = padding.top + drawHeight - (flow / 7.2) * drawHeight; // 匹配0-7.2范围
        const y = Math.max(padding.top + 1, Math.min(yRaw, padding.top + drawHeight - 1));
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // 5. 填充FEV1区域
      ctx.setFillStyle('rgba(244, 180, 0, 0.2)');
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + drawHeight);
      
      this.lungFlowData.forEach((flow, index) => {
        const time = index / 50;
        if (time <= 1.0) {
          const x = padding.left + (drawWidth / 6) * time;
          const y = padding.top + drawHeight - (flow / 7.2) * drawHeight;
          ctx.lineTo(x, y);
        }
      });
      
      ctx.lineTo(padding.left + drawWidth / 6 * 1.0, padding.top + drawHeight);
      ctx.fill();
      
      // 6. 标记FEV1线
      ctx.setStrokeStyle('#F4B400');
      ctx.setLineWidth(1.5);
      ctx.setLineDash([5, 3], 0);
      ctx.beginPath();
      const fev1X = padding.left + drawWidth / 6 * 1.0;
      ctx.moveTo(fev1X, padding.top);
      ctx.lineTo(fev1X, padding.top + drawHeight);
      ctx.stroke();
      ctx.setLineDash([], 0);
      
      // FEV1文本（最小化占用）
      ctx.setFillStyle('#F4B400');
      ctx.setFontSize(14);
      ctx.fillText('FEV₁', fev1X + 2, padding.top + 15);
      
      ctx.draw();
    }
  }
};
</script>

<style scoped>
/* 基础样式 */
	@import "report.css"
</style>