import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Avatar, Descriptions, Tag } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/api/system/users';

const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const { userInfo } = useAuth();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (values: { oldPassword: string; newPassword: string }) => {
    setLoading(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('密码修改成功，请重新登录');
      passwordForm.resetFields();
      // Optionally logout user after password change
      // logout();
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="个人信息" key="1">
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
              {/* Avatar Section */}
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />} 
                  src={userInfo?.avatar}
                  style={{ marginBottom: '20px' }}
                />
                <div>
                  <h3>{userInfo?.nickname || userInfo?.username}</h3>
                  <p style={{ color: '#999' }}>{userInfo?.introduction || '暂无简介'}</p>
                </div>
              </div>

              {/* User Info Section */}
              <div style={{ flex: 1 }}>
                <Descriptions title="基本信息" column={2} bordered>
                  <Descriptions.Item label="用户名">
                    {userInfo?.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="昵称">
                    {userInfo?.nickname}
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱">
                    {userInfo?.email || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="手机号">
                    {userInfo?.mobile || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="角色" span={2}>
                    {userInfo?.roles?.map(role => (
                      <Tag color="blue" key={role}>{role}</Tag>
                    ))}
                  </Descriptions.Item>
                  <Descriptions.Item label="简介" span={2}>
                    {userInfo?.introduction || '-'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </TabPane>

          <TabPane tab="修改密码" key="2">
            <Card style={{ maxWidth: '600px' }}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  label="旧密码"
                  name="oldPassword"
                  rules={[
                    { required: true, message: '请输入旧密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="请输入旧密码"
                  />
                </Form.Item>

                <Form.Item
                  label="新密码"
                  name="newPassword"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="请输入新密码"
                  />
                </Form.Item>

                <Form.Item
                  label="确认新密码"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />}
                    placeholder="请再次输入新密码"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    修改密码
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;
