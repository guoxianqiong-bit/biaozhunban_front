import {
	hideLoading,
	showLoading
} from "/utils/ui.js";
import {
	uploadFileToOss,
	uploadFileToOss_COPD,
	generateSign
} from "./ossUtil";
import {
	ossBuckets,
	monitorStartTime,
	monitorEndTime,
	upReportId,
	isExistNotUpSleepFile
} from "./constants";
import {
	request
} from "./httpUtils";
import {
	extractMfcc
} from "./mfccUtil";

const createCOPDReportURL = 'http://42.193.14.241:9999/dataSet/createCOPDReport';

export const createCOPDReport = function(startTimeTamp, endTimeTamp) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: createCOPDReportURL,
			method: 'GET',
			data: {
				startTimeTamp: startTimeTamp,
				endTimeTamp: endTimeTamp
			},
			header: {
				'Content-Type': 'application/json',
				'token': uni.getStorageSync('token') // 获取保存的token
			},
			success: (res) => {
				const reportId = res.data.data;
				uni.setStorage({
					key: upReportId,
					data: reportId
				})
				
				console.log('位置id',upReportId);
				resolve(reportId); // 成功后返回 reportId
				console.log('成功获取报告id',reportId);
			},
			fail: (err) => {
				console.log('Failed to create report:', err);
				reject(-2); // 失败后返回错误信息
			}
		});
	});
}

export const appendCOPDDataToFile = function (fileName, saveToFileDataArr) {
    const filePath = '_documents/' + fileName;
	
	// const filePath = (() => {
	//   if (typeof plus !== 'undefined') {
	//     const os = plus.os.name.toLowerCase();
	//     if (os.includes('ios')) {
	//       return '_documents/' + fileName;
	//     }
	//     return '_documents/' + fileName;
	//   }
	//   return '_documents/' + fileName;
	// })();
	console.log("最终路径:", filePath);

    // 把数组转换为字符串，每项占一行
    let writeData = saveToFileDataArr.map(item => item + '\n').join('');

    plus.io.resolveLocalFileSystemURL(filePath, function(entry) {
        // 文件已存在，打开以追加内容
        entry.createWriter(function(writer) {
            writer.seek(writer.length); // 移动到文件末尾
            writer.write(writeData);
            console.log('✅ 数据已追加到文件:', filePath);
        }, function(e) {
            console.error('❌ 写入文件失败：', e.message);
        });
    }, function(err) {
        // 文件不存在，先创建文件
        plus.io.resolveLocalFileSystemURL('_documents/', function(dirEntry) {
            dirEntry.getFile(fileName, { create: true }, function(fileEntry) {
                fileEntry.createWriter(function(writer) {
                    writer.write(writeData);
                    console.log(filePath);
                }, function(e) {
                    console.error('❌ 创建写入器失败：', e.message);
                });
            }, function(e) {
                console.error('❌ 获取文件失败：', e.message);
            });
        }, function(e) {
            console.error('❌ 获取目录失败：', e.message);
        });
    });
}
async function getOssSign(startTimeTamp) {
  return new Promise((resolve, reject) => {
    let obj = {
      method: "GET",
      showLoading: false,
      url: `/dataSet/generateSign`,
      data: {
        startTimeTamp: startTimeTamp
      },
    };
    request(obj)
      .then(res => {
        console.log('签名获取成功:', res);
        resolve(res.data); // 返回签名
      })
      .catch(err => {
        console.error('获取签名失败:', err);
        reject(err); // 抛出错误
      });
  });
}

