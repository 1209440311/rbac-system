<template>
    <div class="users-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1>用户管理</h1>
        </div>

        <!-- 新增用户区域 -->
        <div class="add-user-section">
            <div class="add-user-box">
                <input v-model="newName" class="add-input" placeholder="请输入用户名" />
                <button v-permission="'user:create'" @click="addUser" class="btn btn-add">
                    <i class="icon-plus"></i>
                    新增用户
                </button>
            </div>
        </div>

        <!-- 用户列表表格 -->
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="th-id">ID</th>
                        <th class="th-username">用户名</th>
                        <th class="th-role">角色</th>
                        <th class="th-actions">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id"
                        :class="{ 'editing-row': editingUserId === user.id || changingRoleId === user.id }">
                        <td class="cell-id">#{{ user.id }}</td>

                        <!-- 用户名列 -->
                        <td class="cell-username">
                            <template v-if="editingUserId !== user.id">
                                <span class="user-avatar">{{ user.username?.charAt(0)?.toUpperCase() }}</span>
                                <span class="username-text">{{ user.username }}</span>
                            </template>
                            <input v-else v-model="editUserName" class="edit-input" placeholder="请输入用户名"
                                @keyup.enter="saveEdit" />
                        </td>

                        <!-- 角色列 -->
                        <td class="cell-role">
                            <span v-if="changingId !== user.id" class="role-tag" :class="'role-' + user.role">
                                <span class="role-dot"></span>
                                {{ getRoleName(user.role) }}
                            </span>
                            <select v-else v-model="changingRoleId" class="role-select-edit">
                                <option value="1">管理员</option>
                                <option value="2">编辑</option>
                                <option value="3">普通用户</option>
                            </select>
                        </td>

                        <!-- 操作列 -->
                        <td class="cell-actions">
                            <div class="action-group">
                                <!-- 编辑用户名操作 -->
                                <template v-if="editingUserId !== user.id">
                                    <button v-permission="'user:update'" @click="startEdit(user)"
                                        class="btn btn-edit">
                                        ✏️ 编辑
                                    </button>
                                </template>
                                <template v-else>
                                    <button v-permission="'user:update'" @click="saveEdit" class="btn btn-save">✓
                                        保存</button>
                                    <button @click="cancelEdit" class="btn btn-cancel">取消</button>
                                </template>

                                <!-- 修改角色操作 -->
                                <template v-if="changingId !== user.id">
                                    <button v-permission="'user:update'" @click="startChangeRole(user)"
                                        class="btn btn-role">
                                        🔑 角色
                                    </button>
                                </template>
                                <template v-else>
                                    <button v-permission="'user:update'" @click="saveRole" class="btn btn-save">✓
                                        保存</button>
                                    <button @click="cancelChangeRole" class="btn btn-cancel">取消</button>
                                </template>

                                <!-- 删除操作 -->
                                <button v-if="editingUserId !== user.id && changingRoleId !== user.id"
                                    v-permission="'user:delete'" @click="deleteUser(user.id)" class="btn btn-delete">
                                    🗑️ 删除
                                </button>
                            </div>
                        </td>
                    </tr>

                    <!-- 空数据提示 -->
                    <tr v-if="users.length === 0">
                        <td colspan="4" class="empty-data">暂无用户数据</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分页控件 -->
        <div class="pagination-container">
            <div class="pagination">
                <button :disabled="currentPage === 1" @click="currentPage--" class="page-btn">
                    <i class="icon-arrow-left"></i>
                    上一页
                </button>
                <button v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }"
                    @click="currentPage = page" class="page-num">
                    {{ page }}
                </button>
                <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-btn">
                    下一页
                    <i class="icon-arrow-right"></i>
                </button>
            </div>
            <div class="pagination-info">
                <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条</span>
                <select v-model="pageSize" @change="handlePageSizeChange" class="page-size-select">
                    <option :value="5">5 条/页</option>
                    <option :value="10">10 条/页</option>
                    <option :value="20">20 条/页</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import request from '../axios/axios.js'
import Cookies from 'js-cookie'

const router = useRouter()

const users = ref([])
const newName = ref('')
const editingUserId = ref(null) // 正在编辑用户名的用户 ID
const editUserName = ref('')
const changingId = ref(null) // 正在修改的用户 ID
const changingRoleId = ref(null) // 正在修改的角色 ID
const changingRoleName = ref('') // 修改中的角色
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 总页数（基于服务端返回的 total）
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 翻页
watch(currentPage, () => {
    getData()
})

// 切换每页条数：重置页码并重新请求
const handlePageSizeChange = () => {
    currentPage.value = 1
    getData()
}

// 角色名称映射
const roleNames = {
    admin: '管理员',
    editor: '编辑',
    user: '普通用户'
}

// 获取角色名称
const getRoleName = (role) => {
    return roleNames[role] || role
}

