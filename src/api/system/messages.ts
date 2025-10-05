import request from '@/utils/request';
import type {
  MessageListParams,
  MessageListResponse,
  MessagePushRequest,
  ApiResponse
} from '@/types/system';

// Get message list
export const getMessageList = (params: MessageListParams) =>
  request<ApiResponse<MessageListResponse>>({
    url: '/message/list',
    method: 'get',
    params
  });

// Get unread message count
export const getUnreadMessageCount = () =>
  request<ApiResponse<{ count: number }>>({
    url: '/message/unRead/count',
    method: 'get'
  });

// Batch mark messages as read
export const batchMarkMessagesAsRead = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/message/read/batch',
    method: 'patch',
    params: { ids }
  });

// Batch delete messages
export const batchDeleteMessages = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/message/deleted/batch',
    method: 'patch',
    params: { ids }
  });

// Mark all messages as read
export const markAllMessagesAsRead = () =>
  request<ApiResponse<null>>({
    url: '/message/read/all',
    method: 'patch'
  });

// Delete all messages
export const deleteAllMessages = () =>
  request<ApiResponse<null>>({
    url: '/message/deleted/all',
    method: 'patch'
  });

// Push message to users
export const pushMessage = (data: MessagePushRequest) =>
  request<ApiResponse<null>>({
    url: '/message/push',
    method: 'post',
    data
  });
