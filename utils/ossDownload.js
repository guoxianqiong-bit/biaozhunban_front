// utils/ossDownload.js
import { request } from "/utils/httpUtils.js";

// 你的地域
const OSS_REGION = "oss-cn-chengdu";
const OSS_ENDPOINT = `${OSS_REGION}.aliyuncs.com`;

// 是否是公共读桶：公共读就直接拼 URL；私有桶就要走后端签名
const OSS_PUBLIC_READ = false; // 私有桶改为 false

// 构建公共读 URL
export function buildPublicUrl(bucket, key) {
  return `https://${bucket}.${OSS_ENDPOINT}/${encodeURI(key)}`;
}

// 向后端申请一个 GET 签名 URL（你需要在后端提供该接口）
async function signGetUrl(bucket, key) {
  const res = await request({
    method: "GET",
    url: "/oss/signGet",     // 后端接口（见文末示例）
    data: { bucket, key },
    showLoading: false,
  });
  return res?.data?.url;
}

// 拿到可直接请求的 URL（公共读 or 私有签名）
export async function getReadableUrl(bucket, key) {
  return OSS_PUBLIC_READ ? buildPublicUrl(bucket, key) : await signGetUrl(bucket, key);
}

// 读取 JSON
export async function fetchOssJSON(bucket, key) {
  const url = await getReadableUrl(bucket, key);
  const { statusCode, data } = await uni.request({
    url,
    method: "GET",
    header: { "Accept": "application/json" },
  });
  if (statusCode >= 200 && statusCode < 300) {
    // 有些小程序端 data 可能是字符串
    return typeof data === "string" ? JSON.parse(data) : data;
  }
  throw new Error(`OSS JSON fetch failed: ${statusCode} ${url}`);
}

// 读取文本（CSV / txt）
export async function fetchOssText(bucket, key) {
  const url = await getReadableUrl(bucket, key);
  const { statusCode, data } = await uni.request({ url, method: "GET" });
  if (statusCode >= 200 && statusCode < 300) return data;
  throw new Error(`OSS TEXT fetch failed: ${statusCode} ${url}`);
}

// 下载文件到本地（图片/大文件）
export async function downloadOssFile(bucket, key) {
  const url = await getReadableUrl(bucket, key);
  const { statusCode, tempFilePath } = await uni.downloadFile({ url });
  if (statusCode === 200) return tempFilePath;
  throw new Error(`OSS download failed: ${statusCode} ${url}`);
}
