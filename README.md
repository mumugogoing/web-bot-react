# Web Bot React - Full-Stack Management System

这是一个基于 React 和 Ant Design 构建的全栈管理系统，集成了 gin-web 后端。项目实现了 webtool-vue 的所有核心功能，包括完整的系统管理、用户认证、权限控制等功能。

## 功能特性

### 用户认证系统
- **JWT 登录认证** - 完整的登录、登出、Token 刷新机制
- **验证码支持** - 集成图形验证码防止暴力破解
- **自动 Token 刷新** - Token 过期自动刷新，无感知续期
- **角色权限管理** - 基于后端角色的权限控制

### 系统管理功能（管理员专属）
- **用户管理** - 用户的增删改查、角色分配、状态管理
- **角色管理** - 角色的增删改查、权限分配
- **菜单管理** - 动态菜单配置、树形结构管理
- **接口管理** - API 接口的增删改查、分类管理
- **操作日志** - 系统操作日志查看、搜索、删除

### 个人中心
- **个人信息** - 查看和编辑个人资料
- **密码修改** - 安全的密码修改功能
- **消息中心** - 系统消息、通知查看和管理
- **消息状态** - 已读/未读标记、批量操作

### 交易功能
- **资产余额** - 实时查看和刷新
- **XYK 交易** - 买入/卖出操作
- **交易状态查询** - 实时查询交易状态
- **CEX 订单** - 创建交易所订单
- **Zest 操作** - DeFi 协议操作

### 区块链监控
- **Starknet 监控** - 实时监控 Starknet 网络交易（管理员权限）
- **Stacks 监控** - 实时监控 Stacks 区块链交易（管理员权限）
- **交易详情** - 完整的交易信息展示
- **平台识别** - 自动识别 DEX 平台

### 仪表板
- **数据统计** - 系统关键数据统计展示
- **未读消息** - 实时显示未读消息数量
- **快速访问** - 常用功能快速入口
- **功能说明** - 系统功能概览

## 技术栈

- **前端框架**: React 18 (TypeScript)
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5.x
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **状态管理**: React Context API
- **认证方式**: JWT Token
- **代码规范**: ESLint + TypeScript

## 项目结构

```
src/
├── api/                    # API 接口定义
│   ├── auth/               # 认证相关 API (登录、登出、用户信息)
│   ├── system/             # 系统管理 API
│   │   ├── users.ts        # 用户管理 API
│   │   ├── roles.ts        # 角色管理 API
│   │   ├── menus.ts        # 菜单管理 API
│   │   ├── apis.ts         # 接口管理 API
│   │   ├── messages.ts     # 消息管理 API
│   │   └── operationLogs.ts # 操作日志 API
│   ├── dex/                # DEX 交易相关 API
│   ├── starknet.ts         # Starknet 区块链 API
│   └── stacks.ts           # Stacks 区块链 API
├── components/             # 公共组件
│   ├── Layout.tsx          # 布局组件
│   ├── Navigation.tsx      # 导航组件（动态菜单、权限控制）
│   └── ProtectedRoute.tsx  # 权限保护路由
├── contexts/               # React Context
│   └── AuthContext.tsx     # 认证上下文（登录状态、用户信息）
├── router/                 # 路由配置
│   └── index.tsx           # 路由定义（权限路由）
├── types/                  # TypeScript 类型定义
│   ├── auth.ts             # 认证相关类型
│   └── system.ts           # 系统管理类型
├── utils/                  # 工具函数
│   ├── cookies.ts          # Token 管理
│   └── request.ts          # Axios 拦截器（Token、错误处理）
├── views/                  # 页面组件
│   ├── Dashboard.tsx       # 仪表板首页
│   ├── login/              # 登录页面
│   ├── profile/            # 个人中心
│   ├── system/             # 系统管理页面
│   │   ├── UserManagement.tsx      # 用户管理
│   │   ├── RoleManagement.tsx      # 角色管理
│   │   ├── MenuManagement.tsx      # 菜单管理
│   │   ├── ApiManagement.tsx       # 接口管理
│   │   ├── MessageCenter.tsx       # 消息中心
│   │   └── OperationLogManagement.tsx # 操作日志
│   ├── StarknetMonitor.tsx # Starknet 监控
│   ├── StacksMonitor.tsx   # Stacks 监控
│   └── swap/               # 交易相关页面
└── App.tsx                 # 根组件
```

