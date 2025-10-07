# 快速执行指南 - 监控模块分离

本文档提供快速执行步骤，用于将监控功能提取到新仓库。

## 准备工作

1. 确保你有 GitHub 仓库创建权限
2. 确保本地安装了 Node.js 18+
3. 准备好主项目的路径

## 快速步骤

### 步骤 1: 创建新仓库

访问 https://github.com/new 创建仓库：
- 仓库名: `blockchain-monitor`
- 描述: `区块链交易实时监控系统 - Starknet & Stacks`
- 可见性: Public
- 不要初始化 README

### 步骤 2: 执行创建脚本

将以下脚本保存为 `create_monitor_project.sh` 并执行：

```bash
#!/bin/bash

# 配置
PROJECT_NAME="blockchain-monitor"
WEB_BOT_PATH="/home/runner/work/web-bot-react/web-bot-react"  # 修改为实际路径
GITHUB_USER="mumugogoing"  # 修改为你的GitHub用户名

echo "🚀 开始创建监控项目..."

# 创建项目目录
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# 初始化 Git
git init
git branch -M main

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p src/{api,components,views/stacks,router}
mkdir public

# 创建 .gitignore
cat > .gitignore << 'GITIGNORE'
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
GITIGNORE

# 创建 package.json
cat > package.json << 'PACKAGE'
{
  "name": "blockchain-monitor",
  "private": true,
  "version": "1.0.0",
  "description": "Blockchain transaction monitoring system for Starknet and Stacks",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.3",
    "antd": "^5.23.3",
    "@ant-design/icons": "^6.1.0",
    "axios": "^1.7.9"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.11",
    "typescript": "~5.6.2",
    "@eslint/js": "^9.17.0",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "typescript-eslint": "^8.18.2",
    "globals": "^15.14.0"
  }
}
PACKAGE

# 复制配置文件从指南文档
echo "📋 创建配置文件..."
# vite.config.ts
cat > vite.config.ts << 'VITECONFIG'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
VITECONFIG

# tsconfig.json
cat > tsconfig.json << 'TSCONFIG'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
TSCONFIG

# tsconfig.app.json
cat > tsconfig.app.json << 'TSCONFIGAPP'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
TSCONFIGAPP

# tsconfig.node.json
cat > tsconfig.node.json << 'TSCONFIGNODE'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
TSCONFIGNODE

# index.html
cat > index.html << 'HTML'
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>区块链监控系统</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

# 从原项目复制监控文件
echo "📦 复制监控文件..."
if [ -d "$WEB_BOT_PATH" ]; then
    cp "$WEB_BOT_PATH/src/api/starknet.ts" src/api/
    cp "$WEB_BOT_PATH/src/api/stacks.ts" src/api/
    cp "$WEB_BOT_PATH/src/views/StarknetMonitor.tsx" src/views/
    cp "$WEB_BOT_PATH/src/views/stacks/index.tsx" src/views/stacks/
    cp "$WEB_BOT_PATH/src/views/stacks/Alex.tsx" src/views/stacks/
    cp "$WEB_BOT_PATH/src/views/stacks/Dex.tsx" src/views/stacks/
    cp "$WEB_BOT_PATH/MONITORING_ENHANCEMENTS.md" . 2>/dev/null || true
    echo "✅ 文件复制完成"
else
    echo "⚠️  警告: 源项目路径不存在，请手动复制文件"
fi

# 提示用户手动完成剩余步骤
cat << 'INSTRUCTIONS'

⚡ 下一步操作:

1. 从 SETUP_NEW_MONITORING_PROJECT.md 复制创建以下文件:
   - src/vite-env.d.ts
   - src/index.css
   - src/main.tsx
   - src/App.tsx
   - src/router/index.tsx
   - src/components/Layout.tsx
   - src/components/Navigation.tsx
   - src/views/Home.tsx
   - eslint.config.js
   - README.md

2. 安装依赖:
   npm install

3. 测试运行:
   npm run dev

4. 推送到 GitHub:
   git add .
   git commit -m "Initial commit: Blockchain monitoring system"
   git remote add origin https://github.com/GITHUB_USER/blockchain-monitor.git
   git push -u origin main

详细步骤请参考 SETUP_NEW_MONITORING_PROJECT.md
INSTRUCTIONS

echo ""
echo "✅ 项目结构创建完成!"
echo "📂 项目位置: $(pwd)"
```

### 步骤 3: 手动创建源文件

由于脚本中包含React组件代码较多，请参考 `SETUP_NEW_MONITORING_PROJECT.md` 文档中的步骤5-8，创建以下文件：

1. `src/vite-env.d.ts`
2. `src/index.css`
3. `src/main.tsx`
4. `src/App.tsx`
5. `src/router/index.tsx`
6. `src/components/Layout.tsx`
7. `src/components/Navigation.tsx`
8. `src/views/Home.tsx`
9. `eslint.config.js`
10. `README.md`

### 步骤 4: 安装和测试

```bash
cd blockchain-monitor
npm install
npm run dev
```

### 步骤 5: 推送到GitHub

```bash
git add .
git commit -m "Initial commit: Blockchain monitoring system"
git remote add origin https://github.com/你的用户名/blockchain-monitor.git
git push -u origin main
```

## 验证清单

运行后检查：
- [ ] `npm run dev` 可以启动
- [ ] 访问 http://localhost:3000 可以看到首页
- [ ] 所有路由可以访问（/, /starknet, /stacks, /stacks/alex, /stacks/dex）
- [ ] API调用正常（可能会有模拟数据）
- [ ] `npm run build` 构建成功
- [ ] 代码已推送到GitHub

## 清理主项目

完成新项目创建后，在主项目执行：

```bash
cd /path/to/web-bot-react

# 删除监控文件
rm src/views/StarknetMonitor.tsx
rm -rf src/views/stacks
rm src/api/starknet.ts
rm src/api/stacks.ts

# 手动编辑以下文件，删除监控相关导入和路由:
# - src/router/index.tsx
# - src/components/Navigation.tsx
# - README.md
```

## 需要手动编辑的文件

### src/router/index.tsx
删除这些行：
```typescript
import StarknetMonitor from '@/views/StarknetMonitor';
import StacksMonitor from '@/views/stacks';
import StacksAlex from '@/views/stacks/Alex';
import StacksDex from '@/views/stacks/Dex';

// 以及对应的路由配置
```

### src/components/Navigation.tsx
删除这些菜单项：
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

## 文档参考

详细信息请参考：
- `MONITORING_EXTRACTION_GUIDE.md` - 完整的提取指南
- `SETUP_NEW_MONITORING_PROJECT.md` - 详细的安装步骤
- `MONITORING_SEPARATION_SUMMARY.md` - 总体方案总结

## 常见问题

**Q: 新项目运行报错找不到模块？**
A: 确保已运行 `npm install`，并检查所有文件是否创建完整。

**Q: API调用失败？**
A: 使用的是公共API，可能因网络原因失败，会自动降级到模拟数据。

**Q: 构建失败？**
A: 检查 TypeScript 配置和所有导入路径是否正确。

**Q: 主项目删除监控代码后运行失败？**
A: 确保已更新路由和导航配置，删除了所有监控相关的导入。

## 支持

如遇到问题，请：
1. 查看详细文档
2. 检查所有步骤是否正确执行
3. 查看错误日志
4. 提交 Issue

---

**预计总时间**: 30-60分钟（取决于网络速度和熟练程度）
