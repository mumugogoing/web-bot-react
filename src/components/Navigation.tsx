import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Select, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

const { Text } = Typography;

const Navigation: React.FC = () => {
  const location = useLocation();
  const { role, setRole } = useAuth();
  
  const items: MenuProps['items'] = [
    {
      label: <Link to="/">首页</Link>,
      key: '/',
    },
    {
      label: <Link to="/swap">交易</Link>,
      key: '/swap',
    },
    {
      label: <Link to="/monitor">Starknet监控</Link>,
      key: '/monitor',
    },
    {
      label: <Link to="/stacks">Stacks监控</Link>,
      key: '/stacks',
    },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Menu 
        mode="horizontal" 
        selectedKeys={[location.pathname]} 
        items={items}
        style={{ flex: 1, marginBottom: '20px' }}
      />
      <Space style={{ marginRight: '20px', marginBottom: '20px' }}>
        <Text>用户权限:</Text>
        <Select
          value={role}
          onChange={setRole}
          style={{ width: 120 }}
          options={[
            { label: '访客', value: UserRole.GUEST },
            { label: '普通用户', value: UserRole.USER },
            { label: '管理员', value: UserRole.ADMIN },
          ]}
        />
      </Space>
    </div>
  );
};

export default Navigation;