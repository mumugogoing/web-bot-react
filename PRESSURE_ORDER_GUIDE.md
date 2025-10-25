# 压单功能 (Pressure Order Feature)

## 概述 (Overview)

压单功能是一个自动化交易系统，用于监控指定的 Stacks 区块链地址。当检测到这些地址发生交易时，系统会自动触发 STX/AEUSDC 交易对的买入或卖出操作。

The Pressure Order feature is an automated trading system that monitors specified Stacks blockchain addresses. When transactions from these addresses are detected, the system automatically triggers buy or sell operations for the STX/AEUSDC trading pair.

## 主要功能 (Key Features)

### 1. 地址监控 (Address Monitoring)
- 支持监控多个 Stacks 地址
- 实时检测新交易
- 自动去重，避免重复处理
- Supports monitoring multiple Stacks addresses
- Real-time detection of new transactions
- Automatic deduplication to avoid reprocessing

### 2. 动态 API 速率限制 (Dynamic API Rate Limiting)
- 可配置的每分钟 API 调用限制
- 自动监控当前 API 使用率
- 当接近限制时自动调整检查间隔
- 防止超出 API 配额
- Configurable API calls per minute limit
- Automatic monitoring of current API usage
- Auto-adjusts check interval when approaching limits
- Prevents exceeding API quotas

### 3. 自动交易执行 (Automatic Trade Execution)
- 检测到交易时自动提交 STX/AEUSDC 交易
- 支持买入、卖出和自动模式
- 可配置交易金额和手续费
- 完整的交易结果记录
- Automatically submits STX/AEUSDC trades when transactions detected
- Supports buy, sell, and auto modes
- Configurable trade amount and fees
- Complete trade result logging

### 4. 配置持久化 (Configuration Persistence)
- 所有配置自动保存到浏览器 localStorage
- 刷新页面后配置自动恢复
- All configurations automatically saved to browser localStorage
- Configurations automatically restored after page refresh

## 使用方法 (Usage)

### 访问功能 (Accessing the Feature)

1. 登录系统后，点击导航栏中的 "压单功能"
2. After logging in, click "压单功能" in the navigation menu

### 配置监控地址 (Configuring Monitored Addresses)

1. 在 "监控地址" 部分输入 Stacks 地址
2. 点击 "添加地址" 按钮
3. 可以添加多个地址进行同时监控
4. 点击地址标签上的 × 可以移除地址

Steps:
1. Enter a Stacks address in the "监控地址" section
2. Click the "添加地址" (Add Address) button
3. Multiple addresses can be added for simultaneous monitoring
4. Click × on the address tag to remove it

示例地址格式 (Example Address Format):
```
SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR
SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9
```

### 基本配置 (Basic Configuration)

#### 启用自动交易 (Enable Auto Trading)
- 开关控制是否在检测到交易时自动执行
- Toggle controls whether to execute trades automatically when transactions detected

#### 交易对 (Trading Pair)
- STX/AEUSDC (默认 / Default)
- STX/BTC
- STX/USDT

#### 交易金额 (Trade Amount)
- 默认: 3000 STX
- 范围: 100 - 100,000 STX
- Default: 3000 STX
- Range: 100 - 100,000 STX

#### 交易方向 (Trade Direction)
- **买入 (Buy)**: 执行买入操作
- **卖出 (Sell)**: 执行卖出操作
- **自动 (Auto)**: 根据市场情况自动选择

#### 手续费 (Fee)
- 默认: 0.124251
- 可以根据网络状况调整
- Default: 0.124251
- Adjustable based on network conditions

### 性能配置 (Performance Configuration)

#### API 调用限制 (API Call Limit)
- 每分钟最大 API 调用次数
- 默认: 30 次/分钟
- 建议范围: 10-50 次/分钟
- Maximum API calls per minute
- Default: 30 calls/minute
- Recommended range: 10-50 calls/minute

#### 检查间隔 (Check Interval)
- 地址检查的时间间隔
- 默认: 5000 毫秒 (5秒)
- 范围: 1000 - 60000 毫秒
- 系统会根据 API 使用率自动调整
- Time interval between address checks
- Default: 5000 milliseconds (5 seconds)
- Range: 1000 - 60000 milliseconds
- System automatically adjusts based on API usage

### 启动监控 (Starting Monitoring)

1. 配置好所有参数
2. 点击 "启动监控" 按钮
3. 系统开始监控配置的地址
4. 状态面板会显示实时信息

Steps:
1. Configure all parameters
2. Click the "启动监控" (Start Monitoring) button
3. System starts monitoring configured addresses
4. Status panel displays real-time information

### 停止监控 (Stopping Monitoring)

1. 点击 "停止监控" 按钮
2. 系统停止检查地址
3. 已检测的交易历史保留

Steps:
1. Click the "停止监控" (Stop Monitoring) button
2. System stops checking addresses
3. Detected transaction history is retained

### 重置监控 (Resetting Monitor)

1. 点击 "重置" 按钮
2. 清除所有运行状态和交易历史
3. 配置保持不变

Steps:
1. Click the "重置" (Reset) button
2. Clears all running state and transaction history
3. Configuration remains unchanged

## 状态监控 (Status Monitoring)

