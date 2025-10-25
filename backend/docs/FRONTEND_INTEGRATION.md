# Frontend Integration Guide

Guide for integrating AutoSwap API with React frontend (https://github.com/mumugogoing/web-bot-react).

## Installation

No additional dependencies required beyond existing project setup.

## API Configuration

Update `.env` to point to AutoSwap backend:

```env
VITE_BASE_API=http://localhost:10000
```

## TypeScript Interfaces

Create `src/types/autoswap.ts`:

```typescript
export interface AeUSDCData {
  timestamp: string;
  xyk_diff: number;
  aeusdc_balance: number;
  stx_balance: number;
  last_trade?: string;
  running: boolean;
}

export interface XykSBTCData {
  timestamp: string;
  price_diff: number;
  sbtc_price: number;
  xyk_price: number;
  last_alert?: string;
  running: boolean;
}

export interface CombinedStatus {
  aeusdc: AeUSDCData;
  xyksbtc: XykSBTCData;
}

export interface PriceData {
  timestamp: string;
  aeusdc_price: number;
  sbtc_price: number;
  stx_price: number;
  pools: {
    aeusdc_stx: number;
    sbtc_stx: number;
  };
}

export interface AeUSDCConfig {
  just_monitor: boolean;
}

export interface XykSBTCConfig {
  just_monitor: boolean;
}
```

## API Client

Create `src/api/autoswap.ts`:

```typescript
import request from '@/utils/request';
import type { 
  AeUSDCData, 
  XykSBTCData, 
  CombinedStatus, 
  PriceData,
  AeUSDCConfig,
  XykSBTCConfig 
} from '@/types/autoswap';

// AeUSDC endpoints
export const startAeUSDC = (config: AeUSDCConfig) =>
  request({
    url: '/api/v1/autoswap/aeusdc/start',
    method: 'post',
    data: config
  });

export const stopAeUSDC = () =>
  request({
    url: '/api/v1/autoswap/aeusdc/stop',
    method: 'post'
  });

export const getAeUSDCStatus = () =>
  request<AeUSDCData>({
    url: '/api/v1/autoswap/aeusdc/status',
    method: 'get'
  });

// XykSBTC endpoints
export const startXykSBTC = (config: XykSBTCConfig) =>
  request({
    url: '/api/v1/autoswap/xyksbtc/start',
    method: 'post',
    data: config
  });

export const stopXykSBTC = () =>
  request({
    url: '/api/v1/autoswap/xyksbtc/stop',
    method: 'post'
  });

export const getXykSBTCStatus = () =>
  request<XykSBTCData>({
    url: '/api/v1/autoswap/xyksbtc/status',
    method: 'get'
  });

// Combined endpoints
export const getCombinedStatus = () =>
  request<CombinedStatus>({
    url: '/api/v1/autoswap/status',
    method: 'get'
  });

export const getPrices = () =>
  request<PriceData>({
    url: '/api/v1/autoswap/prices',
    method: 'get'
  });
```

## Custom Hook

Create `src/hooks/useAutoSwap.ts`:

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import type { AeUSDCData, XykSBTCData } from '@/types/autoswap';

interface UseAutoSwapResult {
  data: AeUSDCData | XykSBTCData | null;
  connected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export const useAutoSwap = (
  type: 'aeusdc' | 'xyksbtc'
): UseAutoSwapResult => {
  const [data, setData] = useState<AeUSDCData | XykSBTCData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const baseUrl = import.meta.env.VITE_BASE_API || 'http://localhost:10000';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    const url = `${wsUrl}/api/v1/autoswap/${type}/ws`;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log(`WebSocket connected: ${type}`);
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log(`WebSocket closed: ${type}`);
        setConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      setError(`Failed to connect: ${err}`);
    }
  }, [type]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    data,
    connected,
    error,
    connect,
    disconnect
  };
};
```

## React Component Example

Create `src/views/AutoSwapMonitor.tsx`:

```typescript
import React, { useState } from 'react';
import { Card, Button, Statistic, Row, Col, Switch, message } from 'antd';
import { useAutoSwap } from '@/hooks/useAutoSwap';
import { startAeUSDC, stopAeUSDC, startXykSBTC, stopXykSBTC } from '@/api/autoswap';
import type { AeUSDCData, XykSBTCData } from '@/types/autoswap';

