# STX/AEUSDC 压单功能 (Order Pressing Feature)

## 功能概述

压单功能是为STX/AEUSDC交易对添加的自动交易监控和提交功能。当开启此功能后，系统会持续监控指定Stacks链地址的pending交易状态，一旦检测到pending交易，会自动提交xykserialize交易。

## 功能特性

1. **实时监控**: 每2秒检查一次指定地址的pending交易状态
2. **自动提交**: 检测到pending交易时自动触发xykserialize提交
3. **状态指示**: 实时显示监控状态和pending交易检测结果
4. **活动日志**: 记录最近10条监控活动，包括成功和失败的操作
5. **开关控制**: 通过Toggle开关轻松启用/禁用功能

## 使用方法

### 1. 启用压单功能

在STX/AEUSDC交易页面，找到"STX/AEUSDC 压单功能"卡片：

1. 在输入框中输入要监控的Stacks链地址
2. 点击"压单开启"开关启用监控
3. 系统将立即开始监控，每2秒检查一次

### 2. 监控状态

- **绿色标签 "无Pending交易"**: 当前没有检测到pending交易
- **红色标签 "Pending交易检测中"**: 检测到pending交易，系统正在处理
- **最后检查时间**: 显示最近一次检查的时间

### 3. 查看日志

监控日志会显示在卡片下方，包括：
- 检测到pending交易的时间
- xykserialize提交成功/失败记录
- 错误信息（如果有）

### 4. 停止监控

点击"压单关闭"开关即可停止监控。

## API 接口

### 1. 检查地址Pending交易

```typescript
checkAddressPendingTx(address: string)
```

**请求参数**:
- `address`: Stacks链地址

**返回数据**:
```json
{
  "data": {
    "hasPending": true/false
  }
}
```

### 2. 提交xykserialize交易

```typescript
xykSerialize(data: {
  amount: string,
  dx: string,
  dy: string,
  fee: string,
  quote: string
})
```

**请求参数**:
- `amount`: 交易金额
- `dx`: 源代币合约地址
- `dy`: 目标代币合约地址
- `fee`: 手续费
- `quote`: 最小获取数量

## 技术实现

### 前端实现

1. **状态管理**:
   - `orderPressingEnabled`: 压单功能开关状态
   - `monitorAddress`: 监控的地址
   - `pendingTxDetected`: pending交易检测状态
   - `lastCheckedTime`: 最后检查时间
   - `orderPressingLog`: 活动日志数组

2. **监控循环**:
   - 使用React `useEffect` Hook实现自动监控
   - 每2秒调用一次`checkAddressPendingTx` API
   - 检测到pending交易时调用`handleAutoSubmitXykSerialize`

3. **自动提交**:
   - 使用当前STX/AEUSDC交易表单的参数
   - 调用`xykSerialize` API提交交易
   - 记录成功或失败信息到日志

### 后端要求

后端需要实现以下API端点：

1. **GET /dex/checkaddresspendingtx**
   - 查询指定地址的pending交易状态
   - 返回`hasPending`布尔值

2. **POST /dex/xykserialize**
   - 接收交易参数并提交xykserialize交易
   - 返回交易结果

## 注意事项

1. **地址验证**: 请确保输入正确的Stacks链地址
2. **网络状况**: 监控功能需要稳定的网络连接
3. **交易参数**: 自动提交使用的是STX/AEUSDC表单的当前参数，请确保参数正确
4. **手续费**: 自动提交会使用表单中设置的手续费
5. **并发控制**: 系统会在检测到pending交易后立即提交，注意避免重复提交

## 故障排除

### 问题1: 监控未启动
- 检查是否已输入监控地址
- 检查开关是否已开启
- 查看浏览器控制台是否有错误信息

### 问题2: 自动提交失败
- 检查STX/AEUSDC交易表单参数是否完整
- 查看监控日志中的错误信息
- 确认后端API是否正常运行

### 问题3: 无法检测到pending交易
- 确认监控地址是否正确
- 检查该地址是否真的有pending交易
- 确认后端API返回数据格式是否正确

## 未来改进

1. 支持自定义监控间隔
2. 支持监控多个地址
3. 添加邮件/通知提醒
4. 增加交易历史记录
5. 优化错误处理和重试机制
