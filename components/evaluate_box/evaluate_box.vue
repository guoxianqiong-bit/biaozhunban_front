<template>
	<view class="container">
	  <view class="title">
	  <text style="text-align: justify;">{{diagnosis.title}}评估结果：</text>
	  </view>
	  <view class="info">
	    <text>{{diagnosis.msg}}</text>
	  </view>
	</view>
</template>

<script>
	export default {
		props: {
		    diagnosis: {
		      type: Object,
		      default: () => ({})
		    }
		},
		name:"evaluate_box",
		data() {
			return {
				
			};
		}
	}
</script>

<style>
	@import "evaluate_box.css";
</style>