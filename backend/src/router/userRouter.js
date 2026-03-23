// （路由分发）
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');
const checkPermission = require('../middleware/checkPermission')
const authMiddleware = require('../middleware/auth')
// const roleMiddleware = require('../middleware/role')

// 注册接口（公开）
router.post('/register', authController.register)
// 登录接口（公开）
router.post('/login', authController.login)
// 需要认证的用户操作接口
router.get('', authMiddleware, userController.getUsers)
router.post('', authMiddleware, userController.createUser)
// 只有权限为 user:delete 可以更改用户角色（必须放在 /:id 之前）
router.put('/role', authMiddleware, checkPermission('user:delete'), userController.updateUserRole)
// 更新用户
router.put('/:id', authMiddleware, userController.updateUser)
// 只有权限为 user:delete 可以删除用户
router.delete('/:id', authMiddleware, checkPermission('user:delete'), userController.deleteUser)

module.exports = router;