/**
 * 权限工具函数
 * 用于处理路由权限和菜单权限
 */

/**
 * 判断用户是否有指定路由的访问权限
 * @param {Object} route - 路由对象
 * @param {Array} permissions - 用户权限列表
 * @returns {Boolean} - 是否有权限
 */
export function hasPermission(route, permissions) {
  const requiredPermission = route.meta?.permission
  
  // 如果路由没有设置权限要求，则允许访问
  if (!requiredPermission) {
    return true
  }
  
  // 检查用户是否拥有该权限
  return permissions.includes(requiredPermission)
}

/**
 * 过滤异步路由，只保留用户有权限访问的路由
 * @param {Array} routes - 异步路由表
 * @param {Array} permissions - 用户权限列表
 * @returns {Array} - 过滤后的路由
 */
export function filterAsyncRoutes(routes, permissions) {
  const res = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    if (hasPermission(tmp, permissions)) {
      // 如果有子路由，递归过滤
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })
  
  return res
}

/**
 * 从路由表中生成菜单数据
 * @param {Array} routes - 路由表
 * @returns {Array} - 菜单数据
 */
export function generateMenu(routes) {
  const menuList = []
  
  routes.forEach(route => {
    // 只处理需要显示在菜单中的路由
    if (route.meta && route.meta.menuVisible !== false) {
      const menu = {
        path: route.path,
        name: route.name,
        title: route.meta.title || route.name,
        icon: route.meta.icon || '',
        redirect: route.redirect || null
      }
      
      // 如果有子路由且需要显示，递归生成子菜单
      if (route.children && route.children.length > 0) {
        menu.children = generateMenu(route.children)
      }
      
      menuList.push(menu)
    }
  })
  
  return menuList
}
