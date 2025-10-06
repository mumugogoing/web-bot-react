import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const { Content, Footer } = AntLayout;

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header collapsed={collapsed} onToggle={toggleCollapsed} />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: '4px',
          }}
        >
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center', padding: '16px 50px', background: '#fff' }}>
          Web Bot React ©{new Date().getFullYear()} Created by mumugogoing
        </Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
