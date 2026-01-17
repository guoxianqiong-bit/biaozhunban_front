import {
	request
} from "/utils/httpUtils.js";

export function getCopdReport(copdReportId){
	let obj = {
		method: "GET",
		showLoading: true,
		url: `/copd/getCopdReport`,
		data: {
			copdReportId: copdReportId
		},
		message: "正在获取数据"
	}
	return request(obj)
}

export function getEcgData(ossEcgFilePath,endpoint,bucketName,region,objectName){
	let obj = {
		method: "GET",
		showLoading: true,
		url: `/copd/getEcgData`,
		data: {
			ossEcgFilePath: ossEcgFilePath,
			endpoint:endpoint,
			bucketName:bucketName,
			region:region,
			objectName:objectName,
		},
		message: "正在获取ECG数据"
	}
	return request(obj)
}


export function getRespData(ossRespFilePath,endpoint,bucketName,region,objectName){
	let obj = {
		method: "GET",
		showLoading: true,
		url: `/copd/getRespData`,
		data: {
			ossEcgFilePath: ossRespFilePath,
			endpoint:endpoint,
			bucketName:bucketName,
			region:region,
			objectName:objectName,
		},
		message: "正在获取Resp数据"
	}
	return request(obj)
}

// 修改 submitDoctorReview 函数，添加日志
export function submitDoctorReview(copdReportId, doctorLevel,alladivce) {
  console.log("📤 提交医生审核参数：", {
    copdReportId: copdReportId,
    doctorLevel: doctorLevel,
    copdReportId类型: typeof copdReportId,
    doctorLevel类型: typeof doctorLevel
  });
  
  let obj = {
    method: "POST",
    showLoading: true,
    url: `/copd/doctorReview`,
    data: {
      copdReportId: copdReportId,
      doctorLevel: doctorLevel,
	  doctorAdvice:alladivce,
    },
    message: "正在提交医生审核"
  }
  return request(obj);
}