// function checkFileExist(fileName) {
// 	  console.log('checkFileExist start');
// 	  console.log('wx:', typeof wx);
// 	  console.log('plus:', typeof plus);
//   return new Promise((resolve) => {
//     // 微信小程序环境
//     if (typeof wx !== 'undefined' && wx.getFileSystemManager) {
//       const fs = wx.getFileSystemManager();
//       const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
//       fs.access({
//         path: filePath,
//         success: () => resolve(true),
//         fail: () => resolve(false)
//       });
// 	  console.log("wx小程序")
//     } 
//     // App 环境
//     else if (typeof plus !== 'undefined') {
//       const filePath = '_documents/' + fileName;
//       plus.io.resolveLocalFileSystemURL(filePath, () => resolve(true), () => resolve(false));
// 	  console.log("APP")
//     } 
//     // H5 环境没有 _documents，可以用 localStorage/IndexedDB 代替
//     else {
// 		console.log("未查到")
//       resolve(false);
//     }
//   });
// }
function checkFileExist(fileName) {
  return new Promise((resolve) => {
	  
	  const filePath = '_documents/' + fileName;
	  
    // 1. 先判断 App 环境（plus），且增加 App 环境的合法性校验
    if (typeof plus !== 'undefined' && plus.io && plus.io.resolveLocalFileSystemURL) {
      // const filePath = '_documents/' + fileName;
      console.log("进入 App 环境（iOS），检测路径：", filePath); 
      plus.io.resolveLocalFileSystemURL(
        filePath,
        () => {
          console.log("App 环境：文件存在", filePath);
          resolve(true);
        },
        (err) => {
          console.log("App 环境：文件不存在/检测失败", { filePath, errMsg: err.message });
          resolve(false);
        }
      );
      return; // 进入 App 分支后，直接返回，避免后续判断
    }

    // 2. 再判断微信小程序环境（wx），增加微信环境的合法性校验
    else if (typeof wx !== 'undefined' && wx.getFileSystemManager && wx.env?.USER_DATA_PATH) {
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      console.log("进入微信小程序环境，检测路径：", filePath);
      fs.access({
        path: filePath,
        success: () => {
          console.log("微信小程序：文件存在", filePath);
          resolve(true);
        },
        fail: (err) => {
          console.log("微信小程序：文件不存在/检测失败", { filePath, errMsg: err.errMsg });
          resolve(false);
        }
      });
      return; // 进入微信分支后，直接返回
    }

    // 3. 未知环境（H5 等）
    else {
      console.log("未知环境（无 plus/wx 或对象不完整），默认返回 false");
      resolve(false);
    }
  });
}


/**
 * 从肺功能采样数据中提取最长正值呼气片段，并计算 FEV1、FVC 及相关指标
 * @param {Array<number>} samplingData - 原始采样数据（呼气流速数据数组）
 * @param {number} frequency - 采样频率（单位：Hz，即每秒采样次数）
 * @returns {Object} 计算结果对象，包含 FEV1、FVC、比值、是否异常等关键指标
 */
