import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API as string || 'http://localhost:8080', // url = base url + request url
  timeout: 30000 // 请求超时时间: 从10秒改为30秒
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 在请求头中添加认证信息等
    // 这里可以根据需要添加 token 等认证信息
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 处理响应数据
    const res = response.data;
    if (res.code !== 201) {
      // 处理错误状态码
      const msg = res.msg || '请求失败';
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