import request from '@/utils/request';

// AutoSwap configuration interface
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AutoSwapConfig {
  // Add specific config fields based on backend requirements
  // These will be defined based on the actual backend implementation
}

// AutoSwap status response
export interface AutoSwapStatus {
  running: boolean;
  config?: AutoSwapConfig;
  data?: unknown;
}

// Start AutoSwap
export const startAutoSwap = (config: AutoSwapConfig) =>
  request({
    url: '/api/v1/bot/autoswap/start',
    method: 'post',
    data: config
  });

// Stop AutoSwap
export const stopAutoSwap = () =>
  request({
    url: '/api/v1/bot/autoswap/stop',
    method: 'post'
  });

// Get AutoSwap status
export const getAutoSwapStatus = () =>
  request<AutoSwapStatus>({
    url: '/api/v1/bot/autoswap/status',
    method: 'get'
  });
