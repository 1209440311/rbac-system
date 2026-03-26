// 内存模拟数据库（Mock Store）
// 服务重启后数据会重置，仅用于演示

// 预置角色
const roles = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'editor' },
  { id: 3, name: 'user' },
]

// 预置权限
const permissions = [
  { id: 1, code: 'user:read' },
  { id: 2, code: 'user:create' },
  { id: 3, code: 'user:update' },
  { id: 4, code: 'user:delete' },
]

// 角色-权限关联
// admin: 拥有全部权限
// editor: 读/创建/更新
// user: 只读
const rolePermissions = [
  { role_id: 1, permission_id: 1 },
  { role_id: 1, permission_id: 2 },
  { role_id: 1, permission_id: 3 },
  { role_id: 1, permission_id: 4 },
  { role_id: 2, permission_id: 1 },
  { role_id: 2, permission_id: 2 },
  { role_id: 2, permission_id: 3 },
  { role_id: 3, permission_id: 1 },
]

// 预置用户（密码明文，仅供演示）
// admin123 / editor123 / viewer123
const users = [
  { id: 1, username: 'admin',  password: 'admin123',  role_id: 1 },
  { id: 2, username: 'editor', password: 'editor123', role_id: 2 },
  { id: 3, username: 'viewer', password: 'viewer123', role_id: 3 },
]

let nextId = 4
const getNextId = () => nextId++

module.exports = { users, roles, permissions, rolePermissions, getNextId }
