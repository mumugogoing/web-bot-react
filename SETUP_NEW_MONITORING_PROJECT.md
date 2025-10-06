# 创建新监控项目的详细步骤

本文档提供了创建 `blockchain-monitor` 新项目的详细操作步骤。

## 前提条件

- Node.js 18+ 已安装
- Git 已安装
- 有 GitHub 账号访问权限

## 第一步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`blockchain-monitor`
3. 描述：`区块链交易实时监控系统 - Starknet & Stacks`
4. 选择 Public
5. 不要勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

## 第二步：初始化本地项目

```bash
# 创建项目目录
mkdir blockchain-monitor
cd blockchain-monitor

# 初始化 Git
git init
git branch -M main

# 创建目录结构
mkdir -p src/{api,components,views/stacks,router,types,utils}
mkdir public

# 创建 .gitignore
cat > .gitignore << 'EOF'
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
EOF
```

## 第三步：创建配置文件

### 1. package.json
```bash
cat > package.json << 'EOF'
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
EOF
```

### 2. vite.config.ts
```bash
cat > vite.config.ts << 'EOF'
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
EOF
```

### 3. tsconfig.json
```bash
cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
EOF
```

### 4. tsconfig.app.json
```bash
cat > tsconfig.app.json << 'EOF'
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
EOF
```

### 5. tsconfig.node.json
```bash
cat > tsconfig.node.json << 'EOF'
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
EOF
```

### 6. eslint.config.js
```bash
cat > eslint.config.js << 'EOF'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    },
  },
)
EOF
```

### 7. index.html
```bash
cat > index.html << 'EOF'
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
EOF
```

## 第四步：从原项目复制文件

```bash
# 假设原项目在 ../web-bot-react
WEB_BOT_PATH="../web-bot-react"

# 复制 API 文件
cp $WEB_BOT_PATH/src/api/starknet.ts src/api/
cp $WEB_BOT_PATH/src/api/stacks.ts src/api/

# 复制视图文件
cp $WEB_BOT_PATH/src/views/StarknetMonitor.tsx src/views/
cp $WEB_BOT_PATH/src/views/stacks/index.tsx src/views/stacks/
cp $WEB_BOT_PATH/src/views/stacks/Alex.tsx src/views/stacks/
cp $WEB_BOT_PATH/src/views/stacks/Dex.tsx src/views/stacks/

# 复制文档
cp $WEB_BOT_PATH/MONITORING_ENHANCEMENTS.md .
```

## 第五步：创建新的源文件

### 1. src/vite-env.d.ts
```bash
cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
EOF
```

### 2. src/index.css
```bash
cat > src/index.css << 'EOF'
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF
```

### 3. src/main.tsx
```bash
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
```

### 4. src/App.tsx
```bash
cat > src/App.tsx << 'EOF'
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
EOF
```

### 5. src/router/index.tsx
```bash
cat > src/router/index.tsx << 'EOF'
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
EOF
```

### 6. src/components/Layout.tsx
```bash
cat > src/components/Layout.tsx << 'EOF'
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Navigation from './Navigation';

const { Header, Content, Footer } = AntLayout;

const Layout: React.FC = () => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, position: 'sticky', top: 0, zIndex: 1 }}>
        <Navigation />
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Blockchain Monitor ©{new Date().getFullYear()} - 实时区块链交易监控系统
      </Footer>
    </AntLayout>
  );
};

export default Layout;
EOF
```

### 7. src/components/Navigation.tsx
```bash
cat > src/components/Navigation.tsx << 'EOF'
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { 
  DashboardOutlined, 
  MonitorOutlined,
  ApiOutlined 
} from '@ant-design/icons';

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
      icon: <ApiOutlined />,
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

  const selectedKeys = [location.pathname];
  // 如果是子菜单，也要选中父菜单
  if (location.pathname.startsWith('/stacks')) {
    selectedKeys.push('/stacks');
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '64px' }}>
      <div style={{ 
        color: 'white', 
        fontSize: '18px', 
        fontWeight: 'bold',
        marginLeft: '24px',
        marginRight: '48px'
      }}>
        区块链监控
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys}
        items={items}
        style={{ flex: 1, minWidth: 0 }}
      />
    </div>
  );
};

export default Navigation;
EOF
```

