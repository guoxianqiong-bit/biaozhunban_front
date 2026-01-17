<template>
  <view class="container">
    <image class="logo" src="@/static/logo-sleep.png" mode="widthFix"></image>
    <view class="title">欢迎注册</view>

    <view class="form">
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" v-model="form.name" placeholder="请输入姓名" />
      </view>

 <!--     <view class="form-item">
        <text class="label">性别</text>
        <picker mode="selector" :range="sexOptions" @change="onSexChange">
          <view class="picker">
            {{ form.sex || '请选择性别' }}
          </view>
        </picker>
      </view> -->
	  
	  <view class="form-item">
	    <text class="label">性别</text>
	  
	    <view class="picker-wrapper">
	      <picker mode="selector" :range="sexOptions" @change="onSexChange">
	        <view class="picker">
	          {{ form.sex || '请选择性别' }}
	        </view>
	      </picker>
	    </view>
	  </view>

      
     <view class="form-item">
        <text class="label">出生日期</text>
        <!-- <picker mode="date" @change="onBirthChange"> -->
         <!-- <view class="picker">
            {{ form.birthTime ? formatDate(form.birthTime) : '请选择日期' }}
          </view> -->
		 <!-- <view
		    class="picker birth"
		    :class="{ placeholder: !form.birthTime }"
		  >
		    {{ form.birthTime ? formatDate(form.birthTime) : '请选择日期' }}</view> -->

        <!-- </picker> -->
		<view
		  class="picker birth"
		  :class="{ placeholder: !form.birthTime }"
		  @click="openBirthPicker"
		>
		  {{ form.birthTime ? formatDate(form.birthTime) : '请选择日期' }}
		</view>

      </view>
	  
	 

    <!--  <view class="form-item">
        <text class="label">身高（cm）</text>
        <input class="input" type="number" v-model="form.height" placeholder="请输入身高" />
      </view> -->

   <!--   <view class="form-item">
        <text class="label">体重（kg）</text>
        <input class="input" type="number" v-model="form.weight" placeholder="请输入体重" />
      </view> -->
        <view class="form-item">
          <text class="label">身高</text>
        
          <view class="input-with-unit">
            <input
              class="input"
              type="number"
              v-model="form.height"
              placeholder="请输入身高"
            />
            <text class="unit">cm</text>
          </view>
        </view>
          
		  <view class="form-item">
		    <text class="label">体重</text>
		  
		    <view class="input-with-unit">
		      <input
		        class="input"
		        type="number"
		        v-model="form.weight"
		        placeholder="请输入体重"
		      />
		      <text class="unit">kg</text>
		    </view>
		  </view>

      <view class="form-item">
        <text class="label">手机号码</text>
        <input class="input" type="number" v-model="form.username" placeholder="请输入手机号码" />
      </view>

<!--      <view class="form-item code-item">
        <text class="label">验证码</text>
        <input class="input code-input" v-model="form.smsCode" placeholder="请输入验证码" />
        <button class="code-button" @click="sendSmsCode" :disabled="smsCooldown > 0">
          {{ smsCooldown > 0 ? smsCooldown + '秒后重试' : '获取验证码' }}
        </button>
      </view> -->

      <view class="form-item">
        <text class="label">密码</text>
        <input class="input" type="password" v-model="form.password" placeholder="请输入密码" />
      </view>

      <view class="form-item">
        <text class="label">确认密码</text>
        <input class="input" type="password" v-model="confirmPassword" placeholder="请再次输入密码" />
      </view>

      <button class="submit-button" @click="submitForm">立即注册</button>
    </view>

   <!-- <view class="footer">
      <text>已有账号？</text>
      <navigator url="/pages/login/login" class="login-link">立即登录</navigator>
    </view> -->
	<!-- <view class="footer">
	  <text class="footer-text">已有账号？</text>
	  <navigator url="/pages/login/login" class="login-link">
	    立即登录
	  </navigator>
	</view> -->
	<view class="footer">
	  <text class="footer-text">已有账号</text>
	  <text class="footer-dot">？</text>
	  <navigator url="/pages/login/login" class="login-link-btn">
	    立即登录
	  </navigator>
	</view>

	
