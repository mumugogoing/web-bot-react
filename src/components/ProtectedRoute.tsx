import React from 'react';
import { Result, Button, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = UserRole.GUEST 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { canAccess, isAuthenticated, isLoading, role } = useAuth();

  // 等待认证状态加载
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 检查权限
  if (!canAccess(requiredRole)) {
    // 如果未登录且需要权限，跳转到登录页
    if (!isAuthenticated && requiredRole !== UserRole.GUEST) {
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <Result
            status="403"
            title="需要登录"
            subTitle="请先登录后再访问此页面"
            extra={
              <Button 
                type="primary" 
                onClick={() => navigate('/login', { state: { from: location } })}
              >
                前往登录
              </Button>
            }
          />
        </div>
      );
    }

    // 已登录但权限不足
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Result
          status="403"
          title="访问受限"
          subTitle={`抱歉，您需要 ${requiredRole} 权限才能访问此页面。当前权限: ${role}`}
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

