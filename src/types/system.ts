// System-related TypeScript type definitions

// User types
export interface User {
  id: number;
  username: string;
  password?: string;
  nickname: string;
  givenName?: string;
  mail?: string;
  mobile?: string;
  avatar?: string;
  introduction?: string;
  status: number;
  creator: string;
  roleIds?: number[];
  roles?: Role[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListParams {
  username?: string;
  nickname?: string;
  mobile?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface UserListResponse {
  list: User[];
  total: number;
}

// Role types
export interface Role {
  id: number;
  name: string;
  keyword: string;
  desc?: string;
  status: number;
  sort: number;
  creator: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleListParams {
  name?: string;
  keyword?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface RoleListResponse {
  list: Role[];
  total: number;
}

// Menu types
export interface Menu {
  id: number;
  name: string;
  title: string;
  icon?: string;
  path: string;
  redirect?: string;
  component?: string;
  sort: number;
  status: number;
  hidden: number;
  noCache: number;
  alwaysShow: number;
  breadcrumb: number;
  activeMenu?: string;
  parentId: number;
  creator: string;
  children?: Menu[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuTreeParams {
  name?: string;
  title?: string;
  status?: number;
}

export interface MenuListParams extends MenuTreeParams {
  pageNum?: number;
  pageSize?: number;
}

export interface MenuListResponse {
  list: Menu[];
  total: number;
}

// API types
export interface Api {
  id: number;
  method: string;
  path: string;
  category: string;
  desc?: string;
  creator: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiListParams {
  method?: string;
  path?: string;
  category?: string;
  creator?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface ApiListResponse {
  list: Api[];
  total: number;
}

export interface ApiTree {
  category: string;
  children: Api[];
}

// Dictionary types
export interface Dict {
  id: number;
  key: string;
  value: string;
  status: number;
  desc?: string;
  creator: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DictListParams {
  key?: string;
  value?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface DictListResponse {
  list: Dict[];
  total: number;
}

// Operation Log types
export interface OperationLog {
  id: number;
  username: string;
  ip: string;
  path: string;
  method: string;
  status: number;
  latency: number;
  userAgent?: string;
  desc?: string;
  createdAt?: string;
}

export interface OperationLogListParams {
  username?: string;
  ip?: string;
  path?: string;
  method?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface OperationLogListResponse {
  list: OperationLog[];
  total: number;
}

// Message types
export interface Message {
  id: number;
  toUserId: number;
  toUsername: string;
  fromUserId: number;
  fromUsername: string;
  type: number;
  content: string;
  isRead: number;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageListParams {
  type?: number;
  isRead?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface MessageListResponse {
  list: Message[];
  total: number;
}

export interface MessagePushRequest {
  toUserIds: number[];
  type: number;
  content: string;
}

// Upload types
export interface UploadResponse {
  url: string;
  name: string;
  size: number;
}

// FSM (Finite State Machine) types
export interface Leave {
  id: number;
  userId: number;
  username: string;
  status: number;
  desc: string;
  approvalOpinion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveListParams {
  username?: string;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface LeaveListResponse {
  list: Leave[];
  total: number;
}

// Common pagination params
export interface PaginationParams {
  pageNum?: number;
  pageSize?: number;
}

// Common response wrapper
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}
