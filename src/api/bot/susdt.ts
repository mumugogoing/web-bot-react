import request from '@/utils/request';

// sUSDT configuration interface
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SUSDTConfig {
  // Add specific config fields based on backend requirements
  // These will be defined based on the actual backend implementation
}

// sUSDT status response
export interface SUSDTStatus {
  running: boolean;
  config?: SUSDTConfig;
  data?: unknown;
}

// Start sUSDT
export const startSUSDT = (config: SUSDTConfig) =>
  request({
    url: '/api/v1/bot/susdt/start',
    method: 'post',
    data: config
  });

// Stop sUSDT
export const stopSUSDT = () =>
  request({
    url: '/api/v1/bot/susdt/stop',
    method: 'post'
  });

// Get sUSDT status
export const getSUSDTStatus = () =>
  request<SUSDTStatus>({
    url: '/api/v1/bot/susdt/status',
    method: 'get'
  });
