// 数据层（数据库连接模块）
const mysql = require('mysql2') // 引入 mysql2 库
// 创建 MySQL 连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

module.exports = pool
