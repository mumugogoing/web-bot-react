import request from '@/utils/request';
import type {
  Role,
  RoleListParams,
  RoleListResponse,
  ApiResponse
} from '@/types/system';

// Get role list
export const getRoleList = (params: RoleListParams) =>
  request<ApiResponse<RoleListResponse>>({
    url: '/role/list',
    method: 'get',
    params
  });

// Get roles by IDs
export const getRolesByIds = (ids: string) =>
  request<ApiResponse<Role[]>>({
    url: `/role/list/${ids}`,
    method: 'get'
  });

// Create role
export const createRole = (data: Partial<Role>) =>
  request<ApiResponse<Role>>({
    url: '/role/create',
    method: 'post',
    data
  });

// Update role
export const updateRole = (id: number, data: Partial<Role>) =>
  request<ApiResponse<Role>>({
    url: `/role/update/${id}`,
    method: 'patch',
    data
  });

// Batch delete roles
export const batchDeleteRoles = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/role/delete/batch',
    method: 'delete',
    params: { ids }
  });
