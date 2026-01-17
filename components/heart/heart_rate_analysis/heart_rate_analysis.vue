<template>
	<view class="container"> 
	  <view class="title">心率分析</view>
	  <view class="data">
	    <view class="data-info">
	      <view class="top">
	        <image src="/static/images/down.png" mode="widthFix"></image>
	        <text>低：{{overnightHeart.lowest}}bpm</text>
	      </view>
	      <text class="bot">{{describe[0]}}</text>
	    </view>
	    <view class="data-info">
	      <view class="top">
	        <image src="/static/images/smile.png" mode="widthFix"></image>
	        <text>均：{{overnightHeart.average}}bpm</text>
	      </view>
	      <text class="bot">{{describe[1]}}</text>
	    </view>
	    <view class="data-info">
	      <view class="top">
	        <image src="/static/images/up.png" mode="widthFix"></image>
	        <text>高：{{overnightHeart.highest}}bpm</text>
	      </view>
	      <text class="bot">{{describe[2]}}</text>
	    </view>
	  </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				 describe:[]
			}
		},
		props: {
		    overnightHeart: {
		      type: Object,
		      default: () => ({})
		    }
		},
		methods: {
			init(){
				for (let key in this.overnightHeart) {
				  if(this.overnightHeart[key] < 50)
					this.describe.push('偏低')
				  else if(this.overnightHeart[key] > 100)
					this.describe.push('偏高')
				  else
					this.describe.push('正常')
				}
			}
		},
		mounted() {
		  this.init();
		}
	}
</script>

<style>
@import "heart_rate_analysis.css";
</style>