function calculateFEV1AndFVC(samplingData, frequency) {
    // -------------------------- 1. 内部辅助函数（与原代码逻辑完全一致）--------------------------
    /**
     * 线性插值（原代码 lerp 方法）
     * @param {number} t - 目标插值时间点
     * @param {number} t0 - 起始时间点
     * @param {number} t1 - 结束时间点
     * @param {number} y0 - 起始时间点对应的值
     * @param {number} y1 - 结束时间点对应的值
     * @returns {number} 插值结果
     */
    const lerp = (t, t0, t1, y0, y1) => {
        if (t1 === t0) return y0;
        const ratio = (t - t0) / (t1 - t0);
        return y0 + ratio * (y1 - y0);
    };

    /**
     * 梯形积分（原代码 integrateBetween 方法）- 计算 [a,b] 区间内的面积（单位转换：除以 60）
     * @param {Array<number>} times - 时间轴数组
     * @param {Array<number>} values - 对应时间点的流速值数组
     * @param {number} a - 积分起始时间
     * @param {number} b - 积分结束时间
     * @returns {number} 积分结果（面积，即体积，单位：L）
     */
    const integrateBetween = (times, values, a, b) => {
        if (b <= a) return 0;
        let area = 0;
        for (let i = 0; i < times.length - 1; i++) {
            const t0 = times[i];
            const t1 = times[i + 1];
            // 原代码逻辑：流速值除以 60（单位转换：L/s → L/min 相关？需保留与原计算一致）
            const y0 = values[i] / 60;
            const y1 = values[i + 1] / 60;

            // 跳过与 [a,b] 无交集的区间
            if (t1 <= a || t0 >= b) continue;
            const left = Math.max(t0, a);
            const right = Math.min(t1, b);
            if (right <= left) continue;

            // 插值计算区间边界的流速值
            const yl = left === t0 ? y0 : lerp(left, t0, t1, y0, y1);
            const yr = right === t1 ? y1 : lerp(right, t0, t1, y0, y1);

            // 梯形面积公式：(上底 + 下底) * 高 / 2
            area += (yl + yr) * 0.5 * (right - left);
        }
        return area;
    };

    /**
     * 找到最长的有效呼气片段（原代码 findLargestExhaleRange 方法）
     * 有效片段：流速>阈值（过滤噪声）、持续时间≥0.3秒、面积最大的连续区间
     * @param {Array<number>} times - 时间轴数组
     * @param {Array<number>} values - 处理后的流速值数组（负值已置0）
     * @param {number} eps - 噪声过滤阈值（流速>eps 才视为有效呼气）
     * @param {number} minDurSec - 最小有效持续时间（秒）
     * @returns {Object|null} 最长有效片段信息（a:起始时间, b:结束时间, area:面积, s:起始下标, e:结束下标），无有效片段则返回null
     */
    const findLargestExhaleRange = (times, values, eps, minDurSec = 0.3) => {
        let bestFragment = null; // 存储最优片段（面积最大）
        let startIndex = -1; // 当前片段的起始下标（初始为-1，标识无片段）
        const dataLength = values.length;

        for (let i = 0; i < dataLength; i++) {
            const currentValue = values[i];

            // 1. 检测片段起始：当前值>阈值且无正在处理的片段
            if (currentValue > eps && startIndex < 0) {
                startIndex = i;
            }

            // 2. 检测片段结束：到达数据末尾 或 当前值≤阈值
            const isEndOfData = i === dataLength - 1;
            const isOutOfThreshold = currentValue <= eps;
            if (startIndex >= 0 && (isOutOfThreshold || isEndOfData)) {
                // 确定片段的结束下标（处理数据末尾的特殊情况）
                const endIndex = isEndOfData && currentValue > eps ? i : i - 1;
                // 过滤持续时间不足的片段
                if (endIndex > startIndex) {
                    const fragmentStart = times[startIndex];
                    const fragmentEnd = times[endIndex];
                    const fragmentDuration = fragmentEnd - fragmentStart;
                    if (fragmentDuration >= minDurSec) {
                        // 计算当前片段的面积
                        const fragmentArea = integrateBetween(times, values, fragmentStart, fragmentEnd);
                        // 更新最优片段（面积更大则替换）
                        if (!bestFragment || fragmentArea > bestFragment.area) {
                            bestFragment = {
                                a: fragmentStart, // 片段起始时间
                                b: fragmentEnd,   // 片段结束时间
                                area: fragmentArea, // 片段面积
                                s: startIndex,   // 片段起始下标
                                e: endIndex      // 片段结束下标
                            };
                        }
                    }
                }
                startIndex = -1; // 重置，准备检测下一个片段
            }
        }
        return bestFragment;
    };

    // -------------------------- 2. 核心计算逻辑（与原代码 calculateMetricsAndChartData 对齐）--------------------------
    let fev1 = 0; // 第一秒用力呼气量（单位：L）
    let fvc = 0;  // 用力肺活量（单位：L）
    let maxFlowRate = 0; // 最大流速（单位：L/s）
    let totalTime = 0; // 总采样时长（单位：s）
    let longestFragment = null; // 最长有效呼气片段信息
    const processedValues = []; // 处理后的流速值（负值置0）
    const timeAxis = []; // 时间轴数组（每个采样点的对应时间）

    // 3. 输入合法性校验
    if (!Array.isArray(samplingData) || samplingData.length === 0) {
        return {
            fev1, fvc,
            fev1FvcRatio: 0.0, // FEV1/FVC 比值（百分比，保留1位小数）
            isAbnormal: false,    // 是否异常（比值<70%为异常）
            maxFlowRate, totalTime,
            longestFragment: null // 最长有效片段信息（无则为null）
        };
    }

    // 4. 预处理：负值置0 + 构建时间轴 + 计算最大流速
    const samplingInterval = 1 / frequency; // 采样间隔（单位：s，即1/采样频率）
    for (let i = 0; i < samplingData.length; i++) {
        const rawValue = Number(samplingData[i]);
        // 负值置0（原代码逻辑：Math.max(0, rawValue)）
        const processedValue = Number.isFinite(rawValue) ? Math.max(0, rawValue) : 0;
        processedValues.push(processedValue);
        // 构建时间轴：第i个采样点的时间 = i * 采样间隔
        timeAxis.push(i * samplingInterval);
        // 更新最大流速
        if (processedValue > maxFlowRate) {
            maxFlowRate = processedValue;
        }
    }
    // 总采样时长 = 最后一个采样点的时间
    totalTime = timeAxis[timeAxis.length - 1] || 0;

    // 5. 计算噪声过滤阈值（原代码逻辑：maxFlow*0.03 与 0.02 取较大值）
    const noiseThreshold = Math.max(maxFlowRate * 0.03, 0.02);

    // 6. 找到最长有效呼气片段
    longestFragment = findLargestExhaleRange(timeAxis, processedValues, noiseThreshold, 0.3);

    // 7. 计算 FEV1 和 FVC（仅当存在有效片段时）
    if (longestFragment) {
        const { a: fragmentStart, b: fragmentEnd } = longestFragment;
        // FVC：最长片段的总面积（整个片段的积分）
        fvc = integrateBetween(timeAxis, processedValues, fragmentStart, fragmentEnd);
        // FEV1：片段起始后1秒内的积分（若片段不足1秒，则取到片段末尾）
        const fev1EndTime = Math.min(fragmentStart + 1.0, fragmentEnd);
        fev1 = integrateBetween(timeAxis, processedValues, fragmentStart, fev1EndTime);
    }

    // 8. 计算衍生指标
    const fev1FvcRatio = fvc === 0 ? 0 : (fev1 / fvc) * 100; // 比值（百分比）
    const isAbnormal = fvc !== 0 && (fev1 / fvc) < 0.7; // 比值<70%视为异常（原代码逻辑）

    // -------------------------- 9. 返回最终计算结果 --------------------------
    return {
        fev1: Number(fev1.toFixed(2)), // FEV1（保留2位小数，与原代码显示一致）
        fvc: Number(fvc.toFixed(2)),   // FVC（保留2位小数，与原代码显示一致）
        fev1FvcRatio: Number(fev1FvcRatio.toFixed(1)), // 比值（百分比，保留1位小数）
        isAbnormal, // 是否异常（true=异常，false=正常）
        maxFlowRate: Number(maxFlowRate.toFixed(2)), // 最大流速（保留2位小数）
        totalTime: Number(totalTime.toFixed(2)),     // 总采样时长（保留2位小数）
        longestFragment: longestFragment ? { // 最长有效片段详情（便于后续扩展）
            startTime: longestFragment.a,    // 片段起始时间（s）
            endTime: longestFragment.b,      // 片段结束时间（s）
            duration: Number((longestFragment.b - longestFragment.a).toFixed(2)), // 片段持续时间（s）
            area: Number(longestFragment.area.toFixed(2)), // 片段面积（L）
            startIndex: longestFragment.s,   // 片段起始下标
            endIndex: longestFragment.e      // 片段结束下标
        } : null
    };
}

