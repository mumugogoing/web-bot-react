import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Dropdown, Avatar, Space, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  BellOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { userInfo, logout, role } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'messages',
      icon: <BellOutlined />,
      label: '消息中心',
      onClick: () => navigate('/system/messages'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader 
      style={{ 
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        zIndex: 9
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          style: { fontSize: '18px', cursor: 'pointer' },
          onClick: onToggle,
        })}
        <span style={{ marginLeft: '16px', fontSize: '18px', fontWeight: 500 }}>
          Web Bot React 管理系统
        </span>
      </div>
      
      <Space size="large">
        <Badge count={0} showZero={false}>
          <BellOutlined 
            style={{ fontSize: '18px', cursor: 'pointer' }} 
            onClick={() => navigate('/system/messages')}
          />
        </Badge>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{userInfo?.nickname || userInfo?.username || '用户'}</span>
            <span style={{ color: '#999' }}>({role})</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
