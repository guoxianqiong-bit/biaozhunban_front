<template>
	<view class="doc-card">
	    <view @click="toNavigate(data.url)" class="flex radius doc-card-navigator" :class="'bg-' + data.colorName + '-gradient'">
	        <view class="flex-sub p-4 doc-text">
	            <view class="doc-title">{{ data.title }}</view>
	            <view class="text-lg text-Abc text-lighter doc-name">{{ data.recordDate }}</view>
	        </view>
	    </view>
	    <view class="doc-bg" :class="'bg-' + data.colorName"></view>
	</view>
</template>

<script>
	export default {
		name:"app-nav-li",
		props: {
		    data: {
		      type: Object,
		      default: () => ({})
		    }
		  },
		data() {
			return {
				colorName:''
			};
		},
		methods:{
			//随机生成库内颜色名
			getColor() {
				let colorArr = ['yellow', 'orange', 'red', 'pink', 'mauve', 'purple', 'blue', 'cyan', 'green', 'olive', 'grey', 'brown'];
				return colorArr[Math.floor(Math.random() * colorArr.length)]
			},
			toNavigate(url) {
				uni.navigateTo({
					url:url
				})
			}
		},
	}
</script>

<style lang="scss" scoped>
	@import "app-nav-li.scss";
</style>