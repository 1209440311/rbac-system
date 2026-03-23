const authService = require('../service/authService')
const { success, fail } = require('../utils/response')
// 注册
exports.register = async (req, res, next) => {
    try {
        const { username, password } = req.body
        const userId = await authService.register(username, password)
        success(res, { userId }, '注册成功')
    } catch (err) {
        next(err, '注册失败')
    }
}

// 登录
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body
        const result = await authService.login(username, password)
        success(res, result, '登录成功')
    } catch (err) {
        next(err, '登录失败')
    }
}