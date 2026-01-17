export const formatTimestamp = function(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份是从0开始的，所以要加1
    const day = date.getDate();
    return year + '年' + month + '月' + day + '日';
}


export const formatTimestamp_ = function(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，所以要加1
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

export const formatTimestamp2Second = function(timestamp){
    const date = new Date(timestamp); // 将时间戳转化为 Date 对象

    const year = date.getFullYear(); // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份，padStart 保证两位
    const day = String(date.getDate()).padStart(2, '0'); // 获取日期，padStart 保证两位

    const hours = String(date.getHours()).padStart(2, '0'); // 获取小时，padStart 保证两位
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟，padStart 保证两位
    const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取秒，padStart 保证两位

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatTime = function(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 辅助函数，用于将不足两位数的部分前面补0
    const formatNumber = (num) => (num < 10 ? '0' : '') + num;

    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
}

export const formatTimeInterval = function (startTimeTamp, currentTimeTamp) {
	// 计算时间间隔（以毫秒为单位）
	const intervalMs = currentTimeTamp - startTimeTamp;

	// 将毫秒转换为分钟
	const totalMinutes = Math.floor(intervalMs / (1000 * 60));
  
    return totalMinutes;
}


export const formatLatestSleepTime = function(timestamp) {
    // 创建一个新的Date对象，传入时间戳
        const date = new Date(timestamp);
    
        // 获取年份、月份、日期、小时、分钟和秒
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 月份从0开始，所以需要加1
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
    
        // 格式化为两位数
        const formatNumber = (num) => (num < 10 ? '0' : '') + num;
    
        // 返回格式化后的字符串
        return `${year}-${month}-${formatNumber(day)} ${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
}