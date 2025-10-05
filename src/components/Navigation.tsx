import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';

const Navigation: React.FC = () => {
  const location = useLocation();
  
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
  ];

  return (
    <Menu 
      mode="horizontal" 
      selectedKeys={[location.pathname]} 
      items={items}
      style={{ marginBottom: '20px' }}
    />
  );
};

export default Navigation;