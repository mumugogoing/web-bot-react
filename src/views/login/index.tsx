import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Image } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStatus, getCaptcha } from '@/api/auth';
import type { CaptchaInfo } from '@/types/auth';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [captchaInfo, setCaptchaInfo] = useState<CaptchaInfo | null>(null);
  const [oldUsername, setOldUsername] = useState('');

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 检查用户状态（是否需要验证码）
  const checkUserStatus = async (username: string) => {
    if (!username || username === oldUsername) {
      return;
    }
    
    try {
      const response = await getUserStatus({ username });
      if (response.data && response.data.captcha) {
        setCaptchaInfo({
          id: response.data.captcha.id,
          img: response.data.captcha.img
        });
      } else {
        setCaptchaInfo(null);
      }
    } catch (error) {
      console.error('Failed to check user status:', error);
    }
  };

  // 刷新验证码
  const refreshCaptcha = async () => {
    try {
      const response = await getCaptcha();
      if (response.data) {
        setCaptchaInfo({
          id: response.data.id,
          img: response.data.img
        });
      }
    } catch (error) {
      console.error('Failed to refresh captcha:', error);
    }
  };

  // 处理登录
  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      await login(
        values.username,
        values.password,
        captchaInfo?.id,
        values.captchaAnswer
      );
      
      // 添加一个小延迟确保状态更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      // 如果验证码错误，刷新验证码
      if (error.message && error.message.includes('验证码')) {
        await checkUserStatus(values.username);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>
          STX 交易系统登录
        </Title>
        
        <Form
          form={form}
          name="login"
          initialValues={{ 
            username: 'super',
            password: '123456' 
          }}
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              onFocus={() => setOldUsername(form.getFieldValue('username'))}
              onBlur={() => checkUserStatus(form.getFieldValue('username'))}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          {captchaInfo && (
            <Form.Item
              name="captchaAnswer"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Row gutter={8}>
                <Col span={16}>
                  <Input
                    placeholder="验证码"
                    size="large"
                  />
                </Col>
                <Col span={8}>
                  <Image
                    src={captchaInfo.img}
                    alt="验证码"
                    preview={false}
                    style={{ cursor: 'pointer', height: 40 }}
                    onClick={refreshCaptcha}
                  />
                </Col>
              </Row>
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 20 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            测试账号：
          </Text>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
            <div>超级管理员: super / 123456</div>
            <div>访客用户: guest / 123456</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
