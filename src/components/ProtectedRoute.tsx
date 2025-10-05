import React from 'react';
import { Result, Button } from 'antd';
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
  const { canAccess, role } = useAuth();

  if (!canAccess(requiredRole)) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Result
          status="403"
          title="访问受限"
          subTitle={`抱歉，您需要 ${requiredRole} 权限才能访问此页面。当前权限: ${role}`}
          extra={
            <Button type="primary" onClick={() => window.location.href = '/'}>
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
