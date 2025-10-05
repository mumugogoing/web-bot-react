# STX Trading Platform - React Frontend

这是一个基于 React 和 Ant Design 构建的前端应用，用于与 STX 区块链进行交互。

## 功能特性

- 资产余额查看和自动刷新
- XYK 交易功能（买入/卖出）
- 交易状态查询
- CEX 订单创建
- Zest 操作功能

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
├── components/       # 公共组件
├── router/           # 路由配置
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── Home.tsx      # 首页
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

## 环境配置

项目使用 `.env` 文件配置 API 地址：
```
VITE_BASE_API=http://localhost:8080
```

## 页面路由

- `/` - 首页
- `/swap` - 交易页面