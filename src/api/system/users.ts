import request from '@/utils/request';
import type {
  User,
  UserListParams,
  UserListResponse,
  ApiResponse
} from '@/types/system';

// Get user list
export const getUserList = (params: UserListParams) =>
  request<ApiResponse<UserListResponse>>({
    url: '/user/list',
    method: 'get',
    params
  });

// Get users by IDs
export const getUsersByIds = (ids: string) =>
  request<ApiResponse<User[]>>({
    url: `/user/list/${ids}`,
    method: 'get'
  });

// Create user
export const createUser = (data: Partial<User>) =>
  request<ApiResponse<User>>({
    url: '/user/create',
    method: 'post',
    data
  });

// Update user
export const updateUser = (id: number, data: Partial<User>) =>
  request<ApiResponse<User>>({
    url: `/user/update/${id}`,
    method: 'patch',
    data
  });

// Change password
export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
  request<ApiResponse<null>>({
    url: '/user/changePwd',
    method: 'put',
    data
  });

// Batch delete users
export const batchDeleteUsers = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/user/delete/batch',
    method: 'delete',
    params: { ids }
  });
