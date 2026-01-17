<template>
  <view class="mainBox">
    <view class="paginationBox">
      <view class="totalBox">共 {{total}} 条</view>
      <view class="selectPageBox">
        <view>
          <view>{{pageSize}}条/页</view>
        </view>
      </view>
      <view class="contantBox">
        <view style="color:{{pageNum<=1 ? 'rgb(194,201,213)' : 'rgb(25, 137, 250)'}}" class="updownPageBox" @tap="prevPage">
			&lt
        </view>
        <view class="pageBox">{{pageNum}}</view>
        <view style="color:{{pageNum >= (total / pageSize) ? 'rgb(194,201,213)' : 'rgb(25, 137, 250)'}}" class="updownPageBox" @tap="nextPage">
			&gt
		</view>
      </view>
      <view class="intBox">
        <text>前往</text>
        <input v-model="inputValue" class="intConBox" @confirm="handlePageConfirm" type="number" />
        <text>页</text>
      </view>
    </view>
  </view>
</template>


<script>
export default {
  props: {
    total: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 8
    },
    pageNum: {
      type: Number,
      default: 1,
      observer: 'pageNumObserver'
    }
  },
  data() {
      return {
		inputValue:''
      };
    },
    methods: {
      // 上一页
      prevPage() {
        if (this.pageNum > 1) { // 如果当前页码大于1
          this.$emit('pageChange', { // 触发名为'pageChange'的自定义事件，传递当前页码信息
            page: this.pageNum - 1
          });
        } else {
          uni.showToast({
            title: '已经是第一页',
            icon: 'none'
          });
        }
      },
      // 下一页
      nextPage() {
        const maxPage = Math.ceil(this.total / this.pageSize); // 计算最大页数
        if (this.pageNum < maxPage) { // 如果当前页码小于最大页数
          this.$emit('pageChange', { // 触发名为'pageChange'的自定义事件，传递当前页码信息
            page: this.pageNum + 1
          });
        } else {
          uni.showToast({
            title: '已经是最后一页',
            icon: 'none'
          });
        }
      },
      // 页码输入框
      handlePageConfirm(event) {
        if (this.inputValue === '') {
          // 如果输入值为空，则不执行查询操作
          return;
        }
        const page = parseInt(this.inputValue); // 获取输入的页码并转换为整数
        const maxPage = Math.ceil(this.total / this.pageSize); // 计算最大页数
        if (page >= 1 && page <= maxPage) { // 如果输入的页码有效
          this.$emit('pageChange',page);  // 触发名为'pageChange'的自定义事件，传递当前页码信息
        } else {
		  this.inputValue = ''
          uni.showToast({
            title: '请输入有效页数',
            icon: 'none'
          });
        }
      }
    },
};
</script>

<style lang="scss">
	@import "pagination.scss"
</style>