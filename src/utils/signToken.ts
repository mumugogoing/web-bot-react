import * as CryptoJS from 'crypto-js';
import qs from 'qs';
import stringify from 'json-stable-stringify';

// 生成签名令牌
export const signToken = (cfg: {
  base?: string;
  url?: string;
  method?: string;
  params?: any;
  data?: any;
}) => {
  let uri = '/' + (cfg.base || '') + (cfg.url || '');
  try {
    const url = new URL(cfg.base || '');
    uri = url.pathname + (cfg.url || '');
  } catch (e) {
    // 忽略错误，使用默认uri
  }

  if (cfg.params) {
    const s = qs.stringify(cfg.params);
    if (s !== '') {
      uri += '?' + s;
    }
  }
  
  let body = {};
  if (cfg.data) {
    body = cfg.data;
  }
  
  if (typeof cfg.method === 'undefined') {
    cfg.method = 'get';
  }
  
  const m = cfg.method.toLocaleUpperCase();
  const timestamp = new Date().getTime();
  const str = m + '|' + uri + '|' + timestamp + '|' + stringify(body);
  
  // 签名密钥，与后端配置一致
  const signId = 'gin-web';
  const signSecret = 'gin-web';
  
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(str, signSecret)
  );
  
  return [
    `appid="${signId}"`,
    `timestamp="${timestamp}"`,
    `signature="${signature}"`
  ].join(',');
};