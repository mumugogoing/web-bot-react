import request from '@/utils/request';

// MakerGun configuration interface
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MakerGunConfig {
  // Add specific config fields based on backend requirements
  // These will be defined based on the actual backend implementation
}

// MakerGun status response
export interface MakerGunStatus {
  running: boolean;
  config?: MakerGunConfig;
  data?: unknown;
}

// Start MakerGun
export const startMakerGun = (config: MakerGunConfig) =>
  request({
    url: '/api/v1/bot/makergun/start',
    method: 'post',
    data: config
  });

// Stop MakerGun
export const stopMakerGun = () =>
  request({
    url: '/api/v1/bot/makergun/stop',
    method: 'post'
  });

// Get MakerGun status
export const getMakerGunStatus = () =>
  request<MakerGunStatus>({
    url: '/api/v1/bot/makergun/status',
    method: 'get'
  });
