# API 配置说明 / API Configuration Guide

## Stacks 区块链 API 配置

### 推荐使用的 API

**Hiro API (官方推荐)**
- 基础 URL: `https://api.mainnet.hiro.so`
- 文档: https://docs.hiro.so/stacks-blockchain-api
- 特点:
  - ✅ 免费使用
  - ✅ 稳定可靠
  - ✅ 官方维护
  - ✅ 无需认证
  - ✅ 速率限制合理

### ⚠️ 不推荐使用的 API

**QuickNode API** - ❌ 不建议使用

QuickNode API 在实际使用中发现以下问题:

1. **TLS 错误** - 高负载时频繁出现 `tls: internal error`
   ```
   ERRO Failed to fetch from https://necessary-crimson-sky.stacks-mainnet.quiknode.pro/...
   Err=请求失败: Get "http...": remote error: tls: internal error
   ```

2. **限流严格** - 频繁返回 429 错误
   ```
   ERRO Failed to fetch from https://docs-demo.stacks-mainnet.quiknode.pro/...
   Err=意外的状态码: 429
   ```

3. **需要付费** - 免费层级配额严格，稳定服务需要付费订阅

4. **URL 格式问题** - 某些情况下会出现 URL 解析错误
   ```
   Get "httpnecessary-crimson-sky.stacks-mainnet.quiknode.pro/..."
   ```

### 代码实现位置

- **前端 API 配置**: `src/api/stacks.ts`
  - 使用 Hiro API 获取交易数据
  - 包含错误处理和超时配置

- **后端 Sniper 功能**: `backend/api/v1/bot_sniper.go`
  - 当前为 stub 实现
  - 未来扩展应使用 Hiro API

### Mempool 端点说明

如需访问 mempool（待处理交易）数据，使用 Hiro API:

```
GET https://api.mainnet.hiro.so/extended/v1/address/{address}/mempool
```

**不要使用** QuickNode 的 mempool 端点，避免遇到以上问题。

### 最佳实践

1. **始终使用 Hiro API** 作为主要数据源
2. **设置合理的超时时间** (建议 15 秒)
3. **实现错误重试机制** (建议 3 次)
4. **添加降级方案** (如缓存数据)
5. **监控 API 调用频率** 避免超出限制

### 环境配置

在 `src/api/stacks.ts` 中已配置:

```typescript
const STACKS_API_BASE = 'https://api.mainnet.hiro.so';
```

此配置已优化，无需修改。

## 更新历史

- 2025-10-31: 初始版本，记录 QuickNode API 问题并推荐使用 Hiro API
