<template>
	<view class="ui-container">
		<view class="ui-grid ui-cols-2">
			  <view v-for="(item, sub_index) in aimDesc" :key="sub_index" class="ui-item p-3">
				<appNavLi :data="item" />
			  </view>
		</view>
	</view>
</template>

<script>
	import appNavLi from '../app-nav-li/app-nav-li.vue';
	export default {
		name:"card",
		components:{
			appNavLi
		},
		props: {
		    aimDesc: {
		      type: Array,
		      default: () => []
		    }
		},
		data() {
			return {
				
			};
		},
	}
</script>

<style lang="scss">
	@import "card.scss";
</style>