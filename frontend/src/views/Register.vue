<template>
  <div class="register-container">
    <div class="register-box">
      <h2>用户注册</h2>
      <form @submit.prevent="register">
        <div class="form-item">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="form-item">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="new-password"
          />
        </div>
        <div class="form-item">
          <label>确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
        </div>
        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <div class="footer-link">
        已有账号？
        <span class="link" @click="router.push('/login')">立即登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../axios/axios.js'

const router = useRouter()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const register = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!username.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
    errorMsg.value = '所有字段不能为空'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }

  if (password.value.length < 6) {
    errorMsg.value = '密码长度不能少于6位'
    return
  }

  loading.value = true

  try {
    await request.post('/api/users/register', {
      username: username.value,
      password: password.value
    })

    successMsg.value = '注册成功，即将跳转到登录页...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    if (error.response?.status === 409) {
      errorMsg.value = '用户名已存在，请更换一个'
    } else {
      errorMsg.value = '注册失败，请稍后重试'
    }
    console.error('注册失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.register-box {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 360px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 22px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  color: #555;
  font-size: 14px;
}

.form-item input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-item input:focus {
  outline: none;
  border-color: #007bff;
}

.error-msg {
  color: #dc3545;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.success-msg {
  color: #28a745;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

button[type="submit"] {
  width: 100%;
  padding: 11px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #0056b3;
}

button[type="submit"]:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.footer-link {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #888;
}

.link {
  color: #007bff;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}
</style>
