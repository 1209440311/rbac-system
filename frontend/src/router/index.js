import { createRouter, createWebHistory } from 'vue-router'
import { hasPermission, filterAsyncRoutes } from '../utils/permission.js'
import Cookies from 'js-cookie'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Users from '../views/Users.vue'

// 公开路由（无需登录）
export const constantRoutes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register }
]

// 需要权限控制的路由
export const asyncRoutes = [
  {
    path: '/',
    redirect: '/users' // 守卫已保证有 token 才能到达，直接跳首页
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true, permission: 'user:view', title: '用户管理', icon: '👥', menuVisible: true }
  },
  {
    path: '/system',
    name: 'System',
    redirect: '/system/roles',
    meta: { requiresAuth: true, permission: 'system:view', title: '系统管理', icon: '🛠️', menuVisible: true },
    children: [
      {
        path: 'roles',
        name: 'Roles',
        component: Users, // 暂时复用 Users 组件
        meta: { requiresAuth: true, permission: 'role:view', title: '角色管理', icon: '🔐', menuVisible: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
})

let hasAddedAsyncRoutes = false

// 读取用户权限列表
const getPermissions = () => {
  const str = Cookies.get('permissions', { withConverter: false })
  return str ? JSON.parse(str) : []
}

export function addAsyncRoutes(permissions) {
  filterAsyncRoutes(asyncRoutes, permissions).forEach(route => router.addRoute(route))
  hasAddedAsyncRoutes = true
}

// 公开路由白名单
const PUBLIC_PATHS = new Set(['/login', '/register'])

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')

  // 公开页面：已登录跳首页，未登录直接放行
  if (PUBLIC_PATHS.has(to.path)) {
    return token ? next('/users') : next()
  }

  // 未登录：跳转登录页
  if (!token) {
    return next({ path: '/login', replace: true })
  }

  const permissions = getPermissions()

  // 已登录但异步路由未注册：动态添加后重新导航
  if (!hasAddedAsyncRoutes) {
    addAsyncRoutes(permissions)
    return next({ ...to, replace: true })
  }

  // 无权限：跳转登录页
  if (!hasPermission(to, permissions)) {
    return next('/login')
  }

  next()
})

export default router
