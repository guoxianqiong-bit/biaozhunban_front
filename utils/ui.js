export const showToast = function(content, duration) {
	if (!duration) duration = 2000
	uni.showToast({
		title: content,
		icon: 'none',
		duration: duration,
	})
}

var isShowLoading = false
export const showLoading = function(title) {
	if (isShowLoading) return
	uni.showLoading({
		title: title ? title : '',
		mask: true,
		success: () => {
			isShowLoading = true
		}
	})
}

export const hideLoading = function() {
	if (!isShowLoading) return
	isShowLoading = false
	uni.hideLoading()
}