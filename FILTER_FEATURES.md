# Visual Features Documentation

## Multi-Select Filters Implementation

### StarknetMonitor.tsx

#### Filter UI Components

The page now includes a two-row filter section:

**Row 1: Action Buttons and Search**
- Refresh Data button with loading state
- Transaction hash search input (300px width)
- Clear Filters button (resets all filters and pagination)

**Row 2: Multi-Select Dropdowns**
- **Transaction Type Filter** (mode="multiple")
  - Options: INVOKE (调用), DEPLOY (部署), DECLARE (声明), DEPLOY_ACCOUNT (部署账户), L1_HANDLER (L1处理器)
  - Min-width: 200px
  - Placeholder: "选择交易类型"
  
- **Transaction Status Filter** (mode="multiple")
  - Options: ACCEPTED_ON_L1 (L1已确认), ACCEPTED_ON_L2 (L2已确认), PENDING (待处理), REJECTED (已拒绝)
  - Min-width: 200px
  - Placeholder: "选择交易状态"

#### Filter Logic

```tsx
// State management
const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

// Filter data based on all conditions (AND logic)
dataSource={transactions.filter(tx => {
  const matchHash = !searchHash || tx.hash.toLowerCase().includes(searchHash.toLowerCase());
  const matchType = selectedTypes.length === 0 || selectedTypes.includes(tx.type);
  const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(tx.status);
  return matchHash && matchType && matchStatus;
})}
```

### Stacks Monitor Index Page (index.tsx)

Similar implementation with different filter options:

**Transaction Type Filter**
- transfer (转账)
- swap (交换)
- contract (合约调用)

**Status Filter**
- success (成功)
- pending (待处理)
- failed (失败)

## Pagination Updates

### Before
```tsx
pageSizeOptions: ['3', '5', '8', '20', '50']
```

### After
```tsx
pageSizeOptions: ['3', '5', '10', '50', '100']
```

### Configuration
- Default page size: 10 (changed from 20 in StarknetMonitor)
- Show size changer: enabled
- Show quick jumper: enabled
- Show total: `共 ${total} 条记录`
- All options now consistent across monitoring pages

## UI Layout Structure

```
Card (Operations & Filters)
├── Space (direction="vertical", size="middle", width="100%")
    ├── Space (Row 1 - wrap)
    │   ├── Button (Refresh)
    │   ├── Input (Search)
    │   └── Button (Clear Filters)
    └── Space (Row 2 - wrap)
        ├── Text ("类型筛选：")
        ├── Select (mode="multiple" for types)
        ├── Text ("状态筛选：")
        └── Select (mode="multiple" for statuses)
```

## User Interaction Flow

1. **Initial Load**
   - All data displayed with default pagination (10 items)
   - Filters are empty (showing placeholders)

2. **Applying Filters**
   - User can select multiple types (e.g., INVOKE + DEPLOY)
   - User can select multiple statuses (e.g., ACCEPTED_ON_L1 + ACCEPTED_ON_L2)
   - Filters work together with AND logic
   - Search box works in combination with filters

3. **Clearing Filters**
   - Click "清除筛选" button
   - All filters reset: searchHash='', selectedTypes=[], selectedStatuses=[]
   - Pagination resets to page 1

4. **Pagination**
   - User can select items per page: 3, 5, 10, 50, or 100
   - Page number persists during filtering
   - Total count updates based on filtered results

## Responsive Design

- All filter components use `wrap` on Space component
- Dropdowns have minimum width (200px) but can expand
- Search input has fixed width (300px)
- Layout adapts to screen size automatically

## Accessibility Features

- Proper labels for filters ("类型筛选：", "状态筛选：")
- Placeholders in select dropdowns
- Icon indicators for action buttons
- Loading states on refresh button
- Keyboard navigation support (native Select component)

## Code Quality Improvements

### Removed Unused Code
- Unused imports (useCallback, Statistic, Row, Col, etc.)
- Unused state variables in Alex.tsx
- Duplicate style properties fixed
- TypeScript warnings resolved with underscore prefixes

### Type Safety
- All filter states properly typed as `string[]`
- Filter functions use type guards
- No `any` types in filter logic

## Performance Considerations

- Filters run client-side on already loaded data
- No re-fetching on filter changes (fast response)
- Pagination works on filtered dataset
- Efficient array filtering with early returns

## Future Enhancement Possibilities

- Add date range picker for time-based filtering
- Add amount range slider for transaction value filtering
- Add platform/protocol multi-select filter
- Add save/load filter presets
- Add export filtered results to CSV
- Add filter combination indicators (chips)
