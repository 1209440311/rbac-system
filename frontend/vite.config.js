import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 开发环境配置：处理 history 模式路由
    historyApiFallback: true
  },
  preview: {
    // 预览环境配置：处理 history 模式路由
    historyApiFallback: true
  }
})