<!-- 出生日期弹层：年/月/日三列，年份一眼可见 -->
<view v-if="showBirthPicker" class="mask" @click="closeBirthPicker">
  <view class="sheet" @click.stop>
    <view class="sheet-header">
      <text class="btn" @click="closeBirthPicker">取消</text>
      <text class="sheet-title">选择出生日期</text>
      <text class="btn primary" @click="confirmBirthPicker">确定</text>
    </view>

    <!-- 顶部标签：让用户一眼知道“左边是年份” -->
    <view class="ymd-label">
      <text>年</text>
      <text>月</text>
      <text>日</text>
    </view>

    <picker-view
      class="pv"
      :value="pvValue"
      @change="onPvChange"
      indicator-style="height: 44px;"
    >
      <picker-view-column>
        <view class="pv-item" v-for="(y, i) in years" :key="i">{{ y }}</view>
      </picker-view-column>
      <picker-view-column>
        <view class="pv-item" v-for="(m, i) in months" :key="i">{{ m }}</view>
      </picker-view-column>
      <picker-view-column>
        <view class="pv-item" v-for="(d, i) in days" :key="i">{{ d }}</view>
      </picker-view-column>
    </picker-view>
  </view>
</view>

  </view>
</template>

<script>
import { request } from "@/utils/httpUtils";
import { showToast, showLoading, hideLoading } from "@/utils/ui.js";

