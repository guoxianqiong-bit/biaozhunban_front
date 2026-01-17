import {
	hideLoading,
	showLoading
} from "/utils/ui.js";
import {
	uploadFileToOss,
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

const createReportURL = 'http://42.193.14.241:9998/dataSet/createReport';

const isStorageKeyExistsSync = function(key) {
	try {
		const res = uni.getStorageInfoSync();
		return res.keys.includes(key);
	} catch (e) {
		console.error('获取缓存信息失败', e);
		return false;
	}
}

export const buf2string = function(buffer) {
	var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
	var str = ''
	for (var i = 0; i < arr.length; i++) {
		str += String.fromCharCode(arr[i])
	}
	return str
}

export const appendOxygenDataToFile = function(filename, data) {
	let filePath = '_documents/' + filename
	let saveStr = data.join(',')
	// 记录开始时间
	const startTime = Date.now();
	// 获取文件系统对象
	plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
		// 文件存在，打开文件并追加数据
		entry.file((file) => {
			entry.createWriter((writer) => {
				writer.seek(writer.length); // 移动到文件末尾
				if (writer.length > 0) {
					writer.write('\n');
				}
				writer.write(saveStr);
				// 记录结束时间并计算运行时间
				const endTime = Date.now();
				const executionTime = endTime - startTime;
				console.log(`本次血氧数据保存执行时间: ${executionTime} 毫秒`);
			}, (err) => {
				console.error(`数据追加失败：`, err);
			});
		});
	}, (err) => {
		// 文件不存在，创建文件并写入数据
		console.log("文件不存在")
	});
}

export const appendPositionDataToFile = function(filename, data) {
	let filePath = '_documents/' + filename
	// 记录开始时间
	const startTime = Date.now();
	// 获取文件系统对象
	plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
		// 文件存在，打开文件并追加数据
		entry.file((file) => {
			entry.createWriter((writer) => {
				writer.seek(writer.length); // 移动到文件末尾
				if (writer.length > 0) {
					writer.write('\n' + data);
				}
				writer.write(data);
				// 记录结束时间并计算运行时间
				const endTime = Date.now();
				const executionTime = endTime - startTime;
				console.log(`本次体位体动数据保存执行时间: ${executionTime} 毫秒`);
			}, (err) => {
				console.error(`数据追加失败：`, err);
			});
		});
	}, (err) => {
		// 文件不存在，创建文件并写入数据
		console.log("文件不存在")
	});
}

function getRandomSubarray(arr, subarrayLength) {
	// 确保数组长度大于要提取的子数组长度
	if (arr.length < subarrayLength) {
		throw new Error('Array length is smaller than the requested subarray length');
	}

	// 随机选择起始索引，范围是 0 到 (arr.length - subarrayLength)
	let maxStartIndex = arr.length - subarrayLength;
	let startIndex = Math.floor(Math.random() * (maxStartIndex + 1));

	// 使用 slice 方法提取子数组
	return arr.slice(startIndex, startIndex + subarrayLength);
}

export const appendSnoreDataToFile = function(filename, dataArr) {
	const startTime = Date.now();
	let filePath = '_documents/' + filename
	let mfccsArr = [];
	let partOfFiveSeconds = 200 * 5
	// 处理音频信号数据MFCC 循环取出一秒的内容
	for (let i = 0; i < dataArr.length; i += partOfFiveSeconds) {
		let chunk = dataArr.slice(i, i + partOfFiveSeconds);
		// 使用 filter 方法过滤掉 undefined 值
		let filteredChunk = chunk.filter(value => value !== undefined);
		if (filteredChunk.length >= 200) {
			let randomSubarray = getRandomSubarray(filteredChunk, 200);
			let combinedString = randomSubarray.join(' ');
			// let audioArr = combinedString.split(' ');
			// let mfccs = extractMfcc(audioArr)
			let indexOfRes = Math.floor(i / partOfFiveSeconds)
			mfccsArr[indexOfRes] = combinedString
		}
	}
	let writeData = ''
	for (let index in mfccsArr) {
		if (mfccsArr[index]) {
			// let item = '[' + mfccsArr[index] + ']' + '\n'
			let item = mfccsArr[index] + '\n'
			writeData += item
		}
	}

	// 获取文件系统对象
	plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
		// 文件存在，打开文件并追加数据
		entry.file((file) => {
			entry.createWriter((writer) => {

				writer.seek(writer.length); // 移动到文件末尾
				writer.write(writeData);

				// 记录结束时间并计算运行时间
				const endTime = Date.now();
				const executionTime = endTime - startTime;
				console.log(`本次声音信号保存执行时间: ${executionTime} 毫秒`);
			}, (err) => {
				console.error(`数据追加失败：`, err);
			});
		});
	}, (err) => {
		// 文件不存在，创建文件并写入数据
		console.log("文件不存在")
	});
}


