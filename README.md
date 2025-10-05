# STX Trading Platform - React Frontend

这是一个基于 React 和 Ant Design 构建的前端应用，用于与 STX 区块链进行交互。

## 功能特性

- 资产余额查看和自动刷新
- XYK 交易功能（买入/卖出）
- 交易状态查询
- CEX 订单创建
- Zest 操作功能
- **Starknet 交易监控** - 实时监控 Starknet 网络上的所有交易（无需登录）
- **Stacks 交易监控** - 实时监控 Stacks 区块链上的所有交易（无需登录）
- **权限管理系统** - 三级用户权限控制（管理员、普通用户、访客）

## 技术栈

- React 18 (TypeScript)
- Vite 构建工具
- Ant Design UI 组件库
- React Router v6
- Axios HTTP 客户端

## 项目结构

```
src/
├── api/              # API 接口定义
│   ├── dex/          # DEX 交易相关 API
│   ├── starknet.ts   # Starknet 区块链 API
│   └── stacks.ts     # Stacks 区块链 API
├── components/       # 公共组件
│   ├── Layout.tsx    # 布局组件
│   ├── Navigation.tsx # 导航组件
│   └── ProtectedRoute.tsx # 权限保护路由
├── contexts/         # React Context
│   └── AuthContext.tsx # 认证上下文
├── router/           # 路由配置
├── types/            # TypeScript 类型定义
│   └── auth.ts       # 认证相关类型
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── Home.tsx      # 首页
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

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

## 使用说明

1. 访问首页 (http://localhost:3000/)
2. 使用右上角的权限选择器切换用户角色（访客、普通用户、管理员）
3. 点击"开始交易"进入交易页面（需要普通用户或管理员权限）
4. 点击"Starknet 监控"查看 Starknet 区块链实时交易信息
5. 点击"Stacks 监控"查看 Stacks 区块链实时交易信息

## 环境配置

项目使用 `.env` 文件配置 API 地址：
```
VITE_BASE_API=http://localhost:8080
```

## 页面路由

- `/` - 首页（所有用户可访问）
- `/swap` - 交易页面（需要普通用户或管理员权限）
- `/monitor` - Starknet 交易监控页面（所有用户可访问）
- `/stacks` - Stacks 交易监控页面（所有用户可访问）

## 权限管理

系统提供三级用户权限：

1. **访客 (Guest)** - 可以访问首页和监控页面
2. **普通用户 (User)** - 可以访问交易页面和所有监控页面
3. **管理员 (Admin)** - 可以访问所有页面

权限设置会自动保存在浏览器的 localStorage 中。

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