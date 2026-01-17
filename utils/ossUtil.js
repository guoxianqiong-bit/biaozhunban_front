import {
	request
} from "./httpUtils";
import {
	hideLoading,
	showLoading,
	showToast
} from "/utils/ui.js";

export const generateSign = function() {
	return new Promise((resolve, reject) => {
		let obj = {
			method: "GET",
			showLoading: false,
			url: `/dataSet/generateSign`,
			data: {},
			message: "正在获取凭证"
		};

		request(obj).then(res => {
			let resData = res.data;
			const ossInfo = {
				accessId: resData.accessId,
				policy: resData.policy,
				signature: resData.signature,
				dir: resData.dir // 文件前缀目录
			};
			resolve(ossInfo); // 成功时返回 ossInfo
		}).catch(err => {
			showToast("请稍后重试！", 1500);
			reject(err); // 失败时返回错误
		});
	});
};

export const uploadFileToOss = function(ossInfo, bucketName, fileName, reportId) {
	return new Promise((resolve, reject) => {
		const host = 'https://' + bucketName + '.oss-cn-chengdu.aliyuncs.com';
		const filePath = '_documents/' + fileName;

		// 生成上传时 OSS 完整的路径
		const ossFilePath = ossInfo.dir + reportId + '_' + fileName;

		// 开始上传文件
		uni.uploadFile({
			url: host, // 使用后端返回的 OSS host
			filePath: filePath, // 上传的文件路径
			name: 'file', // 必须为 `file`
			formData: {
				key: ossFilePath, // OSS 中的文件路径
				OSSAccessKeyId: ossInfo.accessId, // AccessKey ID
				policy: ossInfo.policy, // 上传策略
				Signature: ossInfo.signature, // 签名
				success_action_status: '200', // 成功时返回的状态码，默认为204
			},
			success: (uploadFileRes) => {
				if (uploadFileRes.statusCode === 200) {
					// 标志对应文件已上传成功
					uni.setStorageSync(bucketName, true)
					resolve(1); // 成功时调用 resolve
				} else {
					console.log('上传失败:', uploadFileRes);
					uni.setStorageSync(bucketName, false)
					reject(-1); // 失败时调用 reject
				}
			},
			fail: (err) => {
				console.log(err)
				uni.setStorageSync(bucketName, false)
				reject(-1); // 失败时调用 reject
			}
		});
	});
}
export const uploadFileToOss_COPD = function(ossInfo, bucketName, fileName, reportId) {
	return new Promise((resolve, reject) => {
		const host = 'https://' + bucketName + '.oss-cn-chengdu.aliyuncs.com';
		const filePath = '_documents/' + fileName;
        const path=reportId+'/'
		// 生成上传时 OSS 完整的路径
		const ossFilePath = path + reportId + '_' + fileName;
		// 开始上传文件  
		uni.uploadFile({
			url: host, // 使用后端返回的 OSS host
			filePath: filePath, // 上传的文件路径
			name: 'file', // 必须为 `file`
			formData: {
				key: ossFilePath, // OSS 中的文件路径
				OSSAccessKeyId: ossInfo.accessId, // AccessKey ID
				policy: ossInfo.policy, // 上传策略
				Signature: ossInfo.signature, // 签名
				success_action_status: '200', // 成功时返回的状态码，默认为204
			},
			success: (uploadFileRes) => {
				if (uploadFileRes.statusCode === 200) {
					// 标志对应文件已上传成功
					uni.setStorageSync(bucketName, true)
					console.log('OSS上传成功');
					resolve(1); // 成功时调用 resolve
				} else {
					console.log(host);
					console.log('上传失败:', uploadFileRes);
					uni.setStorageSync(bucketName, false)
					reject(-1); // 失败时调用 reject
				}
			},
			fail: (err) => {
				console.log(err)
				uni.setStorageSync(bucketName, false)
				reject(-1); // 失败时调用 reject
			}
		});
	});
}