const AutoSwapMonitor: React.FC = () => {
  const [tradeMode, setTradeMode] = useState(false);
  const aeusdc = useAutoSwap('aeusdc');
  const xyksbtc = useAutoSwap('xyksbtc');

  const handleStartAeUSDC = async () => {
    try {
      await startAeUSDC({ just_monitor: !tradeMode });
      aeusdc.connect();
      message.success('AeUSDC monitor started');
    } catch (err) {
      message.error(`Failed to start: ${err}`);
    }
  };

  const handleStopAeUSDC = async () => {
    try {
      await stopAeUSDC();
      aeusdc.disconnect();
      message.success('AeUSDC monitor stopped');
    } catch (err) {
      message.error(`Failed to stop: ${err}`);
    }
  };

  const handleStartXykSBTC = async () => {
    try {
      await startXykSBTC({ just_monitor: true });
      xyksbtc.connect();
      message.success('XykSBTC monitor started');
    } catch (err) {
      message.error(`Failed to start: ${err}`);
    }
  };

  const handleStopXykSBTC = async () => {
    try {
      await stopXykSBTC();
      xyksbtc.disconnect();
      message.success('XykSBTC monitor stopped');
    } catch (err) {
      message.error(`Failed to stop: ${err}`);
    }
  };

  const aeUSDCData = aeusdc.data as AeUSDCData | null;
  const xykSBTCData = xyksbtc.data as XykSBTCData | null;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16}>
        {/* AeUSDC Monitor */}
        <Col span={12}>
          <Card 
            title="AeUSDC Monitor"
            extra={
              <Switch 
                checkedChildren="Trade Mode" 
                unCheckedChildren="Monitor Only"
                checked={tradeMode}
                onChange={setTradeMode}
                disabled={aeUSDCData?.running}
              />
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="XYK Diff" 
                  value={aeUSDCData?.xyk_diff || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: (aeUSDCData?.xyk_diff || 0) > 0 ? '#3f8600' : '#cf1322' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Status" 
                  value={aeUSDCData?.running ? 'Running' : 'Stopped'}
                  valueStyle={{ color: aeUSDCData?.running ? '#3f8600' : '#cf1322' }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic 
                  title="aeUSDC Balance" 
                  value={aeUSDCData?.aeusdc_balance || 0}
                  precision={2}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="STX Balance" 
                  value={aeUSDCData?.stx_balance || 0}
                  precision={2}
                />
              </Col>
            </Row>

            {aeUSDCData?.last_trade && (
              <div style={{ marginTop: 16 }}>
                <strong>Last Trade:</strong> {aeUSDCData.last_trade}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                onClick={handleStartAeUSDC}
                disabled={aeUSDCData?.running}
                style={{ marginRight: 8 }}
              >
                Start
              </Button>
              <Button 
                danger
                onClick={handleStopAeUSDC}
                disabled={!aeUSDCData?.running}
              >
                Stop
              </Button>
            </div>
          </Card>
        </Col>

        {/* XykSBTC Monitor */}
        <Col span={12}>
          <Card title="XykSBTC Monitor">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="Price Diff" 
                  value={xykSBTCData?.price_diff || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: (xykSBTCData?.price_diff || 0) > 0 ? '#3f8600' : '#cf1322' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Status" 
                  value={xykSBTCData?.running ? 'Running' : 'Stopped'}
                  valueStyle={{ color: xykSBTCData?.running ? '#3f8600' : '#cf1322' }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic 
                  title="SBTC Price" 
                  value={xykSBTCData?.sbtc_price || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="XYK Price" 
                  value={xykSBTCData?.xyk_price || 0}
                  precision={2}
                  prefix="$"
                />
              </Col>
            </Row>

            {xykSBTCData?.last_alert && (
              <div style={{ marginTop: 16 }}>
                <strong>Last Alert:</strong> {xykSBTCData.last_alert}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                onClick={handleStartXykSBTC}
                disabled={xykSBTCData?.running}
                style={{ marginRight: 8 }}
              >
                Start
              </Button>
              <Button 
                danger
                onClick={handleStopXykSBTC}
                disabled={!xykSBTCData?.running}
              >
                Stop
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AutoSwapMonitor;
```

## Adding to Router

Update `src/router/index.tsx`:

```typescript
import AutoSwapMonitor from '@/views/AutoSwapMonitor';

// Add to routes
{
  path: "autoswap",
  element: <AutoSwapMonitor />,
}
```

## Adding to Navigation

Update `src/components/Navigation.tsx`:

```typescript
{
  label: <Link to="/autoswap">AutoSwap Monitor</Link>,
  key: '/autoswap',
  icon: <MonitorOutlined />,
}
```

## WebSocket Best Practices

### 1. Automatic Reconnection

```typescript
const useAutoReconnect = (
  connect: () => void,
  connected: boolean,
  maxRetries = 5
) => {
  const retriesRef = useRef(0);

  useEffect(() => {
    if (!connected && retriesRef.current < maxRetries) {
      const timeout = setTimeout(() => {
        console.log(`Reconnecting... (${retriesRef.current + 1}/${maxRetries})`);
        connect();
        retriesRef.current++;
      }, 5000);

      return () => clearTimeout(timeout);
    }

    if (connected) {
      retriesRef.current = 0;
    }
  }, [connected, connect, maxRetries]);
};
```

### 2. Connection Status Indicator

```typescript
const ConnectionStatus: React.FC<{ connected: boolean }> = ({ connected }) => (
  <Badge 
    status={connected ? 'success' : 'error'} 
    text={connected ? 'Connected' : 'Disconnected'} 
  />
);
```

### 3. Error Handling

```typescript
useEffect(() => {
  if (aeusdc.error) {
    message.error(`WebSocket error: ${aeusdc.error}`);
  }
}, [aeusdc.error]);
```

## Performance Optimization

### 1. Memoize Callbacks

```typescript
const handleStart = useCallback(async () => {
  // ... start logic
}, [tradeMode]);
```

### 2. Debounce Updates

```typescript
import { debounce } from 'lodash';

const debouncedUpdate = useMemo(
  () => debounce((data) => {
    setDisplayData(data);
  }, 100),
  []
);
```

### 3. Virtualized Lists

For displaying trade history or logs:

```typescript
import { List } from 'react-virtualized';
```

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useAutoSwap } from '@/hooks/useAutoSwap';

describe('useAutoSwap', () => {
  it('should connect to WebSocket', () => {
    const { result } = renderHook(() => useAutoSwap('aeusdc'));
    
    result.current.connect();
    
    // Wait for connection
    waitFor(() => {
      expect(result.current.connected).toBe(true);
    });
  });
});
```

### Integration Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import AutoSwapMonitor from '@/views/AutoSwapMonitor';

describe('AutoSwapMonitor', () => {
  it('should start monitor on button click', async () => {
    render(<AutoSwapMonitor />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });
});
```

## Production Deployment

### Environment Variables

```env
# Development
VITE_BASE_API=http://localhost:10000

# Production
VITE_BASE_API=https://api.yourdomain.com
```

### WebSocket URL Construction

```typescript
const getWebSocketUrl = () => {
  const baseUrl = import.meta.env.VITE_BASE_API;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return baseUrl.replace(/^https?:/, protocol);
};
```

## Troubleshooting

### WebSocket Connection Failed

1. Check backend is running on correct port
2. Verify CORS configuration
3. Check browser console for errors
4. Verify WebSocket URL format

### Data Not Updating

1. Check WebSocket connection status
2. Verify monitor is running (call status endpoint)
3. Check network tab for WebSocket messages
4. Verify data parsing in onmessage handler

### High Memory Usage

1. Implement data pagination
2. Limit history size
3. Use virtualized lists
4. Clean up WebSocket connections

## Additional Resources

- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [Ant Design Components](https://ant.design/components/overview/)
