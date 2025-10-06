# 监控模块提取指南 (Monitoring Module Extraction Guide)

本文档描述如何将监控功能从 `web-bot-react` 主项目中提取到一个新的独立仓库中。

## 概述 (Overview)

监控模块包含 Starknet 和 Stacks 区块链的实时交易监控功能。提取为独立项目后，可以：
- 独立开发和维护监控功能
- 降低主项目的复杂度
- 便于专注于监控功能的优化和扩展
- 独立部署和扩展

## 需要提取的文件列表 (Files to Extract)

### 1. 监控视图组件 (View Components)
```
src/views/StarknetMonitor.tsx          # Starknet 监控页面 (422 行)
src/views/stacks/index.tsx             # Stacks 监控主页 (323 行)
src/views/stacks/Alex.tsx              # Stacks Alex DEX 监控 (722 行)
src/views/stacks/Dex.tsx               # Stacks DEX 监控 (128 行)
```

### 2. API 接口层 (API Layer)
```
src/api/starknet.ts                    # Starknet API (188 行)
src/api/stacks.ts                      # Stacks API (378 行)
```

### 3. 相关文档 (Documentation)
```
MONITORING_ENHANCEMENTS.md             # 监控功能增强说明
STACKS_MONITORING_GUIDE.md            # Stacks 监控指南 (如果存在)
```

## 新项目结构 (New Project Structure)

```
blockchain-monitor/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── starknet.ts              # Starknet API
│   │   └── stacks.ts                # Stacks API
│   ├── components/
│   │   ├── Layout.tsx               # 简化的布局组件
│   │   └── Navigation.tsx           # 导航栏
│   ├── views/
│   │   ├── Home.tsx                 # 主页/仪表板
│   │   ├── StarknetMonitor.tsx      # Starknet 监控
│   │   └── stacks/
│   │       ├── index.tsx            # Stacks 监控主页
│   │       ├── Alex.tsx             # Alex DEX 监控
│   │       └── Dex.tsx              # DEX 监控
│   ├── router/
│   │   └── index.tsx                # 路由配置
│   ├── types/
│   │   └── blockchain.ts            # 区块链相关类型定义
│   ├── utils/
│   │   └── format.ts                # 格式化工具函数
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── .gitignore
├── README.md
└── MONITORING_ENHANCEMENTS.md
```

## 依赖项 (Dependencies)

