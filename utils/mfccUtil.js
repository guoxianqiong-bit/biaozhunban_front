import Meyda from 'meyda';

export const extractMfcc = function(audioData) {
      // 填充 audioData 使其长度为 512 的倍数
      const bufferSize = 512;
      const paddedLength = Math.ceil(audioData.length / bufferSize) * bufferSize;
      const paddedAudioData = new Float32Array(paddedLength);
      paddedAudioData.set(audioData); // 填充原始音频数据
      // 提取 MFCC 特征
      const mfccs = Meyda.extract('mfcc', paddedAudioData, {
        sampleRate: 8000, // 设置采样率为 10200 Hz
        bufferSize: bufferSize, // 设置缓冲区大小为 512
        numberOfMFCCCoefficients: 13, // 提取 13 个 MFCC 系数
      });	  
      return mfccs;
}