## 开发环境搭建

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置后端 API 地址（`.env` 文件）：
   ```
   VITE_BASE_API=http://localhost:8080
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 构建生产版本：
   ```bash
   npm run build
   ```

## 使用说明

### 登录系统

1. 访问首页 (http://localhost:3000/)
2. 点击右上角"登录"按钮
3. 使用以下测试账号登录：
   - **超级管理员**: `super` / `123456`（可访问所有页面，包括 Starknet 和 Stacks 监控）
   - **访客用户**: `guest` / `123456`（只能访问首页）

4. 登录成功后：
   - 系统会自动保存 JWT Token
   - 导航栏会显示用户信息和角色
   - 可以访问权限允许的页面

5. 退出登录：
   - 点击用户名下拉菜单中的"退出登录"

### 权限保护

- **未登录用户**: 访问需要权限的页面时会被重定向到登录页
- **已登录但权限不足**: 会显示"访问受限"提示

## 环境配置

项目使用 `.env` 文件配置 API 地址：
```
VITE_BASE_API=http://localhost:8080
```

确保 gin-web 后端服务运行在此地址。

## 后端 API 集成

本项目与 gin-web 后端完全对接，实现了以下 API 模块：

### 认证 API
- `POST /base/login` - 用户登录
- `POST /base/logout` - 用户登出
- `POST /base/refreshToken` - 刷新 Token
- `GET /base/user/status` - 获取用户状态（验证码判断）
- `GET /base/captcha` - 获取图形验证码
- `POST /user/info` - 获取当前用户信息

### 用户管理 API
- `GET /user/list` - 获取用户列表
- `GET /user/list/:ids` - 根据 ID 获取用户
- `POST /user/create` - 创建用户
- `PATCH /user/update/:id` - 更新用户
- `PUT /user/changePwd` - 修改密码
- `DELETE /user/delete/batch` - 批量删除用户

### 角色管理 API
- `GET /role/list` - 获取角色列表
- `GET /role/list/:ids` - 根据 ID 获取角色
- `POST /role/create` - 创建角色
- `PATCH /role/update/:id` - 更新角色
- `DELETE /role/delete/batch` - 批量删除角色

### 菜单管理 API
- `GET /menu/tree` - 获取菜单树
- `GET /menu/list` - 获取菜单列表
- `POST /menu/create` - 创建菜单
- `PATCH /menu/update/:id` - 更新菜单
- `DELETE /menu/delete/batch` - 批量删除菜单
- `GET /menu/all/:roleId` - 获取角色的菜单
- `PATCH /menu/role/update/:roleId` - 更新角色菜单

### 接口管理 API
- `GET /api/list` - 获取接口列表
- `POST /api/create` - 创建接口
- `PATCH /api/update/:id` - 更新接口
- `DELETE /api/delete/batch` - 批量删除接口
- `GET /api/all/category/:roleId` - 获取角色接口树
- `PATCH /api/role/update/:roleId` - 更新角色接口

### 消息管理 API
- `GET /message/list` - 获取消息列表
- `GET /message/unRead/count` - 获取未读消息数量
- `PATCH /message/read/batch` - 批量标记已读
- `PATCH /message/deleted/batch` - 批量删除消息
- `PATCH /message/read/all` - 全部标记已读
- `PATCH /message/deleted/all` - 全部删除
- `POST /message/push` - 推送消息

### 操作日志 API
- `GET /operation/log/list` - 获取操作日志列表
- `DELETE /operation/log/delete/batch` - 批量删除日志

### Token 管理
- JWT Token 存储在 localStorage 中
- 请求拦截器自动在请求头中添加 `Authorization: Bearer {token}`
- Token 过期时自动调用刷新接口
- 刷新失败时清除 Token 并跳转到登录页

## 页面路由

### 公共路由
- `/login` - 登录页面（未登录用户可访问）
- `/` - 仪表板首页（所有已登录用户可访问）

### 用户路由（普通用户及以上）
- `/profile` - 个人中心
- `/swap` - 交易页面
- `/system/messages` - 消息中心

### 管理员路由（仅管理员）
- `/monitor` - Starknet 交易监控
- `/stacks` - Stacks 交易监控
- `/stacks/alex` - ALEX DEX 交易
- `/stacks/dex` - DEX 交易管理
- `/stacks/pending` - **待处理交易监控** (新功能)
- `/system/users` - 用户管理
- `/system/roles` - 角色管理
- `/system/menus` - 菜单管理
- `/system/apis` - 接口管理
- `/system/logs` - 操作日志

## 权限管理

系统基于 gin-web 后端的角色系统，提供三级用户权限：

1. **访客 (Guest)** - 可以访问首页
2. **普通用户 (User)** - 可以访问交易页面和首页
3. **管理员 (Admin/Super)** - 可以访问所有页面，包括 Starknet 和 Stacks 监控

**角色映射**：
- 后端 `super` 角色映射到前端 `admin` 权限
- 后端 `admin` 角色映射到前端 `admin` 权限
- 后端 `user` 角色映射到前端 `user` 权限
- 后端 `guest` 角色映射到前端 `guest` 权限

权限从后端获取并自动管理，前端不支持手动切换角色。

## Starknet 监控功能

监控页面提供以下功能：
- **实时交易监控** - 查看 Starknet 网络上的最新交易
- **交易详情** - 显示交易哈希、类型、状态、区块高度等信息
- **平台识别** - 自动识别交易所在的 DEX 平台（Jediswap、MySwap、10KSwap 等）
- **代币信息** - 显示交易涉及的代币对和数量
- **地址信息** - 显示发送地址和合约地址，支持一键复制
- **自动刷新** - 可选择开启每 30 秒自动刷新交易数据
- **搜索过滤** - 支持按交易哈希搜索
- **最新交易高亮** - 列表中第一条交易使用黄色背景突出显示
- **灵活分页** - 支持 3、5、8、20、50 条/页的分页选项
- **外部链接** - 点击交易可跳转到 Voyager 区块浏览器查看详情

数据来源：Voyager (Starknet 区块浏览器公共 API)，完全免费，无需登录。

## Stacks 监控功能

监控页面提供以下功能：
- **实时交易监控** - 查看 Stacks 区块链上的最新交易
- **交易详情** - 显示交易哈希、类型、状态、区块高度等信息
- **平台识别** - 自动识别 DeFi 平台（ALEX、Arkadiko、Stackswap 等）
- **交易类型** - 区分代币转账和合约调用
- **金额显示** - STX 代币转账显示具体数量
- **地址信息** - 显示发送地址和接收地址，支持一键复制
- **合约调用** - 显示合约函数名称和合约地址
- **自动刷新** - 可选择开启每 30 秒自动刷新交易数据
- **搜索过滤** - 支持按交易哈希搜索
- **最新交易高亮** - 列表中第一条交易使用黄色背景突出显示
- **灵活分页** - 支持 3、5、8、20、50 条/页的分页选项
- **外部链接** - 点击交易可跳转到 Hiro Explorer 区块浏览器查看详情

数据来源：Hiro API (Stacks 区块链公共 API)，完全免费，无需登录。

## Stacks 待处理交易监控功能 🆕

全新的实时监控系统，专门用于检测和自动处理待处理交易：

### 核心功能
- **毫秒级轮询** - 支持 100ms 到 2000ms 可配置间隔，快速响应待处理交易
- **自动提交** - 检测到后端 `singper: true` 信号时立即触发 xykserialize 交易
- **智能验证** - 提交前验证所有参数（amount、dx、dy、fee、quote）
- **重复预防** - 3 秒冷却期防止重复提交同一交易
- **活动日志** - 滚动显示最近 10 条监控事件，带毫秒级时间戳
- **防攻击保护** - 提交一次后自动关闭监控，防止被批量交易攻击
- **速率限制处理** - 自动检测并处理 API 速率限制

### 使用场景
1. **自动抢单** - 配置参数后开启自动提交，检测到交易立即执行
2. **手动监控** - 观察待处理交易，根据需要手动提交
3. **测试模式** - 低频率监控，分析交易模式

### 技术特点
- 前后端分离架构，私钥安全存储在后端
- 支持后端多线程监控模式
- 完整的错误处理和日志记录
- 实时状态显示和操作反馈

详细文档：
- [用户指南](PENDING_MONITOR_GUIDE.md)
- [实现总结](PENDING_MONITOR_SUMMARY.md)

## 从 webtool-vue 迁移的功能对比

本项目已实现 webtool-vue 的所有核心系统管理功能：

### ✅ 已实现功能

| webtool-vue 功能 | React 实现 | 说明 |
|-----------------|-----------|------|
| 首页仪表板 | ✅ Dashboard | 包含统计数据和快速访问入口 |
| 用户管理 | ✅ UserManagement | 完整的 CRUD 功能 |
| 角色管理 | ✅ RoleManagement | 完整的 CRUD 功能 |
| 菜单管理 | ✅ MenuManagement | 完整的 CRUD 功能 |
| 接口管理 | ✅ ApiManagement | 完整的 CRUD 功能 |
| 操作日志 | ✅ OperationLogManagement | 查看和删除功能 |
| 个人中心 | ✅ Profile | 个人信息和密码修改 |
| 消息中心 | ✅ MessageCenter | 消息查看、标记、删除 |
| 登录认证 | ✅ Login | JWT + 验证码 |
| 权限控制 | ✅ ProtectedRoute | 基于角色的访问控制 |
| Stacks 交易监控 | ✅ StacksMonitor | 区块链交易监控 |
| Starknet 交易监控 | ✅ StarknetMonitor | 区块链交易监控 |
| 交易功能 | ✅ AlexSwap | DEX 交易功能 |

### ⏳ 计划实现（可选）

| webtool-vue 功能 | 优先级 | 说明 |
|-----------------|-------|------|
| 数据字典管理 | 中 | 系统配置项管理 |
| 机器管理 | 低 | 服务器资源管理 |
| 状态机功能 | 低 | 工作流审批系统 |
| 文件上传组件 | 低 | 文件上传示例 |
| 测试页面 | 低 | 测试用例展示 |

### 💡 增强功能

React 版本相比 Vue 版本的改进：

1. **TypeScript 类型安全** - 完整的类型定义，减少运行时错误
2. **现代化 UI** - 使用 Ant Design 5.x 最新组件
3. **更好的代码组织** - 清晰的目录结构和模块划分
4. **优化的用户体验** - 流畅的交互和即时反馈
5. **响应式设计** - 适配各种屏幕尺寸
6. **自动 Token 刷新** - 无感知的会话续期

## 与 gin-web 后端对接说明

本项目完全兼容 [gin-web](https://github.com/piupuer/gin-web) 后端，所有 API 接口遵循 gin-web 的接口规范：

### 请求格式
- 认证请求需要在 Header 中携带 `Authorization: Bearer {token}`
- 请求体使用 JSON 格式
- 分页参数使用 `pageNum` 和 `pageSize`

### 响应格式
```json
{
  "code": 201,
  "data": {},
  "msg": "success"
}
```

### 状态码说明
- `201` - 请求成功
- `401` - 未授权（Token 无效或过期）
- `403` - 权限不足
- `其他` - 请求失败

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.tsx` 添加路由
3. 在 `src/components/Navigation.tsx` 添加导航菜单（如需要）
4. 使用 `ProtectedRoute` 包装需要权限的路由

### 调用后端 API

1. 在 `src/api/` 目录下创建 API 文件
2. 在 `src/types/` 定义相关类型
3. 使用 `request` 工具发起请求（自动处理 Token）

示例：
```typescript
import request from '@/utils/request';

export const getUsers = (params: UserListParams) =>
  request<ApiResponse<UserListResponse>>({
    url: '/user/list',
    method: 'get',
    params
  });
```

### 权限控制

在路由中使用 `ProtectedRoute` 组件：
```typescript
{
  path: "admin",
  element: (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminPage />
    </ProtectedRoute>
  ),
}
```

## 项目亮点

1. **完整的系统管理** - 实现了企业级系统所需的所有基础管理功能
2. **优雅的权限控制** - 基于角色的多级权限管理
3. **类型安全** - 完整的 TypeScript 类型定义
4. **现代化架构** - React 18 + Vite + Ant Design 5
5. **无缝对接后端** - 完全兼容 gin-web API 规范
6. **丰富的功能** - 从用户管理到区块链监控的全方位覆盖

## 许可证

MIT License