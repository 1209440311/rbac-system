const userService = require('../service/userService')

const checkPermission = (permission) => {
    return async (req, res, next) => {
        const user = req.user // token解析出来的用户信息
        // 查询权限
        const permissions = await userService.getUserPermissions(user.id)
        console.log('查询权限====>', permissions);
        if (!permissions.includes(permission)) {
            return res.status(403).json({
                code: 403,
                message: `当前用户角色是 ${user.role}，无权执行该操作`
            })
        }

        next()
    }
};
module.exports = checkPermission
