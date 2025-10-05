// 用户角色等级
export const UserRole = {
  ADMIN: 'admin',     // 管理员 - 可访问所有页面
  USER: 'user',       // 普通用户 - 可访问大部分页面
  GUEST: 'guest',     // 访客 - 只能访问公开页面
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  mobile: string;
  email: string;
  avatar: string;
  introduction: string;
  roles: string[];  // 后端返回的角色数组
  roleSort: number; // 角色排序，数字越大权限越高
}

// 登录表单
export interface LoginForm {
  username: string;
  password: string;
  captchaId?: string;
  captchaAnswer?: string;
}

// 验证码信息
export interface CaptchaInfo {
  id: string;
  img: string;
}

