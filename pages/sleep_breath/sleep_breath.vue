<template>
  <view class="container">
    <!-- 背景图片 -->
    <image class="header-image" src="../../static/images/sleep/breath.png" mode="widthFix"></image>
    
    <!-- 标题 -->
    <view class="title">什么是睡眠呼吸暂停？</view>
    
    <!-- 内容段落 -->
    <view class="content">
      <text>
        睡眠期间绝大多数人的呼吸模式都规律且有节奏，但呼吸短暂中断也比较常见。睡眠呼吸暂停是常见症状，指患者每晚都会出现呼吸中断。在任何一段睡眠中，你都可能经历每小时几次乃至超过 30次的呼吸紊乱。
      </text>
	  <text>
		  睡眠呼吸暂停可能导致难以整夜休息，进而造成白天疲惫。此症状还可能增加高血压、心脏病、中风和2型糖尿病的患病风险。睡眠呼吸暂停的早期诊疗可减少出现身心健康状况的风险。
	  </text>
    </view>
	
	<view class="subTitle">
		呼吸暂停有何症状？
	</view>
	
	<view class="content">
	  <text>
	    最常见的睡眠呼吸暂停类型为阻塞型睡眠呼吸暂停。喉咙后部肌肉松弛时可能出现此问题这可导致呼吸时气道狭窄或关闭。中枢性睡眠呼吸暂停等其他形式的睡眠呼吸暂停也可发生，但较不常见。若你有任何睡眠呼吸暂停相关问题，均应咨询医生或医护团队。
	  </text>
	</view>
	
	<view class="subTitle">
		如何判断是否患有睡眠呼吸暂停?
	</view>
	
	<view class="content">
	  <text>
	    通常，睡眠呼吸暂停患者不会意识到自己出现症状，因其出现在睡眠期间。若你与他人共寝，对方可能会注意到你大声打鼾、大口喘气或呼吸暂停。
	  </text>
	  <text>白天你可以留意睡眠呼吸暂停的迹象，如白天过度嗜睡、难以集中注意力、晨起头痛和易怒。</text>
	</view>
	
	<view class="subTitle">
		如果认为自己患有睡眠呼吸暂停，应如何处理?
	</view>
	
	<view class="content">
	  <text>
	    若有任何睡眠相关问题，咨询医生或医护团队至关重要。医护团队将检查病史并为你做身体检查。根据检查结果，可能会为你做睡眠测试。此测试可让医护团队了解你睡眠紊乱的原因。睡眠测试可在睡眠实验空完成，也可在家中使用便携式监测器完成。
	  </text>
	  <text>睡眠呼吸暂停有多种治疗方法。医生将斟酌何种疗法可能对你最有效。使用名为持续正压呼吸器 (CPAP)的设备是治疗睡眠呼吸暂停的常用疗法。此呼吸机会使用气压帮助你在夜间保持气道通畅，从而让睡眠更加轻松。。</text>
	</view>
    
    <view style="height: 200rpx;"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style scoped>
.container {
  width: 95%;
  margin: 0 auto;
}

.header-image {
  width: 100%;
  height: auto;
}

.title {
  font-size: 50rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

/* 修改后的布局，circle和subTitle并排 */
.subSection {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.circle {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.red {
  background-color: red;
}

.blue {
  background-color: #00aaff;
}

.darkblue {
  background-color: #0000aa;
}

.subTitle {
  font-size: 36rpx;
  font-weight: bold;
}

.content {
  width: 98%;
  margin-top: 10rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.content text {
  text-align: justify;
  display: block;
  margin-bottom: 20rpx;
  color: #222;
}
</style>