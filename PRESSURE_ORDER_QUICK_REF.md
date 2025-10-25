# 压单功能快速参考 (Pressure Order Quick Reference)

## 快速开始 (Quick Start)

### 5 步启动监控 (5 Steps to Start)

```bash
1. 访问页面
   Navigate to: /bot/pressure-order

2. 添加监控地址
   Input address → Click "添加地址"

3. 配置交易参数
   - 交易金额: 3000 STX
   - 交易方向: 卖出/买入/自动
   - 手续费: 0.124251

4. 启用自动交易
   Toggle "启用自动交易" → ON

5. 启动监控
   Click "启动监控"
```

## 默认配置 (Default Configuration)

```javascript
{
  enabled: true,                    // 自动交易已启用
  tradePair: 'STX/AEUSDC',         // 交易对
  tradeAmount: 3000,                // 3000 STX
  tradeDirection: 'sell',           // 卖出
  maxApiCallsPerMinute: 30,         // 30次/分钟
  checkIntervalMs: 5000,            // 5秒检查一次
  dx: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
  dy: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
  fee: '0.124251'
}
```

## 常用地址示例 (Common Address Examples)

以下是 Stacks 主网上常见 DeFi 平台的真实地址，可用于测试和监控：
(The following are real addresses of common DeFi platforms on Stacks mainnet for testing and monitoring:)

```
# ALEX DEX
SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9

# Arkadiko
SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR

# Velar
SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1

# Bitflow
SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK
```

## 状态指示器 (Status Indicators)

| 状态 | 颜色 | 含义 |
|------|------|------|
| 运行中 | 🟢 绿色 | 系统正在监控 |
| 已停止 | 🔴 红色 | 系统未运行 |
| 已执行 | ✅ 成功标签 | 交易已执行 |
| 未执行 | ⚪ 默认标签 | 交易未执行 |

## API 速率管理 (API Rate Management)

### 推荐设置 (Recommended Settings)

| 监控地址数 | API限制 | 检查间隔 |
|-----------|---------|---------|
| 1-3 个    | 30次/分  | 5秒     |
| 4-6 个    | 40次/分  | 6秒     |
| 7-10 个   | 50次/分  | 8秒     |

### 速率计算 (Rate Calculation)

```
理论最大调用数 = (60秒 / 检查间隔秒数) × 监控地址数

例如:
- 3个地址, 5秒间隔: (60/5) × 3 = 36次/分钟
- 建议设置限制为: 40次/分钟 (留有余量)
```

## 操作快捷键 (Quick Actions)

| 操作 | 按钮 | 快捷方式 |
|------|------|----------|
| 添加地址 | "添加地址" | Enter键 (在地址输入框中) |
| 启动监控 | "启动监控" | - |
| 停止监控 | "停止监控" | - |
| 重置状态 | "重置" | - |

## 监控数据 (Monitoring Data)

### 实时统计 (Real-time Statistics)
```
┌─────────────────────┬──────────┐
│ 检测到的交易         │ XX 笔    │
│ 已执行交易          │ XX 笔    │
│ API调用速率         │ XX/30    │
│ 最后检查时间        │ HH:MM:SS │
└─────────────────────┴──────────┘
```

### 交易历史列 (Transaction History Columns)
- 交易ID (可复制)
- 地址 (可复制)
- 时间
- 类型
- 金额
- 自动交易状态
- 结果

## 调试技巧 (Debugging Tips)

### 检查系统状态
1. 查看 "运行状态" - 应为绿色 "运行中"
2. 查看 "API调用速率" - 不应超过设定限制
3. 查看错误日志 - 底部红色提示框

### 常见问题排查
```
问题: 没有检测到交易
解决:
  ✓ 确认地址正确
  ✓ 确认监控已启动
  ✓ 检查API速率是否过低
  ✓ 查看错误日志

问题: API调用失败
解决:
  ✓ 降低检查频率
  ✓ 减少监控地址数量
  ✓ 增加API限制数值
  ✓ 检查网络连接

问题: 自动交易未执行
解决:
  ✓ 确认 "启用自动交易" 已打开
  ✓ 检查交易金额配置
  ✓ 查看交易历史中的错误信息
```

## 性能优化 (Performance Optimization)

### 最佳实践 (Best Practices)

1. **渐进式添加地址**
   - 先添加1-2个地址测试
   - 确认工作正常后再增加

2. **合理设置间隔**
   - 避免过于频繁的检查
   - 建议不低于3秒间隔

3. **监控API使用**
   - 保持使用率在80%以下
   - 给系统留有调整空间

4. **定期清理历史**
   - 系统自动保留最近200条
   - 可通过重置清空全部

## 配置导出/导入 (Config Export/Import)

### 查看当前配置 (View Current Config)
```javascript
// 打开浏览器控制台
console.log(localStorage.getItem('pressureOrderConfig'))
```

### 备份配置 (Backup Config)
```javascript
// 复制输出的内容保存
const backup = localStorage.getItem('pressureOrderConfig')
console.log(backup)
```

### 恢复配置 (Restore Config)
```javascript
// 粘贴备份的配置
localStorage.setItem('pressureOrderConfig', '您的配置JSON字符串')
// 刷新页面
```

## 安全检查清单 (Security Checklist)

- [ ] 交易金额设置合理 (建议小于账户余额的10%)
- [ ] API限制已设置 (建议30-50次/分钟)
- [ ] 监控地址已验证 (确认是正确的地址)
- [ ] 手续费设置正确 (根据网络状况调整)
- [ ] 先测试监控模式 (关闭自动交易测试)
- [ ] 定期检查日志 (确保无错误)

## 监控效果示例 (Monitoring Example)

```
[2025-10-25 14:30:00] 监控启动
[2025-10-25 14:30:05] 检查地址: SP3K8BC...
[2025-10-25 14:30:06] 检测到新交易: 0x1a2b3c...
[2025-10-25 14:30:07] 执行自动卖出: 3000 STX
[2025-10-25 14:30:08] 交易成功: TX_12345...
[2025-10-25 14:30:13] 继续监控...
```

## 技术支持 (Technical Support)

### 日志位置 (Log Locations)
- 浏览器控制台: F12 → Console
- 错误日志: 页面底部红色提示框
- 交易历史: 页面底部表格

### 调试模式 (Debug Mode)
```javascript
// 启用详细日志 (浏览器控制台)
localStorage.setItem('DEBUG', 'pressure-order')
```

## 版本信息 (Version Info)

```
当前版本: v1.0.0
发布日期: 2025-10-25
兼容性: React 19+, Ant Design 5+
```

---

**提示**: 使用 Ctrl+F 在此文档中快速搜索关键词
**Tip**: Use Ctrl+F to quickly search for keywords in this document
