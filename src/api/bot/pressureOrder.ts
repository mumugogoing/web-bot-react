import request from '@/utils/request';

// Pressure order configuration
export interface PressureOrderConfig {
  enabled: boolean;
  monitoredAddresses: string[];
  tradePair: 'STX/AEUSDC' | 'STX/BTC' | 'STX/USDT';
  tradeAmount: number;
  tradeDirection: 'buy' | 'sell' | 'auto';
  maxApiCallsPerMinute: number;
  checkIntervalMs: number;
}

// Pressure order status
export interface PressureOrderStatus {
  running: boolean;
  monitoredAddresses: string[];
  lastCheckTime: string;
  detectedTransactions: number;
  executedTrades: number;
  currentApiCallRate: number;
  errors: string[];
}

// Transaction detection event
export interface DetectedTransaction {
  txId: string;
  address: string;
  timestamp: string;
  type: string;
  amount?: string;
  autoTradeExecuted: boolean;
  tradeResult?: string;
}

// Get current configuration
export const getPressureOrderConfig = () =>
  request<PressureOrderConfig>({
    url: '/api/v1/bot/pressure-order/config',
    method: 'get'
  });

// Update configuration
export const updatePressureOrderConfig = (config: Partial<PressureOrderConfig>) =>
  request({
    url: '/api/v1/bot/pressure-order/config',
    method: 'put',
    data: config
  });

// Start pressure order monitoring
export const startPressureOrder = () =>
  request({
    url: '/api/v1/bot/pressure-order/start',
    method: 'post'
  });

// Stop pressure order monitoring
export const stopPressureOrder = () =>
  request({
    url: '/api/v1/bot/pressure-order/stop',
    method: 'post'
  });

// Get pressure order status
export const getPressureOrderStatus = () =>
  request<PressureOrderStatus>({
    url: '/api/v1/bot/pressure-order/status',
    method: 'get'
  });

// Get detected transactions history
export const getDetectedTransactions = (limit: number = 50) =>
  request<DetectedTransaction[]>({
    url: '/api/v1/bot/pressure-order/transactions',
    method: 'get',
    params: { limit }
  });
