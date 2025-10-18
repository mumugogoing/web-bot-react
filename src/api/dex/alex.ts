import request from '@/utils/request';

export const getAbtBtcDiff = (params: any) =>
  request({
    url: '/alex/abtcbtcdiff',
    method: 'get',
    params
  });

export const getDtdhdiff = (params: any) =>
  request({
    url: '/alex/dtdhdiff',
    method: 'get',
    params
  });

export const calcsumdc = (params: any) =>
  request({
    url: '/calc/sumdc',
    method: 'get',
    params
  });

export const xykAutoSell = (data: any) =>
  request({
    url: '/dex/xykautosell',
    method: 'post',
    data
  });

export const xykAutoBuy = (data: any) =>
  request({
    url: '/dex/xykautobuy',
    method: 'post',
    data
  });

export const xykfetchdx = (data: any) =>
  request({
    url: '/dex/xykfetchdx',
    method: 'post',
    data
  });

export const xykfetchdy = (data: any) =>
  request({
    url: '/dex/xykfetchdy',
    method: 'post',
    data
  });

export const createCexOrder = (data: any) =>
  request({
    url: '/dex/createcexorder',
    method: 'post',
    data
  });

export const checkTxStatusApi = (txid: string) =>
  request({
    url: '/dex/checktxstatus',
    method: 'get',
    params: { txid }
  });

export const xykSerialize = (data: any) =>
  request({
    url: '/dex/xykserialize',
    method: 'post',
    data
  });

export const checkAddressPendingTx = (address: string) =>
  request({
    url: '/dex/checkaddresspendingtx',
    method: 'get',
    params: { address }
  });