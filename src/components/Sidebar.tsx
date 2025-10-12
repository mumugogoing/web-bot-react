import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { 
  HomeOutlined,
  SwapOutlined,
  MonitorOutlined,
  CloudOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  ApiOutlined,
  FileTextOutlined,
  SettingOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/swap',
      icon: <SwapOutlined />,
      label: '交易',
      onClick: () => navigate('/swap'),
    },
    {
      key: '/makergun/sbtc',
      icon: <RobotOutlined />,
      label: 'SBTC MakerGun',
      onClick: () => navigate('/makergun/sbtc'),
    },
    {
      key: '/monitor',
      icon: <MonitorOutlined />,
      label: 'Starknet监控',
      onClick: () => navigate('/monitor'),
    },
    {
      key: '/stacks',
      icon: <CloudOutlined />,
      label: 'Stacks监控',
      onClick: () => navigate('/stacks'),
    },
    // System Management - Only visible to admins
    ...(role === UserRole.ADMIN ? [{
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/users',
          icon: <UserOutlined />,
          label: '用户管理',
          onClick: () => navigate('/system/users'),
        },
        {
          key: '/system/roles',
          icon: <TeamOutlined />,
          label: '角色管理',
          onClick: () => navigate('/system/roles'),
        },
        {
          key: '/system/menus',
          icon: <MenuOutlined />,
          label: '菜单管理',
          onClick: () => navigate('/system/menus'),
        },
        {
          key: '/system/apis',
          icon: <ApiOutlined />,
          label: '接口管理',
          onClick: () => navigate('/system/apis'),
        },
        {
          key: '/system/logs',
          icon: <FileTextOutlined />,
          label: '操作日志',
          onClick: () => navigate('/system/logs'),
        },
      ],
    }] : []),
  ];

  // Get current selected keys and open keys
  const getSelectedKeys = () => {
    return [location.pathname];
  };

  const getOpenKeys = () => {
    if (location.pathname.startsWith('/system/')) {
      return ['system'];
    }
    return [];
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      trigger={null}
      width={200}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div 
        style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.2)',
          margin: '16px',
          borderRadius: '4px'
        }}
      >
        {!collapsed && (
          <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
            Web Bot
          </span>
        )}
        {collapsed && (
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
            WB
          </span>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