### 运行状态 (Running Status)
- **运行中**: 绿色，系统正在监控
- **已停止**: 红色，系统未运行
- **Running**: Green, system is monitoring
- **Stopped**: Red, system is not running

### 统计信息 (Statistics)

#### 检测到的交易 (Detected Transactions)
- 显示总共检测到的交易数量
- Shows total number of detected transactions

#### 已执行交易 (Executed Trades)
- 显示成功执行的自动交易数量
- Shows number of successfully executed automatic trades

#### API 调用速率 (API Call Rate)
- 当前每分钟的 API 调用次数
- 显示相对于最大限制的使用情况
- Current API calls per minute
- Shows usage relative to maximum limit

### 交易历史 (Transaction History)

交易历史表格显示:
- 交易 ID (可复制)
- 监控的地址 (可复制)
- 交易时间
- 交易类型
- 交易金额
- 自动交易执行状态
- 交易结果

Transaction history table shows:
- Transaction ID (copyable)
- Monitored address (copyable)
- Transaction time
- Transaction type
- Transaction amount
- Auto trade execution status
- Trade result

## 工作原理 (How It Works)

### 监控流程 (Monitoring Flow)

```
1. 启动监控
   Start Monitoring
   ↓
2. 检查 API 速率限制
   Check API Rate Limit
   ↓
3. 查询地址交易
   Query Address Transactions
   ↓
4. 检测新交易
   Detect New Transactions
   ↓
5. 执行自动交易 (如果启用)
   Execute Auto Trade (if enabled)
   ↓
6. 记录结果
   Record Result
   ↓
7. 等待间隔
   Wait for Interval
   ↓
8. 返回步骤 2
   Return to Step 2
```

### 速率限制调整 (Rate Limit Adjustment)

系统会自动调整检查间隔以避免超出 API 限制:

The system automatically adjusts check interval to avoid exceeding API limits:

- 当 API 使用率 > 80%: 间隔延长 1.5 倍
- 最大间隔: 60 秒
- When API usage > 80%: Interval increased by 1.5x
- Maximum interval: 60 seconds

### 交易去重 (Transaction Deduplication)

- 系统维护最近 1000 个交易 ID
- 每个交易只处理一次
- 自动清理旧的交易 ID
- System maintains last 1000 transaction IDs
- Each transaction processed only once
- Automatic cleanup of old transaction IDs

## 安全建议 (Security Recommendations)

1. **谨慎设置交易金额**: 建议从小金额开始测试
2. **监控 API 使用**: 避免设置过高的检查频率
3. **定期检查日志**: 查看错误日志确保系统正常运行
4. **测试配置**: 在启用自动交易前先使用监控模式测试

1. **Set Trade Amount Carefully**: Start with small amounts for testing
2. **Monitor API Usage**: Avoid setting too high check frequency
3. **Regular Log Checks**: Review error logs to ensure proper operation
4. **Test Configuration**: Use monitoring mode to test before enabling auto-trading

## 常见问题 (FAQ)

### Q: 系统会一直监控吗？
A: 不会。系统只在浏览器标签页打开且监控已启动的情况下工作。关闭标签页或停止监控后，系统会停止运行。

### Q: Will the system monitor continuously?
A: No. The system only works when the browser tab is open and monitoring is started. It stops when you close the tab or stop monitoring.

### Q: 如果超出 API 限制会怎样？
A: 系统会自动调整检查间隔，延长等待时间。同时会在错误日志中显示相关信息。

### Q: What happens if API limits are exceeded?
A: The system automatically adjusts check interval and extends waiting time. Related information will be shown in error logs.

### Q: 配置会丢失吗？
A: 不会。所有配置保存在浏览器的 localStorage 中，刷新页面后会自动恢复。

### Q: Will configuration be lost?
A: No. All configurations are saved in browser's localStorage and automatically restored after page refresh.

### Q: 可以同时监控多少个地址？
A: 理论上没有限制，但建议不超过 10 个地址，以避免 API 速率限制问题。

### Q: How many addresses can be monitored simultaneously?
A: Theoretically unlimited, but recommended not to exceed 10 addresses to avoid API rate limit issues.

## 技术细节 (Technical Details)

### 架构 (Architecture)

- **前端监控服务**: 运行在浏览器中的 TypeScript 服务
- **API 集成**: 使用 Stacks Hiro API 查询交易
- **交易执行**: 通过后端 API 提交交易
- **Frontend Monitoring Service**: TypeScript service running in browser
- **API Integration**: Uses Stacks Hiro API to query transactions
- **Trade Execution**: Submits trades through backend API

### 文件结构 (File Structure)

```
src/
├── api/bot/pressureOrder.ts          # API 接口定义
├── services/pressureOrderMonitor.ts  # 监控服务核心逻辑
└── views/bot/PressureOrder.tsx       # UI 组件
```

### 依赖 (Dependencies)

- React 19+
- Ant Design 5+
- Stacks API (Hiro)
- 现有的 XYK 交易 API

## 更新日志 (Changelog)

### v1.0.0 (2025-10-25)
- ✅ 初始版本发布
- ✅ 基础监控功能
- ✅ 动态速率限制
- ✅ 自动交易执行
- ✅ 配置持久化
- ✅ Initial release
- ✅ Basic monitoring functionality
- ✅ Dynamic rate limiting
- ✅ Automatic trade execution
- ✅ Configuration persistence
