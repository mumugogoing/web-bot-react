# 狙击服务快速参考 (Sniper Service Quick Reference)

## 🚀 快速开始 (Quick Start)

### 1. 启动服务 (Start Services)

```bash
# 启动后端 (Start Backend)
cd backend
go run main.go
# 运行在 http://localhost:10000

# 启动前端 (Start Frontend in another terminal)
cd ..
npm run dev
# 运行在 http://localhost:3000
```

### 2. 访问界面 (Access UI)

1. 打开浏览器访问: http://localhost:3000
2. 登录（可选）: `stx` / `stx123`
3. 点击菜单: **交易** → **狙击服务**

## 📋 使用流程 (Usage Flow)

### 监控目标地址 (Monitor Target Address)

```
1. 输入目标地址
   ↓
2. 输入序列化交易数据
   ↓
3. 点击"启动监控"
   ↓
4. 系统每 500ms 检查一次
   ↓
5. 检测到交易 → 立即广播 → 返回 true
```

### 操作按钮 (Action Buttons)

- 🚀 **启动监控**: 开始持续监控（每 500ms）
- 🛑 **停止监控**: 停止后台监控
- ⚡ **快速检查**: 单次检查（1 秒超时）

## 🔌 API 端点 (API Endpoints)

### 持续监控 (Continuous Monitoring)

```bash
# 启动
curl -X POST http://localhost:10000/api/v1/sniper/start-continuous \
  -H "Content-Type: application/json" \
  -d '{
    "targetAddress": "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
    "serializedData": "0x00000000010400000000..."
  }'

# 停止
curl -X POST http://localhost:10000/api/v1/sniper/stop-continuous

# 状态
curl http://localhost:10000/api/v1/sniper/status
```

### 单次操作 (One-time Operations)

```bash
# 快速检查（1秒超时）
curl -X POST http://localhost:10000/api/v1/sniper/quick-check \
  -H "Content-Type: application/json" \
  -d '{
    "targetAddress": "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
    "serializedData": "0x...",
    "timeoutMs": 1000
  }'

# 立即狙击（1秒超时 + 自动广播）
curl -X POST http://localhost:10000/api/v1/sniper/snipe \
  -H "Content-Type: application/json" \
  -d '{
    "targetAddress": "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
    "serializedData": "0x..."
  }'
```

### 结果查询 (Results)

```bash
# 获取广播结果
curl http://localhost:10000/api/v1/sniper/broadcasts

# 清空结果
curl -X POST http://localhost:10000/api/v1/sniper/broadcasts/clear
```

## 📊 响应示例 (Response Examples)

### 成功启动监控

```json
{
  "success": true,
  "message": "Sniper monitoring started",
  "data": {
    "targetAddress": "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
    "checkInterval": "500ms"
  }
}
```

### 状态查询

```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "targetAddress": "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
    "detectedCount": 2,
    "detectedTxIDs": ["0xabc...", "0xdef..."],
    "broadcastCount": 6,
    "lastCheckTime": "2025-10-29T21:33:49Z"
  }
}
```

### 检测到交易

```json
{
  "success": true,
  "detected": true,
  "targetTxIDs": ["0xabc123..."],
  "broadcastTxIDs": ["0xdef456...", "0xghi789..."],
  "responseTimeMs": 850,
  "broadcastCount": 3
}
```

## ⚙️ 配置参数 (Configuration)

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 检查间隔 | 500ms | 监控轮询间隔 |
| 速率限制 | 50 req/s | API 请求速率 |
| 突发容量 | 100 | 突发请求数量 |
| 超时时间 | 1-5s | HTTP 请求超时 |
| 并发查询 | 3 个端点 | 同时查询的 API |
| 并发广播 | 3 个节点 | 同时广播的节点 |

## 🎯 关键特性 (Key Features)

- ✅ **高性能**: 500ms 检测间隔，< 1s 响应时间
- ✅ **高并发**: 同时查询 3 个 API，同时广播 3 个节点
- ✅ **高可靠**: 速率限制、超时控制、线程安全
- ✅ **易使用**: 图形界面 + REST API
- ✅ **实时性**: 检测到交易立即返回

## 🔍 监控的 API 端点

1. `https://api.hiro.so/extended/v1/tx/mempool`
2. `https://stacks-node-api.mainnet.stacks.co/extended/v1/tx/mempool`
3. `https://api.mainnet.hiro.so/extended/v1/tx/mempool`

## 📡 广播的节点

1. `https://api.hiro.so/v2/transactions`
2. `https://stacks-node-api.mainnet.stacks.co/v2/transactions`
3. `https://api.mainnet.hiro.so/v2/transactions`

## ⚠️ 注意事项 (Important Notes)

1. **目标地址**: 必须是有效的 Stacks 地址
2. **序列化数据**: 必须是正确序列化的交易数据（hex 格式）
3. **速率限制**: 遵守 API 提供商的速率限制
4. **网络延迟**: 实际响应时间受网络影响
5. **资源消耗**: 持续监控会消耗网络和 CPU 资源

## 🐛 故障排除 (Troubleshooting)

### 问题：无法启动监控

- 检查目标地址和序列化数据是否填写
- 检查是否已经在运行中

### 问题：检测不到交易

- 确认目标地址确实有待处理交易
- 检查网络连接是否正常
- 查看操作日志中的错误信息

### 问题：广播失败

- 检查序列化数据格式是否正确
- 确认节点 API 是否可访问
- 查看广播结果中的错误详情

## 📚 更多信息

详细文档: [SNIPER_INTEGRATION.md](./SNIPER_INTEGRATION.md)
测试代码: [backend/tests/sniper_service_test.go](./backend/tests/sniper_service_test.go)
