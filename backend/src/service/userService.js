// service/userService.js
const pool = require('../db')
const bcrypt = require('bcryptjs')

// 查询所有用户（带分页）
const getUsers = async (page = 1, pageSize = 10) => {
    try {
        const offset = (page - 1) * pageSize

        // 查询用户 + 角色名称
        const [rows] = await pool.promise().query(
            `
      SELECT u.id, u.username, u.role_id, r.name AS role
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id DESC
      LIMIT ?, ?
      `,
            [offset, pageSize]
        )

        // 查询总数
        const [[{ total }]] = await pool.promise().query(
            'SELECT COUNT(*) AS total FROM users'
        )

        return {
            total,
            rows, // 每条记录里有 id, username, role
        }

    } catch (err) {
        err.message = err.msg || '查询用户失败'
        throw err
    }
}

// 新建用户（加密密码）    
const createUser = async (username, password, roleId = 3) => {
    try {
        if (!username || !password) {
            const err = new Error('用户名和密码不能为空')
            err.code = 400
            throw err
        }

        // 检查用户是否已存在
        const existUser = await getUserByUsername(username)
        if (existUser) {
            const err = new Error('用户名已存在')
            err.code = 409
            throw err
        }

        // 密码加密
        // const hashedPassword = await bcrypt.hash(password, 10)
        // console.log('加密前:', password, '加密后:', hashedPassword)

        const [result] = await pool.promise().query(
            'INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)',
            [username, password, roleId]
        )
        return result.insertId
    } catch (err) {
        console.log(err)
        throw err
    }
}

// 更新用户
const updateUser = async (id, username) => {
    try {
        if (!username) {
            const err = new Error('用户名不能为空')
            err.code = 400
            throw err
        }

        // 检查用户名是否已存在（排除自己）
        const existUser = await getUserByUsername(username)
        if (existUser && existUser.id != id) {
            const err = new Error('用户名已存在')
            err.code = 409
            throw err
        }

        const [result] = await pool.promise().query(
            'UPDATE users SET username = ? WHERE id = ?',
            [username, id]
        )
        return result
    } catch (err) {
        err.message = err.msg || '更新用户失败'
        throw err
    }
}

// 删除用户
const deleteUser = async (id) => {
    try {
        const [result] = await pool.promise().query(
            'DELETE FROM users WHERE id = ?',
            [id]
        )
        return result
    } catch (err) {
        err.message = err.msg || '删除用户失败'
        throw err
    }
}

// 更新用户角色
const updateUserRole = async (userId, roleId) => {
    try {
        if (!userId || !roleId) {
            const err = new Error('用户 ID 和角色 ID 不能为空')
            err.code = 400
            throw err
        }
        
        // 检查用户是否存在
        const user = await getUserById(userId)
        if (!user) {
            const err = new Error('用户不存在')
            err.code = 404
            throw err
        }
        
        // 检查角色是否存在
        const role = await getRoleById(roleId)
        if (!role) {
            const err = new Error('角色不存在')
            err.code = 404
            throw err
        }
        
        const [result] = await pool.promise().query(
            'UPDATE users SET role_id = ? WHERE id = ?',
            [roleId, userId]
        )
        
        if (result.affectedRows === 0) {
            const err = new Error('更新失败，用户可能不存在')
            err.code = 404
            throw err
        }
        
        return result
    } catch (err) {
        if (!err.code) {
            err.message = err.msg || '更新角色失败'
            err.code = 500
        }
        throw err
    }
}

// 根据用户名查用户
const getUserByUsername = async (username) => {

    const [rows] = await pool.promise().query(
        `
    SELECT 
      u.id,
      u.username,
      u.password,
      u.role_id,
      r.name AS role
    FROM users u
    LEFT JOIN roles r
      ON u.role_id = r.id
    WHERE u.username = ?
    `,
        [username]
    )

    return rows.length ? rows[0] : null
}

// 根据 ID 查用户
const getUserById = async (userId) => {
    const [rows] = await pool.promise().query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
    )
    return rows.length ? rows[0] : null
}

// 根据 ID 查角色
const getRoleById = async (roleId) => {
    const [rows] = await pool.promise().query(
        'SELECT * FROM roles WHERE id = ?',
        [roleId]
    )
    return rows.length ? rows[0] : null
}


// 查询用户权限
const getUserPermissions = async (userId) => {

    const [rows] = await pool.promise().query(
        `
    SELECT p.code
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN users u ON u.role_id = rp.role_id
    WHERE u.id = ?
    `,
        [userId]
    )

    return rows.map(r => r.code)
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
