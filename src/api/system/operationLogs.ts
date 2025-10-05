import request from '@/utils/request';
import type {
  OperationLogListParams,
  OperationLogListResponse,
  ApiResponse
} from '@/types/system';

// Get operation log list
export const getOperationLogList = (params: OperationLogListParams) =>
  request<ApiResponse<OperationLogListResponse>>({
    url: '/operation/log/list',
    method: 'get',
    params
  });

// Batch delete operation logs
export const batchDeleteOperationLogs = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/operation/log/delete/batch',
    method: 'delete',
    params: { ids }
  });
