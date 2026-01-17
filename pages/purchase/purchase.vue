<template>
  <view class="container">
    <view class="title">套餐选择</view>
    <view class="subtitle">我们为您和您的家人提供睡眠健康保护</view>
    
    <view class="package basic-package">
      <view class="package-header">
        <view class="package-name">基础套餐</view>
        <view class="package-price">98元</view>
      </view>
      <view class="package-features">
        <view class="feature"><text class="checkmark">✔</text> 48次设备使用次数</view>
        <view class="feature"><text class="checkmark">✔</text> 无智能医嘱生成</view>
        <view class="feature"><text class="checkmark">✔</text> 10次初级医师审核</view>
      </view>
      <button class="next-button">购买</button>
    </view>
    <view class="package silver-package">
      <view class="package-header">
        <view class="package-name">臻享套餐</view>
        <view class="package-price">198元</view>
      </view>
      <view class="package-features">
        <view class="feature"><text class="checkmark">✔</text> 48次设备使用次数</view>
        <view class="feature"><text class="checkmark">✔</text> 48次智能医嘱生成</view>
        <view class="feature"><text class="checkmark">✔</text> 48次初级医师审核</view>
      </view>
      <button class="next-button">购买</button>
    </view>
 
 <view class="package gold-package">
       <view class="package-header">
         <view class="package-name">尊享套餐</view>
         <view class="package-price">398元</view>
       </view>
       <view class="package-features">
         <view class="feature"><text class="checkmark">✔</text> 120次设备使用次数</view>
         <view class="feature"><text class="checkmark">✔</text> 120次智能医嘱生成</view>
         <view class="feature"><text class="checkmark">✔</text> 100次副主任医师审核，20次主任医师审核</view>
       </view>
       <button class="next-button">购买</button>
     </view>
 
     <view class="package diamond-package">
       <view class="package-header">
         <view class="package-name">至尊套餐</view>
         <view class="package-price">698元</view>
       </view>
       <view class="package-features">
         <view class="feature"><text class="checkmark">✔</text> 250次设备使用次数</view>
         <view class="feature"><text class="checkmark">✔</text> 250次智能医嘱生成</view>
         <view class="feature"><text class="checkmark">✔</text> 100次副主任医师审核，150次主任医师审核</view>
       </view>
       <button class="next-button">购买</button>
     </view>
  
  </view>
</template>
<script>
 export default {
	data() {
	   return {
		
	}
	  },
	  methods: {
	   
	  },
	  onLoad() {
	   
	  },
	  onPullDownRefresh() {
	   uni.stopPullDownRefresh()
	  }
 }
</script>
<style >
 @import url("purchase.css");
</style>