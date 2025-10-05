import React from 'react';
import { Card, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>欢迎使用 STX 交易系统</Title>
        <Paragraph>
          这是一个基于 React 和 Ant Design 构建的前端应用，用于与 STX 区块链进行交互。
        </Paragraph>
        <Paragraph>
          您可以在这里查看资产余额、执行交易操作、管理您的投资组合等。
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          onClick={() => navigate('/swap')}
          style={{ marginRight: '10px' }}
        >
          开始交易
        </Button>
        <Button 
          type="default" 
          size="large" 
          onClick={() => navigate('/monitor')}
        >
          Starknet 监控
        </Button>
      </Card>
    </div>
  );
};

export default Home;