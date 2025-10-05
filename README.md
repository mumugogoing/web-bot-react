# STX Trading Platform - React Frontend

这是一个基于 React 和 Ant Design 构建的前端应用，用于与 STX 区块链进行交互。本项目集成了 gin-web 后端的登录认证系统。

## 功能特性

- **用户认证系统** - 基于 JWT 的登录认证，集成 gin-web 后端
- 资产余额查看和自动刷新
- XYK 交易功能（买入/卖出）
- 交易状态查询
- CEX 订单创建
- Zest 操作功能
- **Starknet 交易监控** - 实时监控 Starknet 网络上的所有交易（需要管理员权限）
- **Stacks 交易监控** - 实时监控 Stacks 区块链上的所有交易（需要管理员权限）
- **基于角色的权限控制** - 三级用户权限控制（管理员、普通用户、访客）

## 技术栈

- React 18 (TypeScript)
- Vite 构建工具
- Ant Design UI 组件库
- React Router v6
- Axios HTTP 客户端
- JWT Token 认证

## 项目结构

```
src/
├── api/              # API 接口定义
│   ├── auth/         # 认证相关 API (登录、登出、获取用户信息)
│   ├── dex/          # DEX 交易相关 API
│   ├── starknet.ts   # Starknet 区块链 API
│   └── stacks.ts     # Stacks 区块链 API
├── components/       # 公共组件
│   ├── Layout.tsx    # 布局组件
│   ├── Navigation.tsx # 导航组件（显示登录/登出按钮）
│   └── ProtectedRoute.tsx # 权限保护路由
├── contexts/         # React Context
│   └── AuthContext.tsx # 认证上下文（管理登录状态和用户信息）
├── router/           # 路由配置
├── types/            # TypeScript 类型定义
│   └── auth.ts       # 认证相关类型
├── utils/            # 工具函数
│   ├── cookies.ts    # Token 管理
│   └── request.ts    # Axios 请求拦截器（自动添加 Token、处理 Token 刷新）
├── views/            # 页面组件
│   ├── Home.tsx      # 首页
│   ├── login/        # 登录页面
│   ├── StarknetMonitor.tsx  # Starknet 监控页面
│   ├── StacksMonitor.tsx    # Stacks 监控页面
│   └── swap/         # 交易相关页面
└── App.tsx           # 根组件
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

本项目集成了以下 gin-web 后端 API：

### 认证 API
- `POST /base/login` - 用户登录
- `POST /base/logout` - 用户登出
- `POST /base/refreshToken` - 刷新 Token
- `GET /base/user/status` - 获取用户状态（用于判断是否需要验证码）
- `GET /base/captcha` - 获取验证码
- `POST /user/info` - 获取当前用户信息

### Token 管理
- JWT Token 存储在 localStorage 中
- 请求拦截器自动在请求头中添加 `Authorization: Bearer {token}`
- Token 过期时自动调用刷新接口
- 刷新失败时清除 Token 并跳转到登录页

## 页面路由

- `/login` - 登录页面（未登录用户可访问）
- `/` - 首页（所有用户可访问）
- `/swap` - 交易页面（需要普通用户或管理员权限）
- `/monitor` - Starknet 交易监控页面（需要管理员权限）
- `/stacks` - Stacks 交易监控页面（需要管理员权限）

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