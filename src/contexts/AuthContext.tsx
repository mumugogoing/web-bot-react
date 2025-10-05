import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types/auth';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canAccess: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 从 localStorage 获取保存的角色，默认为访客
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('userRole');
    return (savedRole as UserRole) || UserRole.GUEST;
  });

  // 保存角色到 localStorage
  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  // 检查用户是否有权限访问
  const canAccess = (requiredRole: UserRole): boolean => {
    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.USER]: 2,
      [UserRole.GUEST]: 1,
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider value={{ role, setRole, canAccess }}>
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
