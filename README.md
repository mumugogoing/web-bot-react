# STX Trading Platform - React Frontend

这是一个基于 React 和 Ant Design 构建的前端应用，用于与 STX 区块链进行交互。

## 功能特性

- 资产余额查看和自动刷新
- XYK 交易功能（买入/卖出）
- 交易状态查询
- CEX 订单创建
- Zest 操作功能
- **Starknet 交易监控** - 实时监控 Starknet 网络上的所有交易（无需登录）

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
│   └── starknet.ts   # Starknet 区块链 API
├── components/       # 公共组件
│   ├── Layout.tsx    # 布局组件
│   └── Navigation.tsx # 导航组件
├── router/           # 路由配置
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── Home.tsx      # 首页
│   ├── StarknetMonitor.tsx  # Starknet 监控页面
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
2. 点击"开始交易"进入交易页面
3. 在交易页面可以查看资产余额、执行交易等操作
4. 点击"Starknet 监控"查看实时区块链交易信息（无需登录）

## 环境配置

项目使用 `.env` 文件配置 API 地址：
```
VITE_BASE_API=http://localhost:8080
```

## 页面路由

- `/` - 首页
- `/swap` - 交易页面
- `/monitor` - Starknet 交易监控页面

## Starknet 监控功能

监控页面提供以下功能：
- **实时交易监控** - 查看 Starknet 网络上的最新交易
- **交易详情** - 显示交易哈希、类型、状态、区块高度等信息
- **平台识别** - 自动识别交易所在的 DEX 平台（Jediswap、MySwap、10KSwap 等）
- **代币信息** - 显示交易涉及的代币对和数量
- **地址信息** - 显示发送地址和合约地址，支持一键复制
- **自动刷新** - 可选择开启每 30 秒自动刷新交易数据
- **搜索过滤** - 支持按交易哈希搜索
- **外部链接** - 点击交易可跳转到 Voyager 区块浏览器查看详情

数据来源：Voyager (Starknet 区块浏览器公共 API)，完全免费，无需登录。