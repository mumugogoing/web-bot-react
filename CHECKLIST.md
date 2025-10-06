# 监控模块提取执行清单

**项目**: 从 web-bot-react 提取监控功能到 blockchain-monitor  
**日期**: ________________  
**执行人**: ________________

---

## 📋 前期准备

- [ ] 已阅读 INDEX.md 了解整体方案
- [ ] 已阅读 QUICK_REFERENCE.md 快速指南
- [ ] 本地已安装 Node.js 18+ (`node --version`)
- [ ] 本地已安装 Git (`git --version`)
- [ ] 有 GitHub 账号和仓库创建权限
- [ ] 已备份主项目（可选但推荐）

---

## 🚀 第一阶段：创建新项目 (15分钟)

### 步骤 1: 创建 GitHub 仓库
- [ ] 访问 https://github.com/new
- [ ] 仓库名: `blockchain-monitor`
- [ ] 描述: `区块链交易实时监控系统 - Starknet & Stacks`
- [ ] 可见性: Public
- [ ] **不要**勾选 "Initialize this repository with a README"
- [ ] 点击 "Create repository"
- [ ] 复制仓库 URL: `https://github.com/你的用户名/blockchain-monitor.git`

### 步骤 2: 初始化本地项目
- [ ] 创建项目目录: `mkdir blockchain-monitor && cd blockchain-monitor`
- [ ] 初始化 Git: `git init && git branch -M main`
- [ ] 创建目录结构: `mkdir -p src/{api,components,views/stacks,router} public`

### 步骤 3: 创建配置文件
参考 SETUP_NEW_MONITORING_PROJECT.md，创建以下文件：

- [ ] `.gitignore`
- [ ] `package.json`
- [ ] `vite.config.ts`
- [ ] `tsconfig.json`
- [ ] `tsconfig.app.json`
- [ ] `tsconfig.node.json`
- [ ] `eslint.config.js`
- [ ] `index.html`

### 步骤 4: 从主项目复制文件
源项目路径: ________________

- [ ] `src/api/starknet.ts` → `blockchain-monitor/src/api/starknet.ts`
- [ ] `src/api/stacks.ts` → `blockchain-monitor/src/api/stacks.ts`
- [ ] `src/views/StarknetMonitor.tsx` → `blockchain-monitor/src/views/StarknetMonitor.tsx`
- [ ] `src/views/stacks/index.tsx` → `blockchain-monitor/src/views/stacks/index.tsx`
- [ ] `src/views/stacks/Alex.tsx` → `blockchain-monitor/src/views/stacks/Alex.tsx`
- [ ] `src/views/stacks/Dex.tsx` → `blockchain-monitor/src/views/stacks/Dex.tsx`
- [ ] `MONITORING_ENHANCEMENTS.md` → `blockchain-monitor/MONITORING_ENHANCEMENTS.md`

### 步骤 5: 创建新的源文件
参考 SETUP_NEW_MONITORING_PROJECT.md 步骤5-8，创建：

- [ ] `src/vite-env.d.ts`
- [ ] `src/index.css`
- [ ] `src/main.tsx`
- [ ] `src/App.tsx`
- [ ] `src/router/index.tsx`
- [ ] `src/components/Layout.tsx`
- [ ] `src/components/Navigation.tsx`
- [ ] `src/views/Home.tsx`
- [ ] `README.md`

---

## 🧪 第二阶段：测试新项目 (10分钟)

### 步骤 6: 安装依赖
- [ ] 运行: `npm install`
- [ ] 等待安装完成（约1-2分钟）
- [ ] 检查是否有错误

### 步骤 7: 开发环境测试
- [ ] 运行: `npm run dev`
- [ ] 访问: http://localhost:3000
- [ ] 验证首页显示正常
- [ ] 验证路由：
  - [ ] `/` - 首页
  - [ ] `/starknet` - Starknet监控
  - [ ] `/stacks` - Stacks监控主页
  - [ ] `/stacks/alex` - Alex DEX
  - [ ] `/stacks/dex` - DEX监控
- [ ] 测试功能：
  - [ ] 数据加载（可能是模拟数据）
  - [ ] 筛选功能
  - [ ] 分页功能
  - [ ] 自动刷新（可选）

### 步骤 8: 生产构建测试
- [ ] 停止开发服务器（Ctrl+C）
- [ ] 运行: `npm run build`
- [ ] 检查构建成功
- [ ] 运行: `npm run preview`
- [ ] 验证预览正常

---

## 📤 第三阶段：推送到 GitHub (5分钟)

### 步骤 9: 提交代码
- [ ] 运行: `git add .`
- [ ] 运行: `git commit -m "Initial commit: Blockchain monitoring system"`
- [ ] 添加远程仓库: `git remote add origin <你的仓库URL>`
- [ ] 推送: `git push -u origin main`
- [ ] 在 GitHub 上验证代码已推送

---

## 🧹 第四阶段：清理主项目 (15分钟)

**警告**: 建议先确认新项目完全正常后再执行此步骤！

