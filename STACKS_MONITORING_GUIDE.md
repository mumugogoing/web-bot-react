# Stacks 监控功能增强说明

## 概述

本次更新显著增强了 Stacks 区块链监控功能，新增了多个主流 DeFi 平台的支持，并实现了智能的交易信息解析。

## 新增 DeFi 平台支持

### 已支持的平台

1. **ALEX** - Stacks 上最大的 DEX
   - 合约地址：`SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex`

2. **Arkadiko** - DeFi 协议
   - 合约地址：`SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko`

3. **Stackswap** - AMM DEX
   - 合约地址：`SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap`

4. **Bitflow** (新增) - app.bitflow.finance
   - 合约地址：`SP3MBWGMCVC9KZ5DTAYFMG1D0AEJCR7NENTM3FTK5.bitflow`
   - 路由合约：`SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.bitflow-router`

5. **Velar** (新增) - app.velar.com/swap
   - 主合约：`SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar`
   - UniV2 核心：`SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core`
   - UniV2 路由：`SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-router`

6. **Zest Protocol** (新增) - app.zestprotocol.com
   - 主合约：`SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.zest`
   - 流动性池：`SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.pool-v1-0`

7. **LNSwap** (新增) - Lightning Network Swap
   - 合约地址：`SP3MBWGMCVC9KZ5DTAYFMG1D0AEJCR7NENTM3FTK5.lnswap`

8. **CatamaranSwap** (新增)
   - 合约地址：`SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.catamaran-swap`

### 代币包装合约
- STX 包装：`SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx`
- xBTC：`SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin`

## 交易信息解析功能

### 支持的代币识别

系统可以自动识别以下代币：

- **STX** - Stacks 原生代币
- **wSTX** - 包装的 STX
- **xBTC** - Stacks 上的包装比特币
- **aeUSDC** - Algorand USDC 桥接代币
- **sUSDT** - Stacks USDT
- **WELSH** - WELSH 代币
- **stSTX** - Staked STX
- **VELAR** - Velar 平台代币
- **BFT** - Bitflow 代币
- **ALEX** - ALEX 平台代币
- **DIKO** - Arkadiko 代币
- **atALEX** - Auto-ALEX

### 交易信息显示格式

系统会尝试从交易中提取以下信息并以易读格式显示：

1. **完整的 Swap 信息**
   ```
   3000 aeUSDC ==> 4855 STX
   ```
   显示从代币、金额、到代币、金额

2. **部分 Swap 信息**
   ```
   3000 aeUSDC ==> STX
   STX ==> 4855 xBTC
   ```
   显示可用的信息

3. **代币转账**
   ```
   1.5 STX (转账)
   ```
   标记为转账类型

4. **通用 Swap**
   ```
   Token A ==> Token B
   Swap (swap-exact-tokens)
   ```
   无法提取详细信息时的回退显示

### 智能金额格式化

- 大数值（> 1,000,000）：自动转换为标准单位，保留2位小数
  - 例如：1,000,000 微STX → 1.00 STX
- 小数值（< 1）：保留6位小数
  - 例如：0.000123 → 0.000123
- 中间值：保留2位小数
  - 例如：123.456 → 123.46

## UI 改进

### 监控表格新列

1. **平台列**
   - 紫色标签显示 DeFi 平台名称
   - 自动识别合约所属平台
   - 未知平台显示合约名称（最多20字符）

2. **交易信息列**
   - 蓝色高亮显示 swap 详情
   - 宽度为250px，适应各种交易信息长度
   - 无信息时显示灰色短横线

### 搜索和筛选增强

- 搜索框现在支持：
  - 交易 ID
  - 发送地址
  - **交易信息**（新增）
- 类型筛选更新为中文选项
- 状态筛选更新为中文选项

## 技术实现

### 核心函数

#### `parseContractPlatform(contractId: string): string`
识别合约所属的 DeFi 平台。

```typescript
const platform = parseContractPlatform(tx.contract_call.contract_id);
// 返回: "Bitflow", "Velar", "Zest Protocol" 等
```

#### `parseTokenSymbol(tokenId: string): string`
从代币 ID 中提取代币符号。

```typescript
const symbol = parseTokenSymbol("wrapped-stx");
// 返回: "wSTX"
```

#### `parseSwapInfo(tx: StacksTransaction): string`
从交易中提取 swap 详情。

```typescript
const swapInfo = parseSwapInfo(transaction);
// 返回: "3000 aeUSDC ==> 4855 STX"
```

#### `formatAmount(amount: string): string`
智能格式化金额。

```typescript
const formatted = formatAmount("1000000");
// 返回: "1.00"
```

### 数据流

```
Stacks API
    ↓
getStacksTransactions()
    ↓
transformedData (映射)
    ↓
parseContractPlatform() + parseSwapInfo()
    ↓
MonitorData[]
    ↓
表格显示
```

## 使用示例

### 查看 Bitflow 交易
1. 打开 Stacks 监控页面
2. 在类型筛选中选择"合约调用"
3. 在搜索框输入"Bitflow"或"BFT"
4. 查看带有 Bitflow 标签和 swap 信息的交易

### 查看特定代币的 Swap
1. 在搜索框输入代币符号，如"aeUSDC"或"xBTC"
2. 系统会筛选包含该代币的交易
3. 交易信息列会显示完整的 swap 详情

## 已知限制

1. **解析准确性**
   - Swap 信息解析依赖于交易参数的结构
   - 某些特殊格式的交易可能无法完全解析
   - 估计覆盖率：约 70-80% 的 swap 交易

2. **API 限制**
   - Hiro API 有速率限制
   - 大量请求可能需要等待
   - 免费版 API 功能有限

3. **平台支持**
   - 新平台需要手动添加合约地址
   - 某些平台可能有多个合约地址
   - 需要持续更新以支持新平台

## 未来改进方向

1. **增强解析能力**
   - 支持更复杂的多跳 swap
   - 解析 NFT 交易
   - 识别流动性添加/移除操作

2. **更多平台**
   - 从 https://www.stacks.co/explore/ecosystem 获取新平台
   - 定期更新合约地址列表
   - 社区贡献平台信息

3. **数据可视化**
   - 添加交易量图表
   - 平台活跃度统计
   - 代币价格趋势

4. **性能优化**
   - 实现本地缓存
   - 批量 API 请求
   - WebSocket 实时更新

## 参考资源

- [Stacks Ecosystem](https://www.stacks.co/explore/ecosystem)
- [Hiro API Documentation](https://docs.hiro.so/api)
- [Bitflow Finance](https://app.bitflow.finance)
- [Velar DEX](https://app.velar.com)
- [Zest Protocol](https://app.zestprotocol.com)

## 贡献

如果发现新的 DeFi 平台或需要改进解析逻辑，请：
1. 提交 Issue 说明平台信息
2. 提供合约地址
3. 提供交易样例
4. 提交 Pull Request

---

**更新日期**: 2025-01-XX
**版本**: 1.0.0
