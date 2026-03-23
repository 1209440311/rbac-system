import { createRouter, createWebHistory } from 'vue-router'
// 导入权限工具函数
import { hasPermission, filterAsyncRoutes } from '../utils/permission.js'
import Cookies from 'js-cookie'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Users from '../views/Users.vue'

// 静态路由（不需要权限）
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

// 异步路由（需要权限控制）
export const asyncRoutes = [
  {
    path: '/',
    redirect: '/users'
  },
  // 一级菜单：用户管理
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: {
      requiresAuth: true,
      permission: 'user:view', //需要的权限码
      title: '用户管理',
      icon: '👥',
      menuVisible: true //是否显示在菜单中
    }
  },
  // 一级菜单（父菜单）：系统管理
  {
    path: '/system',
    name: 'System',
    redirect: '/system/roles',
    meta: {
      requiresAuth: true,
      permission: 'system:view',
      title: '系统管理',
      icon: '🛠️',
      menuVisible: true
    },
    children: [
      // 二级菜单：角色管理
      {
        path: 'roles',
        name: 'Roles',
        component: Users, // 暂时复用 Users 组件，实际项目中应该创建新组件
        meta: {
          requiresAuth: true,
          permission: 'role:view',
          title: '角色管理',
          icon: '🔐',
          menuVisible: true
        }
      }
    ]
  }
]

// 创建路由器实例（初始只添加静态路由）
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

// 标记是否已经添加过异步路由
let hasAddedAsyncRoutes = false

/**
 * 动态添加异步路由
 * @param {Array} permissions - 用户权限列表
 */
export function addAsyncRoutes(permissions) {
  if (hasAddedAsyncRoutes) {
    return
  }
  
  // 过滤出用户有权限的异步路由
  const filteredRoutes = filterAsyncRoutes(asyncRoutes, permissions)
  
  // 将过滤后的路由添加到路由器中
  filteredRoutes.forEach(route => {
    router.addRoute(route)
  })
  
  hasAddedAsyncRoutes = true
}



// 路由守卫：未登录时跳转到登录页，并动态添加权限路由
router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  
  // 如果访问的是登录/注册页面，直接放行
  if (to.path === '/login' || to.path === '/register') {
    if (token) {
      // 已登录时访问登录页，跳转到用户列表
      next('/users')
    } else {
      next()
    }
    return
  }
  
  // 如果需要登录验证 且没有token，则跳转到登录页
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }
  
  // 如果有 token 且还未添加异步路由
  if (token && !hasAddedAsyncRoutes) {
    // 获取用户权限列表
    const permissionsStr = Cookies.get('permissions', { withConverter: false })
    const permissions = permissionsStr ? JSON.parse(permissionsStr) : []
    
    // 动态添加异步路由
    addAsyncRoutes(permissions)
    
    // 添加完路由后，重新导航到目标路由
    next({ ...to, replace: true })
    return
  }
  
  // 检查是否有访问该路由的权限
  const permissionsStr = Cookies.get('permissions', { withConverter: false })
  const permissions = permissionsStr ? JSON.parse(permissionsStr) : []
  
  if (!hasPermission(to, permissions)) {
    // 如果没有权限，重定向到首页或 403 页面
    next('/users')
    return
  }
  
  next()
})

export default router