export const uploadCOPDData = function(copdSaveDto) {
  // 让函数返回一个Promise，以便调用者用await等待结果
  return new Promise((resolve, reject) => {
    let obj = {
      method: "POST",
      showLoading: false,
      url: `/copd/savaCOPDData`, // 注意：url可能有拼写错误（sava→save）
      data: {
		   // 新增患者基础信息 
	    name: copdSaveDto.name,
		sex: copdSaveDto.sex,
		age: copdSaveDto.age,
		height: copdSaveDto.height,
		weight: copdSaveDto.weight,
        "startTime": copdSaveDto.startTime,
        "endTime": copdSaveDto.endTime,
        "frequency": copdSaveDto.frequency,
        "flowRates": copdSaveDto.flowRates, 
        "bloodOxygen": copdSaveDto.bloodOxygen,
		"heartRate": copdSaveDto.heartRate, 
		"huxiRate": copdSaveDto.huxiRate,
		"fevVcRate": copdSaveDto.fevVcRate,
      }, 
    };
	
	console.log("📤 即将上传到后端的数据：", obj.data);


    request(obj)
      .then(res => {
        hideLoading(); // 确保hideLoading已定义
        // 提示可保留，但需注意不要与外层上传成功提示重复
        uni.showToast({
          title: '数据上传成功',
          icon: 'success',
          duration: 2000
        });
        const reportId = res.data;
        resolve(reportId); // 请求成功，通过resolve返回reportId
      })
      .catch(err => {
        console.error("上传数据失败:", err);  
        showToast("发生错误请稍后重试！", 1500); // 确保showToast已定义
        reject(err); // 请求失败，通过reject抛出错误
      });
  });
};

