import request from '@/utils/request';
import type {
  Menu,
  MenuTreeParams,
  MenuListParams,
  MenuListResponse,
  ApiResponse
} from '@/types/system';

// Get menu tree
export const getMenuTree = (params: MenuTreeParams) =>
  request<ApiResponse<Menu[]>>({
    url: '/menu/tree',
    method: 'get',
    params
  });

// Get menu list
export const getMenuList = (params: MenuListParams) =>
  request<ApiResponse<MenuListResponse>>({
    url: '/menu/list',
    method: 'get',
    params
  });

// Create menu
export const createMenu = (data: Partial<Menu>) =>
  request<ApiResponse<Menu>>({
    url: '/menu/create',
    method: 'post',
    data
  });

// Update menu
export const updateMenu = (id: number, data: Partial<Menu>) =>
  request<ApiResponse<Menu>>({
    url: `/menu/update/${id}`,
    method: 'patch',
    data
  });

// Batch delete menus
export const batchDeleteMenus = (ids: string) =>
  request<ApiResponse<null>>({
    url: '/menu/delete/batch',
    method: 'delete',
    params: { ids }
  });

// Get menus by role ID
export const getMenusByRoleId = (roleId: number) =>
  request<ApiResponse<Menu[]>>({
    url: `/menu/all/${roleId}`,
    method: 'get'
  });

// Update menus for a role
export const updateMenusByRoleId = (roleId: number, data: { menuIds: number[] }) =>
  request<ApiResponse<null>>({
    url: `/menu/role/update/${roleId}`,
    method: 'patch',
    data
  });
