// 数据层（数据库连接模块）
const mysql = require('mysql2') // 引入 mysql2 库
// 创建 MySQL 连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234', // 修改为你设置的 MySQL 密码
    database: 'myapp'
})

module.exports = pool
