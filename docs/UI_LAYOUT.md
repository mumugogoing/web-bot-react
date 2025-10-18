# STX/AEUSDC Order Pressing Feature - UI Layout

## Visual Layout Description

### Order Pressing Control Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STX/AEUSDC 压单功能                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  [压单开启/关闭]  [输入要监控的Stacks地址_____________]  [无Pending交易]       │
│                                                    最后检查: 14:23:45         │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 监控日志                                                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ 14:23:45 - 检测到pending交易，自动提交xykserialize                    │   │
│  │ 14:23:43 - xykserialize提交成功                                      │   │
│  │ 14:23:40 - 检测到pending交易，自动提交xykserialize                    │   │
│  │ ...                                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ⚠️ 重要提示：开启前请确保已在下方STX/AEUSDC交易表单中设置好金额、           │
│  费率并获取dy值                                                               │
│                                                                               │
│  说明：开启压单功能后，系统将每2秒检查一次指定地址的pending交易状态。        │
│  一旦检测到pending交易，将自动使用当前表单参数提交xykserialize交易。         │
│  为防止重复提交，每次提交后会有3秒冷却时间。                                 │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## UI Component Breakdown

### 1. Title Section
- **Text**: "STX/AEUSDC 压单功能"
- **Style**: Bold, 10px margin bottom

### 2. Control Row
Located in a horizontal flex container with 10px gap:

#### a. Toggle Switch
- **Type**: Ant Design Switch component
- **States**:
  - ON: "压单开启" (green background)
  - OFF: "压单关闭" (gray background)
- **Validation**: Checks for address and dy value before enabling

#### b. Address Input
- **Type**: Ant Design Input component
- **Placeholder**: "输入要监控的Stacks地址"
- **Width**: 400px
- **Style**: Standard input with border

#### c. Status Tag
- **Type**: Ant Design Tag component
- **Colors**:
  - Green: "无Pending交易" (no pending transactions)
  - Red: "Pending交易检测中" (pending detected)
  - Blue: "提交中..." (submitting, appears next to status)

#### d. Timestamp
- **Text**: "最后检查: HH:MM:SS"
- **Style**: 12px font, gray color (#666)
- **Format**: Chinese locale time

### 3. Activity Log (Conditional)
Only shown when `orderPressingLog.length > 0`:

#### Card Component
- **Size**: Small
- **Title**: "监控日志"
- **Style**: 10px top margin

#### Log Container
- **Max Height**: 200px
- **Overflow**: Auto (scrollable)
- **Content**: List of log messages

#### Log Entry
- **Padding**: 4px vertical, 0 horizontal
- **Font Size**: 12px
- **Colors**:
  - Red (#ff4d4f): Error messages containing "错误" or "失败"
  - Gray (#666): Normal messages
- **Format**: "HH:MM:SS - [message]"

### 4. Information Section
Two text blocks with explanatory information:

#### Warning (Red)
- **Color**: #ff4d4f (red)
- **Icon**: ⚠️
- **Text**: Reminder to prepare parameters before enabling
- **Margin**: 5px bottom

#### Description (Gray)
- **Color**: #999 (gray)
- **Font Size**: 12px
- **Content**: 
  - Monitoring frequency (2 seconds)
  - Auto-submission behavior
  - Cooldown period (3 seconds)

## State-Based UI Changes

### When Disabled (Default)
```
[压单关闭] [_______________________] [无Pending交易]
```
- Switch: Gray, shows "压单关闭"
- No log section visible
- No timestamp shown

### When Enabled (Monitoring)
```
[压单开启] [SP1ABC...XYZ123] [无Pending交易] 最后检查: 14:23:45
```
- Switch: Green, shows "压单开启"
- Address filled in
- Green status tag
- Timestamp updating every 2 seconds

### When Pending Detected
```
[压单开启] [SP1ABC...XYZ123] [Pending交易检测中] 最后检查: 14:23:46

┌─ 监控日志 ─────────────────────────────┐
│ 14:23:46 - 检测到pending交易...         │
└────────────────────────────────────────┘
```
- Status tag: Red "Pending交易检测中"
- Log appears with detection message
- About to trigger submission

### When Submitting
```
[压单开启] [SP1ABC...XYZ123] [Pending交易检测中] [提交中...] 14:23:46

┌─ 监控日志 ─────────────────────────────┐
│ 14:23:46 - 检测到pending交易...         │
│ 14:23:46 - xykserialize提交成功         │
└────────────────────────────────────────┘
```
- Blue "提交中..." tag appears
- Log shows submission status
- Cooldown period active (3 seconds)

### On Error
```
[压单开启] [SP1ABC...XYZ123] [无Pending交易] 最后检查: 14:23:47

┌─ 监控日志 ─────────────────────────────┐
│ 14:23:47 - 监控错误: Network timeout    │ (red text)
│ 14:23:46 - xykserialize提交成功         │
└────────────────────────────────────────┘
```
- Error message in red
- Monitoring continues
- Previous logs preserved

## Responsive Behavior

### Desktop (> 768px)
- Full width layout
- Address input: 400px
- All elements in single row
- Log card: Full width

### Mobile (< 768px)
- Stack vertically
- Address input: 100% width
- Status tags wrap to new line
- Log card: Full width with scroll

## Accessibility Features

1. **Color Coding**: Three distinct colors for different states
2. **Text Labels**: Clear Chinese text for all states
3. **Timestamps**: Help users understand freshness of data
4. **Scrollable Logs**: Preserves history without cluttering UI
5. **Warning Messages**: Clear red warning before enabling
6. **Validation Feedback**: Immediate feedback on invalid actions

## Integration with Parent Component

This panel is inserted between the balance table and the trading tables:

```
[Balance Table]
    ↓
[Order Pressing Panel] ← NEW
    ↓
[STX/AEUSDC Trading Table]
    ↓
[Other Trading Pairs...]
```

All components use Ant Design's Card component with consistent styling and 20px vertical margins.
