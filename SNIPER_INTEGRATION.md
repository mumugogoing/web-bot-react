# 狙击服务集成文档 (Sniper Service Integration)

## 概述 (Overview)

已成功将狙击服务完全集成到 Web Bot React 系统中，包括后端 Go 服务和前端 React 界面。

The sniper service has been fully integrated into the Web Bot React system, including both the backend Go service and frontend React interface.

## 功能特性 (Features)

### 后端功能 (Backend Features)

1. **并发监控 (Concurrent Monitoring)**
   - 使用 Go goroutines 实现多线程并发监控
   - 每 500ms 检查一次待处理交易
   - 同时查询 3 个不同的 Stacks API 端点以获得最快响应

2. **速率限制 (Rate Limiting)**
   - 50 请求/秒的速率限制
   - 100 请求的突发容量
   - 使用 `golang.org/x/time/rate` 包实现

3. **并发广播 (Concurrent Broadcasting)**
   - 检测到目标交易时立即向 3 个节点并发广播
   - 线程安全的结果收集
   - 独立的错误处理

4. **API 端点 (API Endpoints)**
   - `POST /api/v1/sniper/start-continuous` - 启动持续监控
   - `POST /api/v1/sniper/stop-continuous` - 停止监控
   - `GET /api/v1/sniper/status` - 获取状态
   - `POST /api/v1/sniper/snipe` - 一次性狙击
   - `POST /api/v1/sniper/quick-check` - 快速检查
   - `GET /api/v1/sniper/broadcasts` - 获取广播结果
   - `POST /api/v1/sniper/broadcasts/clear` - 清空结果

### 前端功能 (Frontend Features)

1. **React 组件 (React Component)**
   - 使用 Ant Design 组件库
   - 响应式布局，适配桌面和移动设备
   - 实时状态更新（每 3 秒轮询）

2. **用户界面 (User Interface)**
   - 配置面板：输入目标地址和序列化数据
   - 状态显示：运行状态、检测数量、广播次数
   - 操作日志：实时显示所有操作和事件
   - 广播结果：显示所有广播尝试的详细信息

3. **菜单集成 (Menu Integration)**
   - 集成到"交易"主菜单下
   - 子菜单项："Alex 交易"和"狙击服务"
   - 使用瞄准图标 (AimOutlined) 标识

## 技术实现 (Technical Implementation)

### 后端架构 (Backend Architecture)

```
backend/
├── api/v1/
│   ├── sniper_service.go    # 核心狙击服务逻辑
│   └── sniper_handlers.go   # HTTP 请求处理器
└── router/
    └── sniper.go            # 路由配置
```

**关键技术点：**
- 使用单例模式管理狙击服务实例
- context.Context 用于优雅关闭
- sync.RWMutex 保证线程安全
- 并发模式：worker pool + channel

### 前端架构 (Frontend Architecture)

```
src/
├── services/
│   └── sniperService.ts     # API 服务层
├── views/bot/
│   └── SniperControl.tsx    # 主组件
├── router/
│   └── index.tsx            # 路由配置
└── components/
    └── Sidebar.tsx          # 菜单配置
```

**关键技术点：**
- TypeScript 类型安全
- React Hooks (useState, useEffect, useCallback)
- Axios HTTP 客户端
- Ant Design UI 组件

## 使用说明 (Usage Instructions)

### 启动服务 (Starting the Service)

1. **启动后端 (Start Backend)**
```bash
cd backend
go run main.go
# 服务运行在 http://localhost:10000
```

2. **启动前端 (Start Frontend)**
```bash
npm run dev
# 前端运行在 http://localhost:3000
```

### 使用界面 (Using the Interface)

1. **登录系统**
   - 默认账户: `stx` / `stx123`
   - 管理员账户: `admin` / `root`

2. **导航到狙击服务**
   - 点击左侧菜单"交易" → "狙击服务"

3. **配置狙击参数**
   - 目标地址：输入要监控的 Stacks 地址
   - 序列化数据：输入预先序列化的交易数据

4. **操作选项**
   - **启动监控**：开始持续监控（每 500ms 检查）
   - **停止监控**：停止后台监控
   - **快速检查**：执行一次快速检查（1 秒超时）

### API 使用示例 (API Usage Examples)

**启动持续监控:**
```bash
curl -X POST http://localhost:10000/api/v1/sniper/start-continuous \
  -H "Content-Type: application/json" \
  -d '{
    "targetAddress": "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
    "serializedData": "0x00000000010400000000..."
  }'
```

**获取状态:**
```bash
curl http://localhost:10000/api/v1/sniper/status
```

**停止监控:**
```bash
curl -X POST http://localhost:10000/api/v1/sniper/stop-continuous
```

## 性能指标 (Performance Metrics)

- **监控延迟**: < 500ms (检查间隔)
- **并发请求**: 支持 50 req/s
- **广播速度**: 同时向 3 个节点广播
- **响应时间**: 通常 < 1 秒

## 安全考虑 (Security Considerations)

1. **速率限制**: 防止 API 滥用
2. **超时控制**: 所有 HTTP 请求都有 5-10 秒超时
3. **线程安全**: 使用互斥锁保护共享状态
4. **输入验证**: 后端验证所有输入参数

## 测试验证 (Testing & Verification)

所有功能已通过测试：

✅ 后端编译成功
✅ 所有 API 端点正常工作
✅ 并发监控功能正常
✅ 前端界面正常渲染
✅ 菜单集成完成
✅ 实时状态更新正常

## 下一步优化 (Future Enhancements)

1. 添加 WebSocket 支持实现实时推送
2. 增加监控历史记录和统计图表
3. 支持多地址同时监控
4. 添加告警通知功能
5. 优化序列化数据的广播逻辑

## 技术依赖 (Dependencies)

### 后端 (Backend)
- Go 1.24+
- github.com/gin-gonic/gin
- golang.org/x/time/rate

### 前端 (Frontend)
- React 19+
- TypeScript 5+
- Ant Design 5+
- Axios

## 贡献者 (Contributors)

- GitHub Copilot
- mumugogoing

## 许可证 (License)

与主项目保持一致
