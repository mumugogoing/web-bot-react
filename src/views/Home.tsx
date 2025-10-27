import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>欢迎使用 STX 交易系统</Title>
      </Card>
    </div>
  );
};

export default Home;