export const appendBioDataToFile = function(filename, dataArr) {
	const startTime = Date.now();
	let filePath = '_documents/' + filename
	let writeData = ''
	// 遍历数组，找到空值并用后面最近的有效值填充
	for (let i = dataArr.length - 1; i >= 0; i--) {
		if (dataArr[i] === undefined || dataArr[i] === null) {
			let j = i + 1;
			while (j < dataArr.length && (dataArr[j] === undefined || dataArr[j] === null)) {
				j++;
			}
			if (j < dataArr.length) {
				dataArr[i] = dataArr[j];
			}
		}
	}
	let filterDataArr = dataArr
	// 处理数据数组
	for (let i = 0; i < filterDataArr.length; i++) {
		let item = filterDataArr[i]
		// item如果有内容
		if (item) {
			writeData += item
		}
		// 是某一秒的最后一部分 则添加换行符
		if (i % 2 == 1) {
			writeData += '\n'
		} else {
			writeData += ' '
		}
	}
	// 获取文件系统对象
	plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
		// 文件存在，打开文件并追加数据
		entry.file((file) => {
			entry.createWriter((writer) => {

				writer.seek(writer.length); // 移动到文件末尾
				writer.write(writeData);

				// 记录结束时间并计算运行时间
				const endTime = Date.now();
				const executionTime = endTime - startTime;
				console.log(`本次心电信号保存执行时间: ${executionTime} 毫秒`);
			}, (err) => {
				console.error(`数据追加失败：`, err);
			});
		});
	}, (err) => {
		// 文件不存在，创建文件并写入数据
		console.log("文件不存在")
	});
}

export const deleteFile = function(fileName) {
	const filePath = '_documents/' + fileName;

	plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
		entry.remove(() => {
			// 提示用户删除成功
			plus.nativeUI.toast('睡眠检测数据文件已删除', {
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
		plus.nativeUI.toast('无法找到文件', {
			icon: 'none',
			duration: 2000
		});
	});
};


export const finishUpload = function(reportId) {
	let obj = {
		method: "GET",
		showLoading: false,
		url: `/dataSet/finishUpload`,
		data: {
			reportId: reportId
		},
	}
	request(obj).then(res => {

	}).catch(err => {
		showToast("请稍后重试！", 1500)
	})
}


export const deleteSleepFiles = function(startTimeTamp) {
	deleteFile('bioelectricity_' + startTimeTamp + '.txt')
	deleteFile('position_' + startTimeTamp + '.txt');
	deleteFile('snore_' + startTimeTamp + '.txt');
	deleteFile('oxygen_' + startTimeTamp + '.txt')
}

export const createHealthyReport = function(startTimeTamp, endTimeTamp) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: createReportURL,
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
				resolve(reportId); // 成功后返回 reportId
			},
			fail: (err) => {
				console.log('Failed to create report:', err);
				reject(-2); // 失败后返回错误信息
			}
		});
	});
}

export const createFile = function(fileName, successCallback, errorCallback) {
	const filePath = '_documents/' + fileName;

	plus.io.resolveLocalFileSystemURL('_documents/', (dirEntry) => {
		dirEntry.getFile(fileName, {
			create: true
		}, (fileEntry) => {
			if (successCallback) {
				successCallback(fileEntry);
			}
		}, (err) => {
			console.error(`文件创建失败：`, err);
			if (errorCallback) {
				errorCallback(err);
			}
		});
	}, (err) => {
		console.error(`解析目录失败：`, err);
		if (errorCallback) {
			errorCallback(err);
		}
	});
};

export const createSleepDataFiles = function(startTimeTamp) {
	createFile('bioelectricity_' + startTimeTamp + '.txt')
	createFile('position_' + startTimeTamp + '.txt')
	createFile('snore_' + startTimeTamp + '.txt')
	createFile('oxygen_' + startTimeTamp + '.txt')
}

