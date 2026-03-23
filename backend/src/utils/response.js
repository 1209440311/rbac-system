// src/utils/response.js
const success = (res, data = null, message = '成功') => {
  res.json({
    code: 0,
    message,
    data
  })
}

const fail = (res, message = '失败', code = 500, data = null) => {
  res.status(code === 0 ? 500 : code).json({
    code,
    message,
    data
  })
}

module.exports = { success, fail }