### 核心依赖 (Core Dependencies)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.3",
    "antd": "^5.23.3",
    "@ant-design/icons": "^6.1.0",
    "axios": "^1.7.9"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.11",
    "typescript": "~5.6.2",
    "@eslint/js": "^9.17.0",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "typescript-eslint": "^8.18.2"
  }
}
```

### 不需要的依赖 (Dependencies NOT Needed)
以下依赖在主项目中使用，但监控项目不需要：
- `crypto-js` - 加密相关
- `js-cookie` - Cookie 管理（认证相关）
- `@element-plus/*` - Element Plus 组件（未使用）
- Backend API 认证相关的依赖

## 需要创建的新文件 (New Files to Create)

### 1. package.json
```json
{
  "name": "blockchain-monitor",
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
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.11",
    "typescript": "~5.6.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@eslint/js": "^9.17.0",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "typescript-eslint": "^8.18.2",
    "globals": "^15.14.0"
  }
}
```

### 2. src/App.tsx
```tsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from './router';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;
```

### 3. src/main.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 4. src/router/index.tsx
```tsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/views/Home';
import StarknetMonitor from '@/views/StarknetMonitor';
import StacksMonitor from '@/views/stacks';
import StacksAlex from '@/views/stacks/Alex';
import StacksDex from '@/views/stacks/Dex';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "starknet",
        element: <StarknetMonitor />,
      },
      {
        path: "stacks",
        element: <StacksMonitor />,
      },
      {
        path: "stacks/alex",
        element: <StacksAlex />,
      },
      {
        path: "stacks/dex",
        element: <StacksDex />,
      },
    ],
  },
]);

export default router;
```

### 5. src/components/Layout.tsx
```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navigation from './Navigation';

const { Header, Content } = AntLayout;

const Layout: React.FC = () => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0 }}>
        <Navigation />
      </Header>
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;
```

### 6. src/components/Navigation.tsx
```tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { DashboardOutlined, MonitorOutlined } from '@ant-design/icons';

const Navigation: React.FC = () => {
  const location = useLocation();

  const items: MenuProps['items'] = [
    {
      label: <Link to="/">首页</Link>,
      key: '/',
      icon: <DashboardOutlined />,
    },
    {
      label: <Link to="/starknet">Starknet监控</Link>,
      key: '/starknet',
      icon: <MonitorOutlined />,
    },
    {
      label: 'Stacks监控',
      key: 'stacks',
      icon: <MonitorOutlined />,
      children: [
        {
          label: <Link to="/stacks">交易监控</Link>,
          key: '/stacks',
        },
        {
          label: <Link to="/stacks/alex">Alex DEX</Link>,
          key: '/stacks/alex',
        },
        {
          label: <Link to="/stacks/dex">DEX 监控</Link>,
          key: '/stacks/dex',
        },
      ],
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={items}
      style={{ lineHeight: '64px' }}
    />
  );
};

export default Navigation;
```

### 7. src/views/Home.tsx
```tsx
import React from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import { 
  MonitorOutlined, 
  ApiOutlined, 
  DashboardOutlined 
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ marginBottom: '20px' }}>
        <Title level={2}>
          <DashboardOutlined /> 区块链监控系统
        </Title>
        <Paragraph>
          实时监控 Starknet 和 Stacks 区块链网络的交易活动。
          本系统使用公共 API，无需认证即可查看实时交易数据。
        </Paragraph>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Link to="/starknet">
            <Card 
              hoverable
              style={{ textAlign: 'center' }}
            >
              <Statistic
                title="Starknet 监控"
                value="实时交易"
                prefix={<MonitorOutlined />}
              />
              <Paragraph type="secondary" style={{ marginTop: 16 }}>
                监控 Starknet 网络交易，支持多类型筛选和实时刷新
              </Paragraph>
            </Card>
          </Link>
        </Col>
        <Col span={12}>
          <Link to="/stacks">
            <Card 
              hoverable
              style={{ textAlign: 'center' }}
            >
              <Statistic
                title="Stacks 监控"
                value="DEX & 交易"
                prefix={<ApiOutlined />}
              />
              <Paragraph type="secondary" style={{ marginTop: 16 }}>
                监控 Stacks 网络交易和 DEX 活动，识别 DeFi 协议
              </Paragraph>
            </Card>
          </Link>
        </Col>
      </Row>

      <Card style={{ marginTop: 20 }}>
        <Title level={4}>功能特性</Title>
        <ul>
          <li>✅ 实时监控 Starknet 和 Stacks 区块链交易</li>
          <li>✅ 多条件筛选（交易类型、状态）</li>
          <li>✅ 自动刷新功能（30秒间隔）</li>
          <li>✅ 分页展示（支持 3、5、10、50、100 条/页）</li>
          <li>✅ 交易详情展示和地址复制</li>
          <li>✅ DEX 平台自动识别</li>
          <li>✅ 响应式设计，适配各种屏幕尺寸</li>
        </ul>
      </Card>
    </div>
  );
};

export default Home;
```

### 8. vite.config.ts
```typescript
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
```

### 9. tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### 10. tsconfig.app.json
```json
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
```

### 11. README.md
```markdown
# Blockchain Monitor - 区块链监控系统

实时监控 Starknet 和 Stacks 区块链网络的交易活动。

## 功能特性

- 🔍 **实时监控** - 监控 Starknet 和 Stacks 区块链交易
- 🔄 **自动刷新** - 可配置的自动刷新（默认30秒）
- 🎯 **多条件筛选** - 按交易类型、状态进行筛选
- 📊 **分页展示** - 灵活的分页选项（3、5、10、50、100条/页）
- 🏷️ **平台识别** - 自动识别 DEX 平台和协议
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 技术栈

- React 18 + TypeScript
- Vite
- Ant Design 5.x
- React Router v6
- Axios

## 快速开始

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 开发模式
\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本
\`\`\`bash
npm run build
\`\`\`

### 预览生产构建
\`\`\`bash
npm run preview
\`\`\`

## 项目结构

\`\`\`
src/
├── api/              # API 接口
├── components/       # 公共组件
├── views/           # 页面组件
├── router/          # 路由配置
└── types/           # 类型定义
\`\`\`

## API 数据源

- **Starknet**: Voyager API (https://api.voyager.online/beta)
- **Stacks**: Hiro API (https://api.mainnet.hiro.so)

均为公共免费 API，无需认证。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## License

MIT
```

### 12. .gitignore
```
# Logs
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

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## 修改步骤 (Extraction Steps)

### 步骤 1: 创建新仓库
```bash
# 在 GitHub 上创建新仓库 'blockchain-monitor'
# 克隆新仓库
git clone https://github.com/mumugogoing/blockchain-monitor.git
cd blockchain-monitor
```

### 步骤 2: 初始化项目
```bash
# 创建基本项目结构
mkdir -p src/{api,components,views/stacks,router,types,utils}
mkdir public

# 创建配置文件（使用上述模板）
# - package.json
# - vite.config.ts
# - tsconfig.json
# - tsconfig.app.json
# - tsconfig.node.json
# - .gitignore
# - README.md
```

### 步骤 3: 复制监控相关文件
从 `web-bot-react` 项目复制以下文件到新项目：

```bash
# API 文件
cp ../web-bot-react/src/api/starknet.ts src/api/
cp ../web-bot-react/src/api/stacks.ts src/api/

# 视图组件
cp ../web-bot-react/src/views/StarknetMonitor.tsx src/views/
cp ../web-bot-react/src/views/stacks/index.tsx src/views/stacks/
cp ../web-bot-react/src/views/stacks/Alex.tsx src/views/stacks/
cp ../web-bot-react/src/views/stacks/Dex.tsx src/views/stacks/

# 文档
cp ../web-bot-react/MONITORING_ENHANCEMENTS.md .
```

### 步骤 4: 创建新文件
根据上述模板创建以下新文件：
- src/App.tsx
- src/main.tsx
- src/router/index.tsx
- src/components/Layout.tsx
- src/components/Navigation.tsx
- src/views/Home.tsx
- index.html

### 步骤 5: 修改导入路径
更新所有文件中的导入路径，移除任何对主项目特定模块的依赖：

```typescript
// 原导入
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// 应该移除（监控项目不需要认证）
```

### 步骤 6: 安装依赖并测试
```bash
npm install
npm run dev
```

### 步骤 7: 构建和验证
```bash
npm run build
npm run preview
```

## 主项目需要的修改 (Changes to Main Project)

完成提取后，需要从 `web-bot-react` 主项目中移除监控相关代码：

### 1. 删除文件
```bash
rm src/views/StarknetMonitor.tsx
rm -rf src/views/stacks/
rm src/api/starknet.ts
rm src/api/stacks.ts
rm MONITORING_ENHANCEMENTS.md
```

### 2. 更新 src/router/index.tsx
移除监控相关路由：
```typescript
// 删除这些导入
import StarknetMonitor from '@/views/StarknetMonitor';
import StacksMonitor from '@/views/stacks';
import StacksAlex from '@/views/stacks/Alex';
import StacksDex from '@/views/stacks/Dex';

// 删除这些路由配置
{
  path: "monitor",
  element: <StarknetMonitor />,
},
{
  path: "stacks",
  element: <StacksMonitor />,
},
{
  path: "stacks/alex",
  element: <StacksAlex />,
},
{
  path: "stacks/dex",
  element: <StacksDex />,
},
```

### 3. 更新 src/components/Navigation.tsx
移除监控菜单项：
```typescript
// 删除这些菜单项
{
  label: <Link to="/monitor">Starknet监控</Link>,
  key: '/monitor',
},
{
  label: <Link to="/stacks">Stacks监控</Link>,
  key: '/stacks',
},
```

### 4. 更新 README.md
从主项目文档中移除监控功能的描述。

## 部署建议 (Deployment Recommendations)

### 开发环境
```bash
npm run dev
# 访问 http://localhost:3000
```

### 生产部署 - Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 生产部署 - Nginx
```nginx
server {
    listen 80;
    server_name monitor.yourdomain.com;
    
    root /var/www/blockchain-monitor/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 环境变量
新项目不需要环境变量，因为使用的是公共 API。

## 优势 (Benefits)

1. **独立开发** - 监控功能可以独立开发和维护
2. **降低复杂度** - 主项目代码量减少，更易维护
3. **独立部署** - 可以独立部署到不同的服务器
4. **专注优化** - 可以专注于监控功能的性能优化
5. **易于扩展** - 添加新的区块链监控更容易
6. **无认证依赖** - 不依赖主项目的认证系统

## 未来增强 (Future Enhancements)

- [ ] 添加 WebSocket 实时推送
- [ ] 添加交易提醒功能
- [ ] 支持更多区块链（Ethereum, BSC 等）
- [ ] 添加数据可视化图表
- [ ] 添加交易统计分析
- [ ] 导出功能（CSV, JSON）
- [ ] 添加搜索和过滤历史记录
- [ ] 支持自定义监控规则

## 联系方式 (Contact)

如有问题，请提交 Issue 或 Pull Request。

---

**注意**: 这是一个提取指南文档。实际创建新仓库时，请按照上述步骤执行。
