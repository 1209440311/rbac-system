// service/userService.mock.js — 内存 Mock 版本（无需数据库，用于演示）
const store = require('../db/mockStore')

// 查询所有用户（带分页）
const getUsers = async (page = 1, pageSize = 10) => {
    const { users, roles } = store
    const total = users.length
    const offset = (page - 1) * pageSize
    // 按 id 倒序后分页
    const rows = users
        .slice()
        .sort((a, b) => b.id - a.id)
        .slice(offset, offset + pageSize)
        .map(u => {
            const role = roles.find(r => r.id === u.role_id)
            return { id: u.id, username: u.username, role_id: u.role_id, role: role ? role.name : null }
        })
    return { total, rows }
}

// 新建用户
const createUser = async (username, password, roleId = 3) => {
    if (!username || !password) {
        const err = new Error('用户名和密码不能为空')
        err.code = 400
        throw err
    }
    const exist = store.users.find(u => u.username === username)
    if (exist) {
        const err = new Error('用户名已存在')
        err.code = 409
        throw err
    }
    const id = store.getNextId()
    store.users.push({ id, username, password, role_id: Number(roleId) })
    return id
}

// 更新用户名
const updateUser = async (id, username) => {
    if (!username) {
        const err = new Error('用户名不能为空')
        err.code = 400
        throw err
    }
    const target = store.users.find(u => u.id == id)
    if (!target) {
        const err = new Error('用户不存在')
        err.code = 404
        throw err
    }
    const dup = store.users.find(u => u.username === username && u.id != id)
    if (dup) {
        const err = new Error('用户名已存在')
        err.code = 409
        throw err
    }
    target.username = username
    return { affectedRows: 1 }
}

// 删除用户
const deleteUser = async (id) => {
    const idx = store.users.findIndex(u => u.id == id)
    if (idx === -1) {
        const err = new Error('用户不存在')
        err.code = 404
        throw err
    }
    store.users.splice(idx, 1)
    return { affectedRows: 1 }
}

// 更新用户角色
const updateUserRole = async (userId, roleId) => {
    if (!userId || !roleId) {
        const err = new Error('用户 ID 和角色 ID 不能为空')
        err.code = 400
        throw err
    }
    const user = store.users.find(u => u.id == userId)
    if (!user) {
        const err = new Error('用户不存在')
        err.code = 404
        throw err
    }
    const role = store.roles.find(r => r.id == roleId)
    if (!role) {
        const err = new Error('角色不存在')
        err.code = 404
        throw err
    }
    user.role_id = Number(roleId)
    return { affectedRows: 1 }
}

// 根据用户名查用户
const getUserByUsername = async (username) => {
    const { users, roles } = store
    const user = users.find(u => u.username === username)
    if (!user) return null
    const role = roles.find(r => r.id === user.role_id)
    return { ...user, role: role ? role.name : null }
}

// 查询用户权限
const getUserPermissions = async (userId) => {
    const user = store.users.find(u => u.id == userId)
    if (!user) return []
    return store.rolePermissions
        .filter(rp => rp.role_id === user.role_id)
        .map(rp => {
            const p = store.permissions.find(p => p.id === rp.permission_id)
            return p ? p.code : null
        })
        .filter(Boolean)
}

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserByUsername,
    getUserPermissions
}
