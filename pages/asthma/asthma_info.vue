<template>
	<view class="container">
		<view class="header">
			<text class="title">检测前准备</text>
			<text class="subtitle">请输入受测者身体信息以计算预测值</text>
		</view>

		<view class="card">
			<view class="form-item">
				<text class="label">身高 (cm)</text>
				<input class="input" type="number" v-model="formData.height" placeholder="例如: 175" />
			</view>
			<view class="divider"></view>
			<view class="form-item">
				<text class="label">体重 (kg)</text>
				<input class="input" type="number" v-model="formData.weight" placeholder="例如: 65" />
			</view>
			<view class="divider"></view>
			<view class="form-item">
				<text class="label">年龄</text>
				<input class="input" type="number" v-model="formData.age" placeholder="例如: 30" />
			</view>
			<view class="divider"></view>
			<view class="form-item">
				<text class="label">性别</text>
				<view class="gender-switch">
					<text :class="{active: formData.sex==='男'}" @click="formData.sex='男'">男</text>
					<text :class="{active: formData.sex==='女'}" @click="formData.sex='女'">女</text>
				</view>
			</view>
		</view>

		<button class="submit-btn" @click="nextStep">下一步：开始吹气</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					height: '170',
					weight: '60',
					age: '30',
					sex: '男'
				}
			}
		},
		methods: {
			nextStep() {
				if (!this.formData.height || !this.formData.age) {
					uni.showToast({ title: '请完善信息', icon: 'none' });
					return;
				}
				// 存入缓存，传给下一页
				uni.setStorageSync('asthma_user_info', this.formData);
				
				// 跳转到吹气页
				uni.navigateTo({
					url: '/pages/asthma/asthma_detect'
				});
			}
		}
	}
</script>

<style scoped>
	.container { padding: 20px; min-height: 100vh; background: #F5FBFB; }
	.header { margin-bottom: 30px; }
	.title { font-size: 24px; font-weight: bold; color: #00695C; display: block; }
	.subtitle { font-size: 14px; color: #4DB6AC; margin-top: 5px; }
	.card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
	.form-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; }
	.label { font-size: 16px; font-weight: 500; color: #333; }
	.input { text-align: right; font-size: 16px; color: #00796B; }
	.divider { height: 1px; background: #eee; }
	.gender-switch text { padding: 5px 15px; border: 1px solid #ccc; border-radius: 15px; margin-left: 10px; font-size: 14px; }
	.gender-switch text.active { background: #00796B; color: white; border-color: #00796B; }
	.submit-btn { margin-top: 40px; background: #26A69A; color: white; border-radius: 25px; }
</style>