// service/userService.js — 根据 USE_MOCK 环境变量自动切换数据源
// USE_MOCK=true  → 内存 Mock 数据（演示模式，无需数据库）
// USE_MOCK=false → 真实 MySQL 数据库（本地开发模式）

const USE_MOCK = process.env.USE_MOCK === 'true'
console.log(`[userService] 当前模式: ${USE_MOCK ? 'Mock（内存数据）' : 'Real（MySQL）'}`)

module.exports = USE_MOCK
    ? require('./userService.mock')
    : require('./userService.real')
