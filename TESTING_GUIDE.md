# 测试指南 / Testing Guide

本文档说明如何测试最近对 Stacks 监控和系统管理功能的改进。

## 问题一：Stacks 监控增强

### 新增功能
1. **更多 DeFi 平台支持**
   - Bitflow (app.bitflow.finance)
   - Velar (app.velar.com/swap)
   - Zest Protocol (app.zestprotocol.com)
   - LNSwap
   - CatamaranSwap
   - 以及其他 Stacks 生态系统平台

2. **交易信息解析**
   - 自动解析交易中的代币交换信息
   - 显示格式：`3000 aeUSDC ==> 4855 STX`
   - 支持的代币：STX, xBTC, aeUSDC, sUSDT, WELSH, stSTX, VELAR, BFT, ALEX, DIKO 等

### 测试步骤
1. 启动开发服务器：`npm run dev`
2. 以管理员身份登录系统
3. 导航到 "Stacks监控" 页面
4. 观察交易列表中的以下改进：
   - 新的 "平台" 列显示 DeFi 平台名称
   - 新的 "交易信息" 列显示 swap 详情（如果存在）
   - 搜索功能现在支持搜索交易信息

### 预期结果
- 表格应显示实时的 Stacks 交易数据
- 合约调用应正确识别平台（如 Bitflow, Velar, Zest Protocol）
- Swap 交易应显示代币数量和符号（例如："3000 aeUSDC ==> 4855 STX"）
- 搜索框可以按交易ID、地址或交易信息进行过滤

## 问题二：系统管理页面修复

### 修复的页面
1. **用户管理** (`/system/users`)
2. **角色管理** (`/system/roles`)
3. **菜单管理** (`/system/menus`)
4. **接口管理** (`/system/apis`)
5. **操作日志** (`/system/operation-logs`)

### 改进内容
1. **更好的错误处理**
   - 所有 API 调用现在都有详细的错误消息
   - 控制台会记录完整的响应数据用于调试
   - 用户界面显示具体的错误信息

2. **菜单管理特殊修复**
   - Switch 组件值现在正确转换为数字（0/1）
   - 状态：true -> 1（启用），false -> 2（禁用）
   - 隐藏/不缓存：true -> 1，false -> 0
   - 编辑时正确加载现有值

### 测试步骤
1. 确保后端 API 服务器运行在 `http://127.0.0.1:10000/api/v1`
2. 以管理员身份登录前端
3. 测试每个管理页面：

#### 用户管理
- [ ] 查看用户列表
- [ ] 搜索用户（按用户名、昵称、手机号）
- [ ] 添加新用户
- [ ] 编辑现有用户
- [ ] 删除用户
- [ ] 批量删除

#### 角色管理
- [ ] 查看角色列表
- [ ] 搜索角色（按名称、关键字）
- [ ] 添加新角色
- [ ] 编辑现有角色
- [ ] 删除角色

#### 菜单管理
- [ ] 查看菜单列表
- [ ] 添加新菜单（测试 Switch 组件）
- [ ] 编辑菜单（确认 Switch 值正确显示）
- [ ] 删除菜单

#### API 管理
- [ ] 查看 API 列表
- [ ] 搜索 API
- [ ] 添加新 API
- [ ] 编辑 API
- [ ] 删除 API

#### 操作日志
- [ ] 查看日志列表
- [ ] 搜索日志
- [ ] 删除日志

### 调试技巧
如果遇到问题：
1. 打开浏览器开发者工具控制台
2. 查看 `console.log` 输出的 API 响应
3. 检查网络标签中的 API 请求和响应
4. 确认后端 API 返回 `code: 201` 表示成功

### 预期 API 响应格式
```json
{
  "code": 201,
  "msg": "success",
  "data": {
    "list": [...],
    "total": 100
  }
}
```

## 代码改进摘要

### src/api/stacks.ts
- 新增多个 DeFi 平台到 `platformMap`
- 新增 `parseTokenSymbol()` 函数识别代币
- 新增 `parseSwapInfo()` 函数提取交易详情
- 新增 `formatAmount()` 辅助函数格式化金额

### src/views/stacks/index.tsx
- 集成真实的 Stacks API 调用
- 添加 "平台" 和 "交易信息" 列
- 改进搜索功能包含 swap 信息
- 更新筛选器选项为中文值

### src/views/system/*.tsx
- 所有页面添加 `console.log` 用于调试
- 改进错误处理显示具体消息
- MenuManagement: 添加 Switch 值转换逻辑
- 修复 ApiManagement 语法错误

## 已知限制
1. Swap 信息解析依赖于交易参数的结构，可能无法解析所有交易
2. 某些平台的合约地址可能需要进一步更新
3. 需要后端 API 运行才能完整测试系统管理功能

## 下一步建议
1. 收集更多 Stacks DeFi 平台的合约地址
2. 改进 swap 信息解析算法以覆盖更多交易类型
3. 添加单元测试验证解析功能
4. 考虑添加平台图标以改善视觉效果