export const uploadCopdFilesToOss = async function(startTimeTamp, endTimeTamp) {
  let flowBucket = ossBuckets.flow;
  let flowFileName = 'flow_' + startTimeTamp + '.txt';
  let ecgBucket = ossBuckets.ecg;
  let ecgFileName = 'ecg_' + startTimeTamp + '.txt';
  let respBucket = ossBuckets.resp;
  let respFileName = 'resp_' + startTimeTamp + '.txt';
  let oxygenBucket = ossBuckets.oxygen;
  let rFileName = 'r_' + startTimeTamp + '.txt'; 
  let irFileName = 'ir_' + startTimeTamp + '.txt';
  let timestamp = new Date().getTime();
  let ossInfo;
  let reportId; // 声明变量（作用域提升）
  let contentArray = [];

  try {
    console.log('正在获取签名...');
    ossInfo = await getOssSign(timestamp);
  } catch (err) {
    uni.showToast({ title: '获取签名失败', icon: 'none' });
    return false;
  }

// 读取 flow 文件内容（原有逻辑不变）
  if (await checkFileExist(flowFileName)) {
	  console.log('checkFileExist start');
	  console.log(uni.getSystemInfoSync().platform);
	  console.log('wx:', typeof wx);
	  console.log('plus:', typeof plus);
    if (typeof plus !== 'undefined') {
    	console.log('读取移动端设备成功');
      const filePath = '_documents/' + flowFileName;
      contentArray = await new Promise((resolve) => {
        plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
          entry.file((file) => {
            const fileReader = new plus.io.FileReader();
            fileReader.onloadend = function(e) {
              const content = e.target.result;
              const arr = content.split('\n').map(line => line.trim()).filter(line => line);
              resolve(arr);
            };
            fileReader.readAsText(file, 'utf-8');
          });
        }, () => { resolve([]); });
      });
    } else if (typeof wx !== 'undefined' && wx.getFileSystemManager) {
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${flowFileName}`;
      const fileContent = fs.readFileSync(filePath, 'utf8');
      contentArray = fileContent.split('\n').map(line => line.trim()).filter(line => line);
    }
  }


  // 读取血氧缓存（核心修改：将后续逻辑移入 succ ess 回调内）
  let oxygenValue = 97;
  console.log("获取缓存")
  uni.getStorage({
    key: "oxygenValue",
    success: async (res) => { // 注意添加 async 关键字
      oxygenValue = res.data / 100;
      console.log("从缓存读取到的血氧值：", oxygenValue);
      let cachedHeartRate = uni.getStorageSync("heartRate");
	  if(!uni.getStorageSync("heartRate")){
		  cachedHeartRate=75; 
	  }
	  console.log("从缓存读取到的心跳值：", cachedHeartRate);
	  uni.removeStorageSync("heartRate");
	  let cachedRespRate = uni.getStorageSync("respRate");
	  if(!uni.getStorageSync("respRate")){
	  		  cachedRespRate=16; 
	  }
	  console.log("从缓存读取到的呼吸值：", cachedRespRate);
	  uni.removeStorageSync("respRate");
	  const fevVcRate = calculateFEV1AndFVC(contentArray, 100).fev1FvcRatio; 
	  console.log("计算的FEV1/FEVC：", fevVcRate);
      // 读取前端保存的用户信息
      const savedUser = uni.getStorageSync('currentUser') || {};
      
      const postData = {
          startTime: startTimeTamp,
          endTime: endTimeTamp,
          frequency: 100,
          bloodOxygen: oxygenValue,
          flowRates: contentArray,
          heartRate: cachedHeartRate,
          huxiRate: cachedRespRate,
          fevVcRate: fevVcRate,
      
          // 传给后端
          name: savedUser.name || "",
          sex: savedUser.sex || "",
          age: savedUser.age || "",
          height: savedUser.height || "",
          weight: savedUser.weight || "",
      };

 
      // 1. 获取 reportId（await 等待结果）
      try {
        reportId = await uploadCOPDData(postData); // 用 await 替代 .then()
        console.log("拿到的 reportId:", reportId);
        uni.setStorageSync('currentReportId', reportId);
		const currentReportId = uni.getStorageSync('currentReportId');
		if (currentReportId) {
		  console.log("从缓存读取到 currentReportId:", currentReportId);
		}
        // 2. 所有文件上传逻辑移到这里（确保 reportId 已获取） 
        const uploadTasks = [];
        if (await checkFileExist(flowFileName)) {
          uploadTasks.push(uploadFileToOss_COPD(ossInfo, flowBucket, flowFileName, reportId));
        }
        if (await checkFileExist(ecgFileName)) {
          uploadTasks.push(uploadFileToOss_COPD(ossInfo, ecgBucket, ecgFileName, reportId));
        }
        if (await checkFileExist(respFileName)) {
          uploadTasks.push(uploadFileToOss_COPD(ossInfo, respBucket, respFileName, reportId));
        }
        if (await checkFileExist(rFileName)) {
          uploadTasks.push(uploadFileToOss_COPD(ossInfo, oxygenBucket, rFileName, reportId));
        }
        if (await checkFileExist(irFileName)) {
          uploadTasks.push(uploadFileToOss_COPD(ossInfo, oxygenBucket, irFileName, reportId));
        }

        if (uploadTasks.length === 0) {
          uni.showToast({ title: '没有可上传的文件', icon: 'none' });
          return false;
        }

        await Promise.all(uploadTasks);
        uni.showToast({ title: '数据上传成功', icon: 'success', duration: 2000 });
        deleteCOPDStorageAndFiles();

      } catch (err) {
        console.error('上传文件失败:', err);
        uni.showToast({ title: '文件上传失败，请检查网络', icon: 'none', duration: 3000 });
      }
    },
    fail: () => {
      console.log("缓存中未找到血氧值");
    }
  });

  return true; // 保持原有返回逻辑
}
 
export const deleteFile = function(fileName) {
	// const filePath = '_documents/' + fileName;
	
	
	const filePath ='_documents/' + fileName;
	console.log("最终路径:", filePath);
	

	plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
		entry.remove(() => {
			// 提示用户删除成功
			plus.nativeUI.toast('慢阻肺检测数据文件已删除', {
				icon: 'success',
				duration: 2000
			});
		}, (err) => {
			console.error('文件删除失败', err);
			// 提示用户删除失败
			plus.nativeUI.toast('文件删除失败', { 
				icon: 'none', 
				duration: 2000
			});
		});
	}, (err) => {
		console.error('无法找到文件', err);
		// 提示用户文件不存在
		// plus.nativeUI.toast('无法找到文件', {
		// 	icon: 'none',
		// 	duration: 2000
		// });
	});
};
export const deleteCOPDFiles = function(startTimeTamp) {
	deleteFile('flow_' + startTimeTamp + '.txt')
	deleteFile('ecg_' + startTimeTamp + '.txt');
	deleteFile('resp_' + startTimeTamp + '.txt');
	deleteFile('r_' + startTimeTamp + '.txt'); 
	deleteFile('ir_' + startTimeTamp + '.txt')
}
export const deleteCOPDStorageAndFiles = function() {

	let startTimeTamp = uni.getStorageSync(monitorStartTime)

	// 删除文件
	deleteCOPDFiles(startTimeTamp)

	// 清理缓存
	const removekeys = [monitorStartTime, monitorEndTime,
		ossBuckets.flow, ossBuckets.ecg, ossBuckets.resp,
		upReportId
	];
	removekeys.forEach(key => {
		uni.removeStorage({
			key: key,
			success: function() {
				console.log(`${key} 删除成功`);
			},
			fail: function(err) {
				console.error(`${key} 删除失败`, err);
			}
		});
	});

}