export const uploadSleepFilesToOss = async function(startTimeTamp, endTimeTamp) {
	let positionBucket = ossBuckets.position;
	let bioelectricityBucket = ossBuckets.bioelectricity;
	let snoreBucket = ossBuckets.snore;

	let positionFileName = 'position_' + startTimeTamp + '.txt';
	let bioelectricityFileName = 'bioelectricity_' + startTimeTamp + '.txt';
	let snoreFileName = 'snore_' + startTimeTamp + '.txt';

	uni.setStorage({
		key: isExistNotUpSleepFile,
		data: true
	});

	let ossInfo;
	try {
		// 尝试获取签名信息
		ossInfo = await generateSign();
	} catch (error) {
		// 如果获取失败，显示提示并返回 false
		hideLoading();
		uni.showToast({
			title: '网络错误，请稍后重试！',
			icon: 'none',
			duration: 2000
		});
		console.error('获取签名信息失败:', error);
		return false;
	}

	try {
		// 先创建健康报告并获取 reportId
		const reportId = await createHealthyReport(startTimeTamp, endTimeTamp);
		console.log('Report ID:', reportId);

		// 上传所有文件
		await Promise.all([
			uploadFileToOss(ossInfo, positionBucket, positionFileName, reportId),
			uploadFileToOss(ossInfo, bioelectricityBucket, bioelectricityFileName, reportId),
			uploadFileToOss(ossInfo, snoreBucket, snoreFileName, reportId)
		]);

		// 上传成功后，完成上传
		finishUpload(uni.getStorageSync(upReportId));

		// 所有上传成功后的处理逻辑
		hideLoading();
		uni.showToast({
			title: '数据上传成功',
			icon: 'success',
			duration: 2000
		});
		uni.setStorageSync(isExistNotUpSleepFile, false);
		// 清除对应的本地缓存与文件
		deleteStorageAndFiles();

		return true; // 成功
	} catch (err) {
		hideLoading();
		uni.showToast({
			title: '文件上传失败，请检查网络，稍后重试！',
			icon: 'none',
			duration: 3000
		});
		console.error('Error:', err);

		return false; // 出错
	}
};

// 删除本地缓存与睡眠文件
export const deleteStorageAndFiles = function() {

	let startTimeTamp = uni.getStorageSync(monitorStartTime)

	// 删除文件
	deleteSleepFiles(startTimeTamp)

	// 清理缓存
	const removekeys = [monitorStartTime, monitorEndTime,
		ossBuckets.snore, ossBuckets.position, ossBuckets.bioelectricity,
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

// 重新尝试上传睡眠文件
export const retryUploadSleepFilesToOss = async function() {
	let startTimeTamp = uni.getStorageSync(monitorStartTime);
	let endTimeTamp = uni.getStorageSync(monitorEndTime);

	try {
		// 如果没有创建 reportId，直接调用 uploadSleepFilesToOss
		if (!isStorageKeyExistsSync(upReportId)) {
			return await uploadSleepFilesToOss(startTimeTamp, endTimeTamp);
		} else {
			let ossInfo;
			try {
				// 尝试获取签名信息
				ossInfo = await generateSign();
			} catch (error) {
				// 如果获取失败，显示提示并返回 false
				hideLoading();
				uni.showToast({
					title: '网络错误，请稍后重试！',
					icon: 'none',
					duration: 2000
				});
				console.error('获取签名信息失败:', error);
				return false;
			}

			let positionBucket = ossBuckets.position;
			let bioelectricityBucket = ossBuckets.bioelectricity;
			let snoreBucket = ossBuckets.snore;
			let positionFileName = 'position_' + startTimeTamp + '.txt';
			let bioelectricityFileName = 'bioelectricity_' + startTimeTamp + '.txt';
			let snoreFileName = 'snore_' + startTimeTamp + '.txt';
			let reportId = uni.getStorageSync(upReportId);

			// 创建了报告，则重传失败的睡眠文件
			if (!uni.getStorageSync(ossBuckets.position)) {
				await uploadFileToOss(ossInfo, positionBucket, positionFileName, reportId);
			}
			if (!uni.getStorageSync(ossBuckets.bioelectricity)) {
				await uploadFileToOss(ossInfo, bioelectricityBucket, bioelectricityFileName, reportId);
			}
			if (!uni.getStorageSync(ossBuckets.snore)) {
				await uploadFileToOss(ossInfo, snoreBucket, snoreFileName, reportId);
			}

			// 检查是否都上传成功
			if (uni.getStorageSync(ossBuckets.position) && uni.getStorageSync(ossBuckets.bioelectricity) && uni
				.getStorageSync(ossBuckets.snore)) {
				// 同步服务器可以调用算法模型生成健康报告
				await finishUpload(reportId);
				uni.setStorageSync(isExistNotUpSleepFile, false);
				// 清除对应的本地缓存与文件
				deleteStorageAndFiles();
			}
			hideLoading();
			return true; // 上传成功
		}
	} catch (error) {
		// 处理所有捕获的错误
		hideLoading();
		uni.showToast({
			title: '重试上传过程中出现错误，请稍后重试！',
			icon: 'none',
			duration: 3000
		});
		console.error('Error during retry:', error);
		return false; // 出错返回 false
	}
};

export const uploadCOPDData = function(copdSaveDto) {
	let obj = {
		method: "POST",
		showLoading: false,
		url: `/copd/savaCOPDData`,
		data: {
			copdSaveDto: copdSaveDto
		},
	}
	request(obj).then(res => {
		hideLoading();
		uni.showToast({
			title: '数据上传成功',
			icon: 'success',
			duration: 2000
		});
	}).catch(err => {
		showToast("发生错误请稍后重试！", 1500)
	})
}