<template>
    <div class="login-container">
        <div class="login-box">
            <h2>用户登录</h2>
            <form @submit.prevent="login">
                <div class="form-item">
                    <label>用户名</label>
                    <input v-model="username" type="text" placeholder="请输入用户名" autocomplete="username" />
                </div>
                <div class="form-item">
                    <label>密码</label>
                    <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" />
                </div>
                <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
                <button type="submit" :disabled="loading">
                    {{ loading ? '登录中...' : '登录' }}
                </button>
            </form>
            <div class="footer-link">
                还没有账号？
                <span class="link" @click="router.push('/register')">立即注册</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../axios/axios.js'
import Cookies from 'js-cookie'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const login = async () => {
    if (!username.value.trim() || !password.value.trim()) {
        errorMsg.value = '用户名和密码不能为空'
        return
    }

    loading.value = true
    errorMsg.value = ''

    try {
        const { data } = await request.post('/api/users/login', {
            username: username.value,
            password: password.value
        })

        // 将 token 和 user 和 permissions 信息存储到 cookie 中（有效期 7 天）
        // withConverter: false 选项会禁用 js-cookie 的自动 URL 编码功能，确保数据正确存储和获取
        Cookies.set('token', data.data.token, { expires: 7, withConverter: false })
        Cookies.set('user', JSON.stringify(data.data.user), { expires: 7, withConverter: false })
        Cookies.set('permissions', JSON.stringify(data.data.permissions), { expires: 7, withConverter: false })

        // 跳转到用户列表页面
        router.push('/users')
    } catch (error) {
        if (error.response?.status === 401) {
            errorMsg.value = '用户名或密码错误'
        } else {
            errorMsg.value = '登录失败，请稍后重试'
        }
        console.error('登录失败', error)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
}

.login-box {
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
