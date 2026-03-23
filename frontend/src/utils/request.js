import axios from 'axios'
import Cookies from 'js-cookie'

const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000
})

// 请求拦截器：自动注入 Authorization
request.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default request
