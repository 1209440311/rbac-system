// service/authService.js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userService = require('./userService')

const SECRET = process.env.JWT_SECRET || 'mock-jwt-secret-for-demo'

// 注册
const register = async (username, password) => {
    const existUser = await userService.getUserByUsername(username)
    if (existUser) {
        throw new Error('用户名已存在')
    }
    // 直接传明文密码，让 service 层处理加密
    // 1 admin
    // 2 editor
    // 3 user
    // 注册就是 admin
    const result = await userService.createUser(username, password, 1)
    return result.insertId
}

// 登录
const login = async (username, password) => {
    const user = await userService.getUserByUsername(username)
    if (!user) {
        throw new Error('用户不存在')
    }
    
    if (password !== user.password) {
        throw new Error('密码错误')
    }
    
    // const isMatch = await bcrypt.compare(password, user.password)
    // if (!isMatch) {
    //     throw new Error('密码错误')
    // }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET,
        { expiresIn: '2h' }
    )
    
    // 查询权限
    const permissions = await userService.getUserPermissions(user.id)
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        },
        permissions
    }
}

module.exports = {
    register,
    login
}