import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, removeToken, getIdempotenceToken, setIdempotenceToken } from './cookies';
import { signToken } from './signToken';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API as string || 'http://localhost:8080', // url = base url + request url
  timeout: 30000 // 请求超时时间: 从10秒改为30秒
});

// 正在刷新token的标记
let refreshing = false;
// 重试队列
let requests: Array<() => void> = [];

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在请求头中添加认证信息等
    const token = getToken();
    // 登录和刷新token请求不需要认证头
    const noAuthUrls = ['/base/login', '/base/refreshToken'];
    if (token && !noAuthUrls.includes(config.url || '')) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    
    // 添加幂等性token（排除登录和刷新token请求）
    const idempotenceToken = getIdempotenceToken();
    if (idempotenceToken && !noAuthUrls.includes(config.url || '')) {
      config.headers['api-idempotence-token'] = idempotenceToken;
    }
    
    // 添加签名令牌
    config.headers['X-Sign-Token'] = signToken({
      base: config.baseURL,
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 从响应头中提取并保存幂等性token（如果后端返回了新token）
    const newIdempotenceToken = response.headers['api-idempotence-token'];
    if (newIdempotenceToken) {
      setIdempotenceToken(newIdempotenceToken);
    }
    
    // 处理响应数据
    const res = response.data;
    if (res.code !== 201) {
      // 处理错误状态码
      const msg = res.msg || '请求失败';
      
      // 401表示token过期或无效
      if (res.code === 401) {
        const config = response.config;
        
        if (refreshing) {
          // 正在刷新token，将当前请求加入队列
          return new Promise((resolve) => {
            requests.push(() => {
              resolve(service(config));
            });
          });
        } else {
          refreshing = true;
          
          // 尝试刷新token
          return service.post('/base/refreshToken').then((refreshRes) => {
            if (refreshRes.data.code === 201) {
              // 更新token会在cookies中处理
              // const newToken = refreshRes.data.data.token;
              
              // 重试所有队列中的请求
              requests.forEach((cb) => cb());
              requests = [];
              
              // 重试当前请求
              return service(config);
            } else {
              // 刷新token失败，清除token并跳转到登录页
              removeToken();
              window.location.href = '/login';
              return Promise.reject(new Error('登录已过期，请重新登录'));
            }
          }).catch(() => {
            // 刷新token失败，清除token并跳转到登录页
            removeToken();
            window.location.href = '/login';
            return Promise.reject(new Error('登录已过期，请重新登录'));
          }).finally(() => {
            refreshing = false;
          });
        }
      }
      
      console.error(msg);
      return Promise.reject(new Error(msg));
    } else {
      return res;
    }
  },
  (error) => {
    console.error('请求错误:', error.message);
    return Promise.reject(error);
  }
);

export default service;