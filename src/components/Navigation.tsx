import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Button, Space, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, logout, role } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
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
        {isAuthenticated ? (
          <>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button icon={<UserOutlined />}>
                {userInfo?.nickname || userInfo?.username || '用户'} ({role})
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button 
            type="primary" 
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            登录
          </Button>
        )}
      </Space>
    </div>
  );
};

export default Navigation;