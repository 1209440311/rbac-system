<template>
  <div class="sidebar">
    <div class="logo">
      <h2>管理系统</h2>
    </div>
    
    <!-- 用户信息区域 -->
    <div class="user-info">
      <div class="avatar">{{ currentUser?.username?.charAt(0)?.toUpperCase() }}</div>
      <div class="user-detail">
        <div class="username">{{ currentUser?.username }}</div>
        <div class="role-tag" :class="'role-' + currentUser?.role">
          {{ getRoleName(currentUser?.role) }}
        </div>
      </div>
    </div>
    
    <!-- 菜单列表 -->
    <nav class="menu">
      <template v-for="item in menuList" :key="item.path">
        <!-- 有子菜单的父菜单项 -->
        <div v-if="item.children && item.children.length > 0" class="menu-group">
          <div class="menu-item parent-item" @click="toggleMenu(item.path)">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-title">{{ item.title }}</span>
            <span class="arrow" :class="{ expanded: expandedMenus.includes(item.path) }">›</span>
          </div>
          <!-- 子菜单 -->
          <transition name="slide">
            <div v-show="expandedMenus.includes(item.path)" class="submenu">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="getFullPath(item.path, child.path)"
                class="menu-item child-item"
                active-class="active"
              >
                <span class="menu-icon">{{ child.icon }}</span>
                <span class="menu-title">{{ child.title }}</span>
              </router-link>
            </div>
          </transition>
        </div>
        
        <!-- 没有子菜单的直接显示 -->
        <router-link
          v-else
          :to="item.redirect || item.path"
          class="menu-item"
          active-class="active"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-title">{{ item.title }}</span>
        </router-link>
      </template>
    </nav>
    
    <!-- 退出登录按钮 -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        <span class="icon">🚪</span>
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Cookies from 'js-cookie'
import { generateMenu } from '../utils/permission'
import { asyncRoutes } from '../router/index.js'

const router = useRouter()
const route = useRoute()

// 当前登录用户
const currentUser = computed(() => {
  const userStr = Cookies.get('user', { withConverter: false })
  return userStr ? JSON.parse(userStr) : null
})

// 菜单列表
const menuList = ref([])

// 展开的菜单路径
const expandedMenus = ref([])

// 角色名称映射
const roleNames = {
  admin: '管理员',
  editor: '编辑',
  user: '普通用户'
}

// 获取角色名称
const getRoleName = (role) => {
  return roleNames[role] || role
}

// 生成菜单
const generateMenuList = () => {
  const permissionsStr = Cookies.get('permissions', { withConverter: false })
  const permissions = permissionsStr ? JSON.parse(permissionsStr) : []
  
  // 从异步路由生成菜单
  menuList.value = generateMenu(asyncRoutes)
  
  // 默认展开当前路由所在的父菜单
//   expandCurrentMenu()
}

// 切换菜单展开/折叠
const toggleMenu = (path) => {
  const index = expandedMenus.value.indexOf(path)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(path)
  }
}

// 获取完整路径（父路径 + 子路径）
const getFullPath = (parentPath, childPath) => {
  // 确保父路径不以 / 结尾，子路径不以 / 开头
  const normalizedParent = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
  const normalizedChild = childPath.startsWith('/') ? childPath : `/${childPath}`
  return `${normalizedParent}${normalizedChild}`
}

// 展开当前路由所在的父菜单
const expandCurrentMenu = () => {
  const currentPath = route.path
  menuList.value.forEach((item) => {
    if (item.children && item.children.length > 0) {
      // 检查当前路径是否是该父菜单的子路由
      const isChild = item.children.some(child => {
        const fullPath = getFullPath(item.path, child.path)
        return fullPath === currentPath || (item.redirect && item.redirect === currentPath)
      })
      if (isChild && !expandedMenus.value.includes(item.path)) {
        expandedMenus.value.push(item.path)
      }
    }
  })
}

// 退出登录
const handleLogout = () => {
  Cookies.remove('token')
  Cookies.remove('user')
  Cookies.remove('permissions')
  router.push('/login')
}

onMounted(() => {
  generateMenuList()
})
</script>

<style lang="scss" scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.logo {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
    text-align: center;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  .user-detail {
    flex: 1;
    overflow: hidden;
    
    .username {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
    }
    
    .role-tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      
      &.role-admin {
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
      }
      
      &.role-editor {
        background: rgba(255, 255, 255, 0.2);
        color: #e0e7ff;
      }
      
      &.role-user {
        background: rgba(255, 255, 255, 0.15);
        color: #d0d9ff;
      }
    }
  }
}

.menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  margin: 4px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 600;
  }
  
  .menu-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
  }
  
  .menu-title {
    font-size: 14px;
    flex: 1;
  }
}

// 父菜单项
.parent-item {
  justify-content: space-between;
  
  .arrow {
    font-size: 18px;
    transition: transform 0.3s ease;
    
    &.expanded {
      transform: rotate(90deg);
    }
  }
}

// 子菜单项
.child-item {
  padding-left: 52px; // 缩进显示层级
  font-size: 13px;
}

// 菜单组
.menu-group {
  margin-bottom: 4px;
}

// 子菜单容器
.submenu {
  overflow: hidden;
}

// 展开动画
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.logout-section {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  .logout-btn {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }
    
    .icon {
      font-size: 16px;
    }
  }
}
</style>
