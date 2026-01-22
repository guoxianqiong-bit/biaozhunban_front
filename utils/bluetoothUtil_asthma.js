import { hideLoading, showLoading, showToast } from "@/utils/ui.js";
import { uploadFileToOss_COPD, generateSign } from "./ossUtil"; // 复用 COPD 的 OSS 上传逻辑
import { ossBuckets, monitorStartTime, monitorEndTime } from "./constants";
import { request } from "./httpUtils";

// 1. 检查文件是否存在的通用方法
function checkFileExist(fileName) {
  return new Promise((resolve) => {
    const filePath = '_documents/' + fileName;
    if (typeof plus !== 'undefined') {
       plus.io.resolveLocalFileSystemURL(filePath, () => resolve(true), () => resolve(false));
    } else {
       resolve(false); // H5等环境暂不支持
    }
  });
}


export const appendAsthmaDataToFile = function (fileName, saveToFileDataArr) {
    const filePath = '_documents/' + fileName;
	console.log("最终路径:", filePath);
    console.log("最终路径:", saveToFileDataArr);
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
// 3. 上传哮喘数据到后端接口 (核心修改)
export const uploadAsthmaData = function(asthmaSaveDto) {
  return new Promise((resolve, reject) => {
    let obj = {
      method: "POST",
      showLoading: false,
      url: `/asthma/saveAsthmaData`, // 【注意】这里对应后端的 Controller 路径
      data: {
        // 与后端 AsthmaSaveDto 字段对应
        name: asthmaSaveDto.name,
        sex: asthmaSaveDto.sex,
        age: asthmaSaveDto.age,
        height: asthmaSaveDto.height,
        weight: asthmaSaveDto.weight,
        startTime: asthmaSaveDto.startTime,
        endTime: asthmaSaveDto.endTime,
        frequency: 100,
        flowRates: asthmaSaveDto.flowRates, 
        bloodOxygen: asthmaSaveDto.bloodOxygen,
        // ... 其他需要上传的字段
      }, 
    };
    
    request(obj).then(res => {
        hideLoading();
        uni.showToast({ title: '数据上传成功', icon: 'success' });
        resolve(res.data); // 返回 reportId
    }).catch(err => {
        reject(err);
    });
  });
};

// 4. 上传文件到 OSS 并清理 (核心流程)
export const uploadAsthmaFilesToOss = async function(startTimeTamp, endTimeTamp) {
  let flowBucket = ossBuckets.flow; // 假设复用 bucket
  // 文件名加前缀区分
  let flowFileName = 'asthma_flow_' + startTimeTamp + '.txt'; 
  
  let timestamp = new Date().getTime();
  let ossInfo;
  let reportId;
  let contentArray = [];

  try {
    ossInfo = await new Promise((resolve,reject) =>{
        let obj = { url: `/dataSet/generateSign`, method:"GET", data:{ startTimeTamp: timestamp }};
        request(obj).then(res=>resolve(res.data)).catch(err=>reject(err));
    });
  } catch (err) {
    return false;
  }

  // 读取本地文件内容
  if (await checkFileExist(flowFileName)) {
      // ... 读取逻辑同 COPD，此处省略部分代码，重点是文件名对应 ...
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
  }

  // 从缓存读取血氧等信息
  let oxygenValue = uni.getStorageSync("oxygenValue") ? (uni.getStorageSync("oxygenValue")/100) : 0.97;
  const savedUser = uni.getStorageSync('currentUser') || {};

  const postData = {
      startTime: startTimeTamp,
      endTime: endTimeTamp,
      bloodOxygen: oxygenValue,
      flowRates: contentArray,
      name: savedUser.name,
      sex: savedUser.sex,
      age: savedUser.age,
      height: savedUser.height,
      weight: savedUser.weight,
  };

  try {
    // 1. 上传数据到数据库
    reportId = await uploadAsthmaData(postData);
    
    // 2. 上传原始文件到 OSS
    const uploadTasks = [];
    if (await checkFileExist(flowFileName)) {
      uploadTasks.push(uploadFileToOss_COPD(ossInfo, flowBucket, flowFileName, reportId));
    }
    
    if (uploadTasks.length > 0) {
        await Promise.all(uploadTasks);
    }
    
    // 3. 删除本地文件和缓存
    deleteAsthmaFiles(startTimeTamp);
    return true;

  } catch (err) {
    console.error('上传失败', err);
    return false;
  }
}

// 5. 删除文件方法
export const deleteAsthmaFiles = function(startTimeTamp) {
    const fileName = 'asthma_flow_' + startTimeTamp + '.txt';
    const filePath = '_documents/' + fileName;
    plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
        entry.remove();
    });
}