// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('【错误日志】', err)

  // 如果 err 已经包含 code 和 message，则使用
  if (err.code && err.message) {
    return res.status(err.code >= 400 ? err.code : 500).json({
      code: err.code,
      message: err.message,
      data: err.data || null
    })
  }

  // 默认返回
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
    data: null
  })
}

module.exports = errorHandler