import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadMessageCount } from '@/api/system/messages';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, role } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadMessages();
  }, []);

  const fetchUnreadMessages = async () => {
    try {
      const response = await getUnreadMessageCount();
      if (response.data.code === 201) {
        setUnreadCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread messages', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Welcome Section */}
      <Card style={{ marginBottom: '20px' }}>
        <Title level={2}>欢迎回来，{userInfo?.nickname || userInfo?.username}！</Title>
        <Paragraph>
          这是一个基于 gin-web 后端的 React 管理系统，您当前的角色是：<strong>{role}</strong>
        </Paragraph>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="未读消息"
              value={unreadCount}
              prefix={<BellOutlined />}
              valueStyle={{ color: unreadCount > 0 ? '#cf1322' : '#3f8600' }}
              suffix={
                unreadCount > 0 ? (
                  <ArrowUpOutlined style={{ fontSize: '14px' }} />
                ) : (
                  <ArrowDownOutlined style={{ fontSize: '14px' }} />
                )
              }
            />
            <Button 
              type="link" 
              onClick={() => navigate('/system/messages')}
              style={{ marginTop: '10px' }}
            >
              查看消息
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="系统用户"
              value={'-'}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            {role === 'admin' && (
              <Button 
                type="link" 
                onClick={() => navigate('/system/users')}
                style={{ marginTop: '10px' }}
              >
                管理用户
              </Button>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="角色管理"
              value={'-'}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            {role === 'admin' && (
              <Button 
                type="link" 
                onClick={() => navigate('/system/roles')}
                style={{ marginTop: '10px' }}
              >
                管理角色
              </Button>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="操作日志"
              value={'-'}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            {role === 'admin' && (
              <Button 
                type="link" 
                onClick={() => navigate('/system/logs')}
                style={{ marginTop: '10px' }}
              >
                查看日志
              </Button>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Access */}
      <Card title="快速访问">
        <Space wrap size="large">
          <Button 
            type="primary" 
            size="large" 
            onClick={() => navigate('/swap')}
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
          <Button 
            type="default" 
            size="large" 
            onClick={() => navigate('/stacks')}
          >
            Stacks 监控
          </Button>
          <Button 
            type="default" 
            size="large" 
            onClick={() => navigate('/profile')}
          >
            个人中心
          </Button>
        </Space>
      </Card>

      {/* Features Overview */}
      <Card title="功能说明" style={{ marginTop: '20px' }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Title level={4}>交易功能</Title>
            <Paragraph>
              <ul>
                <li>支持 XYK 交易</li>
                <li>实时查看资产余额</li>
                <li>查询交易状态</li>
                <li>CEX 订单创建</li>
              </ul>
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>监控功能</Title>
            <Paragraph>
              <ul>
                <li>Starknet 交易实时监控</li>
                <li>Stacks 区块链监控</li>
                <li>交易历史记录</li>
                <li>数据可视化展示</li>
              </ul>
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>系统管理</Title>
            <Paragraph>
              <ul>
                <li>用户管理（增删改查）</li>
                <li>角色管理（权限分配）</li>
                <li>菜单管理（动态菜单）</li>
                <li>API 接口管理</li>
                <li>操作日志记录</li>
              </ul>
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>个人中心</Title>
            <Paragraph>
              <ul>
                <li>个人信息管理</li>
                <li>密码修改</li>
                <li>消息中心</li>
                <li>系统通知</li>
              </ul>
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
