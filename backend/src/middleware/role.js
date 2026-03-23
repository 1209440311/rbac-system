// 角色中间件
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        message: `当前用户角色是 ${req.user.role}，无权执行该操作，要求角色：${roles.join('、')}`
      })
    }
    next()
  }
}

module.exports = roleMiddleware