### 8. src/views/Home.tsx
```bash
cat > src/views/Home.tsx << 'EOF'
import React from 'react';
import { Card, Row, Col, Typography, Statistic, List } from 'antd';
import { Link } from 'react-router-dom';
import { 
  MonitorOutlined, 
  ApiOutlined, 
  DashboardOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const features = [
    '实时监控 Starknet 和 Stacks 区块链交易',
    '多条件筛选（交易类型、状态）',
    '自动刷新功能（30秒间隔）',
    '分页展示（支持 3、5、10、50、100 条/页）',
    '交易详情展示和地址复制',
    'DEX 平台自动识别',
    '响应式设计，适配各种屏幕尺寸',
  ];

  return (
    <div style={{ padding: '20px 0' }}>
      <Card style={{ marginBottom: '20px' }}>
        <Title level={2}>
          <DashboardOutlined /> 区块链监控系统
        </Title>
        <Paragraph>
          实时监控 Starknet 和 Stacks 区块链网络的交易活动。
          本系统使用公共 API，无需认证即可查看实时交易数据。
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Link to="/starknet">
            <Card 
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
            >
              <Statistic
                title="Starknet 监控"
                value="实时交易"
                prefix={<MonitorOutlined style={{ fontSize: '24px' }} />}
              />
              <Paragraph type="secondary" style={{ marginTop: 16 }}>
                监控 Starknet 网络交易，支持多类型筛选和实时刷新
              </Paragraph>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={12}>
          <Link to="/stacks">
            <Card 
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
            >
              <Statistic
                title="Stacks 监控"
                value="DEX & 交易"
                prefix={<ApiOutlined style={{ fontSize: '24px' }} />}
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
        <List
          dataSource={features}
          renderItem={(item) => (
            <List.Item>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              {item}
            </List.Item>
          )}
        />
      </Card>

      <Card style={{ marginTop: 20 }}>
        <Title level={4}>技术栈</Title>
        <Paragraph>
          <ul>
            <li>React 18 + TypeScript</li>
            <li>Vite - 快速构建工具</li>
            <li>Ant Design 5.x - UI 组件库</li>
            <li>React Router v6 - 路由管理</li>
            <li>Axios - HTTP 客户端</li>
          </ul>
        </Paragraph>
        <Title level={4}>数据源</Title>
        <Paragraph>
          <ul>
            <li><strong>Starknet:</strong> Voyager API (https://api.voyager.online/beta)</li>
            <li><strong>Stacks:</strong> Hiro API (https://api.mainnet.hiro.so)</li>
          </ul>
          所有 API 均为公共免费接口，无需认证。
        </Paragraph>
      </Card>
    </div>
  );
};

export default Home;
EOF
```

## 第六步：安装依赖

```bash
npm install
```

## 第七步：测试运行

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问 http://localhost:3000
```

## 第八步：构建测试

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 第九步：提交到 GitHub

```bash
# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Blockchain monitoring system"

# 添加远程仓库（替换为你的仓库 URL）
git remote add origin https://github.com/mumugogoing/blockchain-monitor.git

# 推送到 GitHub
git push -u origin main
```

## 第十步：创建 README.md

```bash
cat > README.md << 'EOF'
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
访问 http://localhost:3000

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
blockchain-monitor/
├── src/
│   ├── api/              # API 接口
│   │   ├── starknet.ts   # Starknet API
│   │   └── stacks.ts     # Stacks API
│   ├── components/       # 公共组件
│   │   ├── Layout.tsx    # 布局组件
│   │   └── Navigation.tsx # 导航组件
│   ├── views/           # 页面组件
│   │   ├── Home.tsx     # 首页
│   │   ├── StarknetMonitor.tsx  # Starknet 监控
│   │   └── stacks/      # Stacks 监控页面
│   ├── router/          # 路由配置
│   └── main.tsx         # 入口文件
├── public/              # 静态资源
├── index.html          # HTML 模板
├── package.json        # 依赖配置
├── vite.config.ts      # Vite 配置
└── tsconfig.json       # TypeScript 配置
\`\`\`

## API 数据源

- **Starknet**: Voyager API (https://api.voyager.online/beta)
- **Stacks**: Hiro API (https://api.mainnet.hiro.so)

均为公共免费 API，无需认证。

## 监控功能

### Starknet 监控
- 实时交易列表
- 交易类型筛选（INVOKE, DEPLOY, DECLARE 等）
- 交易状态筛选（ACCEPTED_ON_L1, ACCEPTED_ON_L2, PENDING 等）
- 交易详情查看
- 地址复制功能

### Stacks 监控
- 交易监控主页
- Alex DEX 交易监控
- DEX 平台交易监控
- 合约调用识别
- DeFi 协议识别

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 部署

### Vercel 部署
\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

### Nginx 部署
\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/blockchain-monitor/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT

---

**注意**: 本项目从 web-bot-react 项目中提取的监控功能独立而来，专注于区块链交易监控。
EOF

# 提交 README
git add README.md
git commit -m "docs: Add comprehensive README"
git push
```

## 完成！

现在你已经成功创建了一个独立的区块链监控项目！

### 验证清单

- [ ] 项目可以正常启动 (`npm run dev`)
- [ ] 所有路由可以访问
- [ ] Starknet 监控页面正常显示
- [ ] Stacks 监控页面正常显示
- [ ] 数据可以正常加载
- [ ] 筛选功能正常工作
- [ ] 分页功能正常工作
- [ ] 构建成功 (`npm run build`)
- [ ] 代码已推送到 GitHub

### 后续步骤

1. 配置 GitHub Actions 自动部署
2. 添加单元测试
3. 性能优化
4. 添加更多区块链支持
5. 添加数据可视化功能

如有问题，请参考 `MONITORING_EXTRACTION_GUIDE.md` 获取更多详细信息。
