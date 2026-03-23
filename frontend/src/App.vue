<template>
  <div id="app">
    <!-- 判断当前路由是否需要登录验证 -->
    <component :is="layoutComponent" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './components/Layout.vue'

const route = useRoute()

// 根据路由决定使用什么布局
const layoutComponent = computed(() => {
  // 登录/注册页面不需要侧边栏布局
  if (route.path === '/login' || route.path === '/register') {
    return 'router-view'
  }
  // 其他需要登录的页面使用带侧边栏的布局
  return Layout
})
</script>
<style>
#app{
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  max-height: 100%;
  text-align: left;
  max-width: 100%;
}
</style>
