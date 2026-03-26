const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  // 获取 Authorization header
  const authHeader = req.headers.authorization

  // 如果没有 Authorization header，返回 401 错误
  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: '未提供 token'
    })
  }

  // 提取 Bearer token
  const token = authHeader.split(' ')[1] // 格式：Bearer <token>

  // 如果没有 token，返回 401 错误
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供 token'
    })
  }

  try {
    // 验证 token 是否有效，并解码
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mock-jwt-secret-for-demo')

    // 将解码后的用户信息附加到请求对象上
    req.user = decoded

    // 放行请求
    next()
  } catch (err) {
    // 如果 token 无效或过期，返回 403 错误
    return res.status(403).json({
      code: 403,
      message: 'token 无效或已过期'
    })
  }
}

module.exports = authMiddleware