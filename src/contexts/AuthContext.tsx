import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, type UserInfo } from '@/types/auth';
import { getToken, setToken as saveToken, removeToken } from '@/utils/cookies';
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/auth';
import { message } from 'antd';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  role: UserRole;
  login: (username: string, password: string, captchaId?: string, captchaAnswer?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  setRole: (role: UserRole) => void;
  canAccess: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [role, setRoleState] = useState<UserRole>(UserRole.GUEST);

  // 从后端角色映射到前端角色
  const mapBackendRoleToFrontend = (backendRoles: string[]): UserRole => {
    // 后端可能返回多个角色，我们取权限最高的
    // super > admin > user > guest
    if (backendRoles.includes('super')) {
      return UserRole.ADMIN; // super映射到ADMIN
    }
    if (backendRoles.includes('admin')) {
      return UserRole.ADMIN;
    }
    if (backendRoles.includes('user')) {
      return UserRole.USER;
    }
    return UserRole.GUEST;
  };

  // 初始化时检查token
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          await fetchUserInfo();
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          removeToken();
          setIsAuthenticated(false);
          setUserInfo(null);
          setRoleState(UserRole.GUEST);
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // 登录
  const login = async (username: string, password: string, captchaId?: string, captchaAnswer?: string) => {
    try {
      const response = await loginApi({
        username,
        password,
        captchaId,
        captchaAnswer
      });
      
      if (response.data && response.data.token) {
        saveToken(response.data.token);
        setIsAuthenticated(true);
        
        // 登录成功后获取用户信息
        await fetchUserInfo();
        message.success('登录成功');
      }
    } catch (error: any) {
      message.error(error.message || '登录失败');
      throw error;
    }
  };

  // 登出
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setIsAuthenticated(false);
      setUserInfo(null);
      setRoleState(UserRole.GUEST);
      message.success('已退出登录');
    }
  };

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const response = await getUserInfoApi();
      if (response.data) {
        const userData: UserInfo = response.data;
        setUserInfo(userData);
        setIsAuthenticated(true);
        
        // 从后端角色映射到前端角色
        const frontendRole = mapBackendRoleToFrontend(userData.roles);
        setRoleState(frontendRole);
      }
    } catch (error) {
      throw error;
    }
  };

  // 手动设置角色（仅用于开发/测试，生产环境应该从后端获取）
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  // 检查用户是否有权限访问
  const canAccess = (requiredRole: UserRole): boolean => {
    // 如果没有登录，只能访问guest权限的页面
    if (!isAuthenticated && requiredRole !== UserRole.GUEST) {
      return false;
    }

    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.USER]: 2,
      [UserRole.GUEST]: 1,
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated,
      isLoading,
      userInfo,
      role, 
      login,
      logout,
      fetchUserInfo,
      setRole, 
      canAccess 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

