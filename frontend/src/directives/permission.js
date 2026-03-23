import Cookies from 'js-cookie'
export default {
  mounted(el, binding) {

    // 按钮需要的权限
    const requiredPermission = binding.value

    // 当前用户权限
    const permissions = JSON.parse(
      Cookies.get('permissions', { withConverter: false }) || '[]'
    )

    // 是否包含权限
    const hasPermission = permissions.includes(requiredPermission)

    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }

  }
}