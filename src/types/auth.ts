// 用户角色等级
export const UserRole = {
  ADMIN: 'admin',     // 管理员 - 可访问所有页面
  USER: 'user',       // 普通用户 - 可访问大部分页面
  GUEST: 'guest',     // 访客 - 只能访问公开页面
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

