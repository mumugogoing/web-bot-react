import request from '@/utils/request';

// 获取验证码
export const getCaptcha = () =>
  request({
    url: '/base/captcha',
    method: 'get'
  });

// 检查用户状态（用于判断是否需要验证码）
export const getUserStatus = (params: { username: string }) =>
  request({
    url: '/base/user/status',
    method: 'get',
    params
  });

// 登录
export const login = (data: {
  username: string;
  password: string;
  captchaId?: string;
  captchaAnswer?: string;
}) =>
  request({
    url: '/base/login',
    method: 'post',
    data
  });

// 登出
export const logout = () =>
  request({
    url: '/base/logout',
    method: 'post'
  });

// 刷新token
export const refreshToken = () =>
  request({
    url: '/base/refreshToken',
    method: 'post'
  });

// 获取用户信息
export const getUserInfo = () =>
  request({
    url: '/user/info',
    method: 'post',
    data: {}
  });

// 获取幂等性token
export const getIdempotenceToken = () =>
  request({
    url: '/base/idempotenceToken',
    method: 'get'
  });