// 获取用户列表
const getData = async () => {
    try {
        const { data } = await request.get('/api/users', {
            params: { page: currentPage.value, pageSize: pageSize.value }
        })
        users.value = data.data.rows
        total.value = data.data.total
    } catch (error) {
        console.error('获取用户列表失败', error)
    }
}

// 添加新用户
const addUser = async () => {
    if (!newName.value.trim()) {
        alert('用户名不能为空')
        return
    }

    try {
        await request.post('/api/users', {
            username: newName.value,
            password: '123',
            role: '3' // 默认创建为普通用户
        })
        newName.value = '' // 清空输入框
        getData() // 重新获取用户列表
    } catch (error) {
        console.error('新增用户失败', error)
        alert('新增失败：' + (error.response?.data?.message || '未知错误'))
    }
}

// 开始编辑用户名
const startEdit = (user) => {
    editingUserId.value = user.id
    editUserName.value = user.username
    // 编辑用户名时，关闭角色修改
    changingRoleId.value = null
    changingRoleName.value = ''
}

// 保存编辑的用户名
const saveEdit = async () => {
    if (!editUserName.value.trim()) {
        alert('用户名不能为空')
        return
    }

    try {
        await request.put(`/api/users/${editingUserId.value}`, {
            username: editUserName.value
        })
        editingUserId.value = null
        editUserName.value = ''
        getData() // 重新获取用户列表
    } catch (error) {
        console.error('更新用户失败', error)
        alert('更新失败：' + (error.response?.data?.message || '未知错误'))
    }
}

// 取消编辑用户名
const cancelEdit = () => {
    editingUserId.value = null
    editUserName.value = ''
}

// 开始修改角色
const startChangeRole = (user) => {
    console.log(user);
    changingId.value = user.id
    changingRoleId.value = user.role_id
    changingRoleName.value = user.role || 'user'
    // 修改角色时，关闭用户名编辑
    editingUserId.value = null
    editUserName.value = ''
}

// 保存修改的角色
const saveRole = async () => {
    // 验证角色权限
    const validRoles = ['admin', 'editor', 'user']
    if (!validRoles.includes(changingRoleName.value)) {
        alert('无效的角色')
        return
    }

    try {
        await request.put(`/api/users/role`, {
            userId: Number(changingId.value),
            roleId: Number(changingRoleId.value),
        })
        changingId.value = null
        changingRoleId.value = null
        changingRoleName.value = ''
        getData() // 重新获取用户列表
    } catch (error) {
        console.error('更新角色失败', error)
        alert('更新失败：' + (error.response?.data?.message || '未知错误'))
    }
}

// 取消修改角色
const cancelChangeRole = () => {
    changingId.value = null
    changingRoleId.value = null
    changingRoleName.value = ''
}

// 删除用户
const deleteUser = async (userId) => {
    if (confirm('确定要删除这个用户吗？')) {
        try {
            await request.delete(`/api/users/${userId}`)
            getData() // 重新获取用户列表
        } catch (error) {
            console.error('删除用户失败', error)
        }
    }
}

// 退出登录（已在 Sidebar 组件中处理）
const logout = () => {
  Cookies.remove('token')
  Cookies.remove('user')
  Cookies.remove('permissions')
  router.push('/login')
}

onMounted(() => {
    getData()
})
</script>

<style lang="scss" scoped>
// ==================== 变量 ====================
$primary: #667eea;
$primary-dark: #764ba2;
$primary-grad: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
$success: #28a745;
$info: #17a2b8;
$danger: #dc3545;
$secondary: #6c757d;
$border-radius: 12px;
$card-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
$transition: all 0.2s ease;

// ==================== 容器 ====================
.users-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 40px);
}

// ==================== 页面头部 ====================
.page-header {
    margin-bottom: 20px;
    padding: 24px;
    background: $primary-grad;
    border-radius: $border-radius;
    box-shadow: 0 4px 12px rgba($primary, 0.3);
    color: white;
    
    h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }
}

// ==================== 新增用户区域 ====================
.add-user-section {
    background: white;
    padding: 16px 20px;
    border-radius: $border-radius;
    box-shadow: $card-shadow;
    margin-bottom: 16px;

    .add-user-box {
        display: flex;
        gap: 12px;
        align-items: center;
    }
}

.add-input {
    flex: 1;
    padding: 10px 16px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
    transition: $transition;
    outline: none;

    &:focus {
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba($primary, 0.1);
    }
}

// ==================== 表格 ====================
.table-container {
    background: white;
    border-radius: $border-radius;
    overflow: hidden;
    box-shadow: $card-shadow;
    margin-bottom: 16px;
    max-height: 470px;
    overflow-y: auto;
    // 自定义滚动条样式
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba($primary, 0.4);
        border-radius: 3px;
        &:hover { background: rgba($primary, 0.7); }
    }
}

