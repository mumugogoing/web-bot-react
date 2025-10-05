import request from '@/utils/request';
import type {
  Api,
  ApiListParams,
  ApiListResponse,
  ApiTree,
  ApiResponse
} from '@/types/system';

// Get API list
export const getApiList = (params: ApiListParams) =>
  request<ApiResponse<ApiListResponse>>({
    url: '/api/list',
    method: 'get',
    params
  });

// Create API
export const createApi = (data: Partial<Api>) =>
  request<ApiResponse<Api>>({
    url: '/api/create',
    method: 'post',
    data
  });

// Update API
export const updateApi = (id: number, data: Partial<Api>) =>
  request<ApiResponse<Api>>({
    url: `/api/update/${id}`,
    method: 'patch',
    data
  });

// Batch delete APIs
export const batchDeleteApis = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/api/delete/batch',
    method: 'delete',
    params: { ids }
  });

// Get API tree grouped by category for a role
export const getApiTreeByRoleId = (roleId: number) =>
  request<ApiResponse<ApiTree[]>>({
    url: `/api/all/category/${roleId}`,
    method: 'get'
  });

// Update APIs for a role
export const updateApisByRoleId = (roleId: number, data: { apiIds: number[] }) =>
  request<ApiResponse<null>>({
    url: `/api/role/update/${roleId}`,
    method: 'patch',
    data
  });
