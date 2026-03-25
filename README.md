# 🚀 RBAC 权限管理系统

一个基于 **前后端分离架构** 的权限管理系统，实现了完整的 **用户-角色-权限（RBAC）模型**。

---

## ✨ 项目亮点

- 🔐 JWT 登录认证（无状态）
- 🧠 RBAC 权限模型（User → Role → Permission）
- 🧩 动态路由（基于权限生成）
- 📂 动态菜单渲染
- 🔘 按钮级权限控制（v-permission）
- 🛡️ 接口级权限控制（checkPermission）
- ⚙️ 中间件架构（auth + permission）

---

## 🛠 技术栈

### 前端
- Vue 3 + Vite
- Vue Router（动态路由）
- Axios（请求封装）
- js-cookie

### 后端
- Node.js + Express
- MySQL
- JWT（认证）
- Middleware（权限控制）

---

## 🧠 系统架构
请求 → authMiddleware → checkPermission → controller

---

## 🔐 权限模型
User → Role → Permission

- 用户绑定角色
- 角色绑定权限
- 权限控制接口访问

---

## 🚀 本地运行

### 前端

- cd frontend
- npm install
- npm run dev

### 后端

- cd backend
- npm install
- node app.js

---

## 🌐 在线体验（待部署）

---

## 📌 项目说明
- 本项目重点不在于“功能堆叠”，而是：
- 构建一个 可扩展的权限系统架构

---

## 📈 后续规划
- 权限数据改为数据库动态管理
- 支持多角色
- 日志审计系统
- 菜单权限统一管理

 ---
 
## 👨‍💻 作者
- Yangjin

```bash