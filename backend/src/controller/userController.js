// 控制层（接收请求，处理请求，返回响应）
const userService = require('../service/userService')
const { success, fail } = require('../utils/response')

// 查询
exports.getUsers = async (req, res, next) => {
   try {
       const page = parseInt(req.query.page) || 1
       const pageSize = parseInt(req.query.pageSize) || 10
       const result = await userService.getUsers(page, pageSize)
        success(res, result)
    } catch (err) {
        next(err, '查询用户失败')
    }
}

// 创建
exports.createUser = async (req, res, next) => {
   try {
       const { username, password, role } = req.body
       const id = await userService.createUser(username, password, role)
        success(res, { id }, '创建用户成功')
    } catch (err) {
        next(err, '创建用户失败')
    }
}

// 更新
exports.updateUser = async (req, res, next) => {
   try {
       const { username } = req.body
       const result = await userService.updateUser(req.params.id, username)
        success(res, result, '更新用户成功')
    } catch (err) {
        next(err, '更新用户失败')
    }
}

// 删除 
exports.deleteUser= async (req, res, next) => {
   try {
       const { id } = req.params
       const result = await userService.deleteUser(id)
        success(res, result, '删除用户成功')
    } catch (err) {
        next(err, '删除用户失败')
    }
}

// 更新用户角色
exports.updateUserRole = async (req, res, next) => {
    try {
        console.log('updateRole called:', req.body.userId, req.body.roleId)
        const { userId, roleId } = req.body
        const result = await userService.updateUserRole(userId, roleId)
        success(res, result, '角色更新成功')
    } catch (err) {
        console.error('updateRole error:', err)
        next(err, '角色更新失败')
    }
}

