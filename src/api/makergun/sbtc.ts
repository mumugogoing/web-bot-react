import request from '@/utils/request';

// SBTC MakerGun configuration interface
export interface SbtcMakerGunConfig {
  sellamount: number;
  buyamount: number;
  up: number;
  down: number;
  sellswitch: boolean;
  buyswitch: boolean;
  sellfee: number;
  buyfee: number;
  model: number;
  check_balance: boolean;
}

// SBTC MakerGun status response
export interface SbtcMakerGunStatus {
  running: boolean;
  config?: SbtcMakerGunConfig;
  data?: any;
}

// Start SBTC MakerGun
export const startSbtcMakerGun = (config: SbtcMakerGunConfig) =>
  request({
    url: '/xyk/sbtc-makergun/start',
    method: 'post',
    data: config
  });

// Stop SBTC MakerGun
export const stopSbtcMakerGun = () =>
  request({
    url: '/xyk/sbtc-makergun/stop',
    method: 'post'
  });

// Get SBTC MakerGun status
export const getSbtcMakerGunStatus = () =>
  request<SbtcMakerGunStatus>({
    url: '/xyk/sbtc-makergun/status',
    method: 'get'
  });

// Submit manual SBTC/STX order
export interface SbtcStxOrderParams {
  amount: number;
  position: number; // 0 for sell SBTC, 1 for buy SBTC
}

export const submitSbtcStxOrder = (params: SbtcStxOrderParams) =>
  request({
    url: '/xyk/sbtc-stx/order',
    method: 'post',
    data: params
  });