### 步骤 10: 删除监控文件
主项目路径: ________________

- [ ] 删除: `src/views/StarknetMonitor.tsx`
- [ ] 删除: `src/views/stacks/index.tsx`
- [ ] 删除: `src/views/stacks/Alex.tsx`
- [ ] 删除: `src/views/stacks/Dex.tsx`
- [ ] 删除整个目录: `src/views/stacks/`
- [ ] 删除: `src/api/starknet.ts`
- [ ] 删除: `src/api/stacks.ts`
- [ ] （可选）删除: `MONITORING_ENHANCEMENTS.md`

### 步骤 11: 更新 src/router/index.tsx
- [ ] 打开文件: `src/router/index.tsx`
- [ ] 删除导入：
  ```typescript
  import StarknetMonitor from '@/views/StarknetMonitor';
  import StacksMonitor from '@/views/stacks';
  import StacksAlex from '@/views/stacks/Alex';
  import StacksDex from '@/views/stacks/Dex';
  ```
- [ ] 删除路由配置：
  - [ ] `/monitor` 路由
  - [ ] `/stacks` 路由
  - [ ] `/stacks/alex` 路由
  - [ ] `/stacks/dex` 路由
- [ ] 保存文件

### 步骤 12: 更新 src/components/Navigation.tsx
- [ ] 打开文件: `src/components/Navigation.tsx`
- [ ] 删除菜单项：
  ```typescript
  {
    label: <Link to="/monitor">Starknet监控</Link>,
    key: '/monitor',
  },
  {
    label: <Link to="/stacks">Stacks监控</Link>,
    key: '/stacks',
  },
  ```
- [ ] 保存文件

### 步骤 13: 更新 README.md
- [ ] 打开: `README.md`
- [ ] 删除或更新"区块链监控"相关描述
- [ ] （可选）添加链接到新的 blockchain-monitor 项目
- [ ] 保存文件

### 步骤 14: 测试主项目
- [ ] 运行: `npm run dev`
- [ ] 验证应用正常启动
- [ ] 测试其他功能（登录、交易等）
- [ ] 确认没有报错
- [ ] （可选）运行: `npm run build` 验证构建

### 步骤 15: 提交主项目更改
- [ ] 运行: `git status` 查看更改
- [ ] 运行: `git add .`
- [ ] 运行: `git commit -m "refactor: Extract monitoring module to separate repository"`
- [ ] 运行: `git push`

---

## 🚀 第五阶段：部署（可选）

### 部署新的监控项目

#### 选项 A: Vercel（推荐，最简单）
- [ ] 访问 https://vercel.com
- [ ] 连接 GitHub 账号
- [ ] 导入 blockchain-monitor 仓库
- [ ] 默认配置即可（Vite项目）
- [ ] 点击部署
- [ ] 获得部署URL: ________________

#### 选项 B: Netlify
- [ ] 访问 https://netlify.com
- [ ] 连接 GitHub 账号
- [ ] 导入 blockchain-monitor 仓库
- [ ] 构建命令: `npm run build`
- [ ] 发布目录: `dist`
- [ ] 点击部署
- [ ] 获得部署URL: ________________

#### 选项 C: 自己的服务器
- [ ] 在服务器上克隆仓库
- [ ] 运行 `npm install`
- [ ] 运行 `npm run build`
- [ ] 配置 Nginx（参考文档）
- [ ] 启动服务

---

## ✅ 最终验证

### 新项目验证
- [ ] 本地开发环境正常
- [ ] 生产构建成功
- [ ] 代码已推送到 GitHub
- [ ] （可选）已成功部署
- [ ] 所有功能正常工作

### 主项目验证
- [ ] 监控代码已删除
- [ ] 路由已更新
- [ ] 导航已更新
- [ ] README已更新
- [ ] 应用正常运行
- [ ] 其他功能不受影响
- [ ] 代码已提交推送

---

## 📊 项目信息记录

### 新项目
- **仓库URL**: ________________
- **部署URL**: ________________
- **创建日期**: ________________

### 耗时记录
- **准备阶段**: ______ 分钟
- **创建阶段**: ______ 分钟
- **测试阶段**: ______ 分钟
- **推送阶段**: ______ 分钟
- **清理阶段**: ______ 分钟
- **总耗时**: ______ 分钟

### 遇到的问题及解决方案
1. ________________
   解决: ________________

2. ________________
   解决: ________________

---

## 📝 备注

_在此记录任何额外的注意事项、修改或待办事项_

________________
________________
________________
________________

---

## 🎉 完成！

恭喜！你已成功将监控功能提取为独立项目。

### 后续建议
- [ ] 为新项目添加 CI/CD
- [ ] 添加单元测试
- [ ] 性能优化
- [ ] 添加更多区块链支持
- [ ] 收集用户反馈

---

**签字确认**:

执行人: ________________  日期: ________________

审核人: ________________  日期: ________________

---

**文档版本**: 1.0  
**参考文档**: INDEX.md, QUICK_REFERENCE.md, SETUP_NEW_MONITORING_PROJECT.md