export default {
  data() {
    return {
      form: {
        name: "",
        sex: "",
        birthTime: null,
        height: "",
        weight: "",
        username: "",
        smsCode: "",
        password: "",
      },
      confirmPassword: "",
      sexOptions: ["男", "女"],
      smsCooldown: 0,
	  showBirthPicker: false,
	  years: [],
	  months: [],
	  days: [],
	  pvValue: [0, 0, 0], // [年索引, 月索引, 日索引]

    };
  },
  
  created() {
    // 年份范围：按需改
    const currentYear = new Date().getFullYear();
    const minYear = 1940;
    for (let y = currentYear; y >= minYear; y--) this.years.push(y);
  
    for (let m = 1; m <= 12; m++) this.months.push(m);
  
    // 默认先给 days 一个 31
    this.updateDays(this.years[0], 1);
  },

  methods: {
	  openBirthPicker() {
	    this.showBirthPicker = true;
	  
	    // 用已有生日回填（没有就用默认：1990-01-01）
	    const base = this.form.birthTime ? new Date(this.form.birthTime) : new Date("1990-01-01");
	    const y = base.getFullYear();
	    const m = base.getMonth() + 1;
	    const d = base.getDate();
	  
	    // const yi = Math.max(0, this.years.indexOf(y));
		const yi = this.years.indexOf(y) === -1 ? 0 : this.years.indexOf(y);

	    const mi = Math.max(0, this.months.indexOf(m));
	  
	    this.updateDays(y, m);
	    const di = Math.max(0, this.days.indexOf(d));
	  
	    // this.pvValue = [yi, mi, di];
		this.$nextTick(() => {
		  this.pvValue = [yi, mi, di];
		});

	  },
	  
	  closeBirthPicker() {
	    this.showBirthPicker = false;
	  },
	  
	  confirmBirthPicker() {
	    const [yi, mi, di] = this.pvValue;
	    const y = this.years[yi];
	    const m = this.months[mi];
	    const d = this.days[di];
	  
	    // 仍然写回时间戳：保持你原有提交逻辑不变
	    this.form.birthTime = new Date(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`).getTime();
	    this.showBirthPicker = false;
	  },
	  
	  // onPvChange(e) {
	  //   const [yi, mi, di] = e.detail.value;
	  //   const y = this.years[yi];
	  //   const m = this.months[mi];
	  
	  //   // 月/年变化时，天数要跟着变（例如 2 月）
	  //   this.updateDays(y, m);
	  
	  //   // 防止原来的 di 超出新的 days 长度
	  //   const safeDi = Math.min(di, this.days.length - 1);
	  //   this.pvValue = [yi, mi, safeDi];
	  // },
	  onPvChange(e) {
	    let [yi, mi, di] = e.detail.value;
	  
	    const y = this.years[yi];
	    const m = this.months[mi];
	  
	    // ⭐ 月或年变化时，先更新 days
	    this.updateDays(y, m);
	  
	    // ⭐ 再重新校准 di（非常关键）
	    di = Math.min(di, this.days.length - 1);
	  
	    this.pvValue = [yi, mi, di];
	  },

	  
	  updateDays(year, month) {
	    const max = new Date(year, month, 0).getDate(); // 当月最后一天
	    const arr = [];
	    for (let d = 1; d <= max; d++) arr.push(d);
	    this.days = arr;
	  },

    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },
    onSexChange(e) {
      this.form.sex = this.sexOptions[e.detail.value];
    },
    onBirthChange(e) {
      this.form.birthTime = new Date(e.detail.value).getTime();
    },
    sendSmsCode() {
      if (!this.form.username || !/^1[3-9]\d{9}$/.test(this.form.username)) {
        showToast("请输入有效的手机号码！");
        return;
      }

      request({
        url: "/sms/getUserRegisterSmsCode",
        method: "GET",
        data: { phoneNum: this.form.username },
      })
        .then((res) => {
          if (res.code === 201) {
            showToast(res.msg);
          } else {
            showToast("验证码发送成功！");
            this.smsCooldown = 180; // 冷却时间180秒
            const timer = setInterval(() => {
              if (this.smsCooldown <= 0) {
                clearInterval(timer);
              } else {
                this.smsCooldown--;
              }
            }, 1000);
          }
        })
        .catch((err) => {
          showToast(err || "验证码发送失败！");
        });
    },
    submitForm() {
      const { name, sex, birthTime, height, weight, username, smsCode, password } = this.form;

      if (!name || !sex || !birthTime || !height || !weight || !username || !password) {
        showToast("请完整填写注册信息！");
        return;
      }

      if (password !== this.confirmPassword) {
        showToast("两次密码输入不一致！");
        return;
      }

      request({
        url: "/user/userRegister",
        method: "POST",
        data: {
          name,
          height: parseFloat(height),
          weight: parseFloat(weight),
          sex,
          birthTime,
          smsCode,
          username,
          password,
        },
        showLoading: true,
      })
        .then(() => {
          showToast("注册成功！");
          uni.redirectTo({ url: "/pages/login/login" });
        })
        .catch((err) => {
          showToast(err || "注册失败！");
        });
    },
  },
  onPullDownRefresh() {
  
  	uni.stopPullDownRefresh()
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f7f8fa;
  padding: 40rpx 0;
  min-height: 100vh;
}

.logo {
  width: 200rpx;
  margin-bottom: 20rpx;
}

.title {
  font-size: 48rpx;
  color: #333;
  margin-bottom: 40rpx;
}

.form {
  width: 90%;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.label {
  width: 160rpx;
  font-size: 32rpx;
  color: #555;
}

.input {
  flex: 1;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 30rpx;
  color: #333;
  background-color: #fafafa;
}

.picker {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 30rpx;
  color: #333;
  background-color: #fafafa;
}

.code-item {
  position: relative;
}

.code-input {
  width: 100%;
}

.code-button {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60rpx;
  padding: 0 20rpx;
  background-color: #ff7e00;
  color: #fff;
  border: none;
  border-radius: 30rpx;
  font-size: 26rpx;
  line-height: 60rpx;
}

.submit-button {
  width: 100%;
  height: 80rpx;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 32rpx;
  margin-top: 50rpx;
}

/* .footer {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #888;
}

.login-link {
  color: #1890ff;
  margin-left: 10rpx;
} */
/* .footer {
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-text {
  margin-right: 8rpx;
}

.login-link {
  color: #1890ff;
  font-weight: 500;
} */
.footer {
  margin-top: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #8c8c8c;
}

.footer-text {
  color: #8c8c8c;
}

.footer-dot {
  margin: 0 10rpx;
  color: #c0c4cc;
}

.login-link-btn {
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(24, 144, 255, 0.35);
  color: #1890ff;
  font-weight: 600;
  background: rgba(24, 144, 255, 0.06);
}


/* 出生日期 picker 特殊样式 */
.picker.birth {
  color: #1890ff;
  font-weight: 500;
}

.picker.placeholder {
  color: #999;
}
.mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.sheet {
  width: 100%;
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  padding-bottom: 20rpx;
}

.sheet-header {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eee;
}

.sheet-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.btn {
  font-size: 28rpx;
  color: #666;
  padding: 12rpx 10rpx;
}

.btn.primary {
  color: #1890ff;
  font-weight: 600;
}

.ymd-label {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0 8rpx;
  color: #999;
  font-size: 26rpx;
}

.pv {
  height: 220px; /* 44px * 5 行，整行数，最稳 */
}

.pv-item {
  height: 44px;
  line-height: 44px;
  text-align: center;
  font-size: 32rpx; /* 字号保留 rpx 没问题 */
  color: #333;
}

/* 输入框 + 单位（身高 / 体重） */
.input-with-unit {
  flex: 1;
  display: flex;
  align-items: center;
}

.input-with-unit .input {
  flex: 1;
}

.unit {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #999;
  white-space: nowrap;
}
/* 让性别 picker 和 input 一样宽 */
.picker-wrapper {
  flex: 1;
}


</style>