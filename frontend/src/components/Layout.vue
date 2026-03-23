<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <Sidebar />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: 260px; // 侧边栏宽度
  background-color: #f5f7fa;
  min-height: 100vh;
}
</style>