.data-table {
    width: 100%;
    border-collapse: collapse;

    thead {
        background: $primary-grad;
        color: white;
        position: sticky;
        top: 0;
        z-index: 2;

        th {
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.3px;
        }
    }

    td {
        padding: 14px 16px;
        border-bottom: 1px solid #e8eaef;
        font-size: 14px;
    }

    tbody {
        
        tr {
            transition: $transition;
    
            &:hover {
                background-color: #f8f9ff;
            }
    
            &.editing-row {
                background-color: #fffbea;
            }
    
            &:last-child td {
                border-bottom: none;
            }
        }
    }
}

// 列宽
.th-id {
    width: 70px;
}

.th-role {
    width: 130px;
}

.th-actions {
    width: 260px;
}

// 单元格
.cell-id {
    color: #aaa;
    font-family: 'Courier New', monospace;
    font-weight: 500;
    font-size: 13px;
}

.cell-username {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
}

.cell-actions {
    white-space: nowrap;

    .action-group {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: nowrap;
    }
}

// ==================== 用户头像 ====================
.user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: $primary-grad;
    color: white;
    font-size: 14px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.username-text {
    color: #333;
    font-size: 14px;
}

// ==================== 编辑输入框 ====================
.edit-input {
    width: 100%;
    padding: 8px 12px;
    border: 2px solid $primary;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: $transition;

    &:focus {
        border-color: $primary-dark;
        box-shadow: 0 0 0 3px rgba($primary, 0.1);
    }
}

// ==================== 角色标签 ====================
.role-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    transition: $transition;

    .role-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        display: inline-block;
    }

    &.role-admin {
        background: linear-gradient(135deg, #ffe6e6, #ffcdd2);
        color: #c62828;
        border: 1px solid #ef9a9a;

        .role-dot {
            background: $danger;
        }
    }

    &.role-editor {
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        color: #1565c0;
        border: 1px solid #90caf9;

        .role-dot {
            background: #007bff;
        }
    }

    &.role-user {
        background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
        color: #424242;
        border: 1px solid #bdbdbd;

        .role-dot {
            background: $secondary;
        }
    }
}

.role-select-edit {
    padding: 6px 10px;
    border: 2px solid $primary;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    background: white;
    color: #333;
    cursor: pointer;
    outline: none;
    height: 34px;
    appearance: auto;
    -webkit-appearance: auto;
    min-width: 100px;

    &:focus {
        border-color: $primary-dark;
        box-shadow: 0 0 0 3px rgba($primary, 0.1);
    }
}

// ==================== 按钮 ====================
.btn {
    padding: 7px 14px;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: $transition;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    flex-shrink: 0;
    line-height: 1;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(black, 0.15);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &.btn-edit {
        background: linear-gradient(135deg, $success, #20c997);
        color: white;

        &:hover {
            background: linear-gradient(135deg, darken($success, 5%), #1aa179);
        }
    }

    &.btn-save {
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;

        &:hover {
            background: linear-gradient(135deg, #0069d9, #004a99);
        }
    }

    &.btn-cancel {
        background: $secondary;
        color: white;

        &:hover {
            background: darken($secondary, 8%);
        }
    }

    &.btn-role {
        background: linear-gradient(135deg, $info, #138496);
        color: white;

        &:hover {
            background: linear-gradient(135deg, darken($info, 5%), #0f6674);
        }
    }

    &.btn-delete {
        background: linear-gradient(135deg, $danger, #c82333);
        color: white;

        &:hover {
            background: linear-gradient(135deg, darken($danger, 5%), #a71d2a);
        }
    }

    &.btn-add {
        background: $primary-grad;
        color: white;
        padding: 10px 22px;
        font-size: 14px;

        &:hover {
            background: linear-gradient(135deg, darken($primary, 5%), darken($primary-dark, 5%));
            box-shadow: 0 6px 16px rgba($primary, 0.4);
        }
    }
}

// ==================== 分页 ====================
.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 20px;
    background: white;
    border-radius: $border-radius;
    box-shadow: $card-shadow;

    .pagination {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    .pagination-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
}

.page-btn {
    padding: 8px 16px;
    background: $primary-grad;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: $transition;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba($primary, 0.3);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}

.page-num {
    min-width: 36px;
    padding: 8px 12px;
    background-color: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: $transition;

    &:hover {
        background-color: #e9ecef;
        border-color: #adb5bd;
    }

    &.active {
        background: $primary-grad;
        color: white;
        border-color: $primary;
    }
}

.page-info {
    color: $secondary;
    font-size: 13px;
}

.page-size-select {
    padding: 7px 10px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    background-color: white;
    color: #333;
    cursor: pointer;
    outline: none;
    height: 36px;
    appearance: auto;
    -webkit-appearance: auto;
    min-width: 90px;

    &:focus {
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba($primary, 0.1);
    }
}

// ==================== 空数据 ====================
.empty-data {
    text-align: center;
    padding: 60px 20px;
    color: #bbb;
    font-size: 14px;
}
</style>
