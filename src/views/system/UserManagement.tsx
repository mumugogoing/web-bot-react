import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Tag, Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUserList, createUser, updateUser, batchDeleteUsers } from '@/api/system/users';
import { getRoleList } from '@/api/system/roles';
import type { User, Role } from '@/types/system';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useState({
    username: '',
    nickname: '',
    mobile: '',
    status: undefined as number | undefined
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [pageNum, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUserList({ 
        ...searchParams,
        pageNum, 
        pageSize 
      });
      console.log('UserManagement response:', response);
      if (response.data.code === 201) {
        setUsers(response.data.data.list || []);
        setTotal(response.data.data.total || 0);
      } else {
        message.error(`获取用户列表失败: ${response.data.msg || '未知错误'}`);
      }
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      message.error(`获取用户列表失败: ${error.message || '网络错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoleList({ pageNum: 1, pageSize: 100 });
      if (response.data.code === 201) {
        setRoles(response.data.data.list || []);
      }
    } catch (error) {
      console.error('获取角色列表失败', error);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      roleIds: record.roles?.map(r => r.id) || []
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await batchDeleteUsers(String(id));
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的用户');
      return;
    }
    try {
      await batchDeleteUsers(selectedRowKeys.join(','));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchUsers();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('更新成功');
      } else {
        await createUser(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      console.error('操作失败:', error);
      message.error(`操作失败: ${error.message || '未知错误'}`);
    }
  };

  const handleSearch = () => {
    setPageNum(1);
    fetchUsers();
  };

  const handleReset = () => {
    setSearchParams({
      username: '',
      nickname: '',
      mobile: '',
      status: undefined
    });
    setPageNum(1);
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'mail',
      key: 'mail',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: Role[]) => (
        <>
          {roles?.map(role => (
            <Tag color="blue" key={role.id}>{role.name}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Search Form */}
          <Space wrap>
            <Input
              placeholder="用户名"
              value={searchParams.username}
              onChange={(e) => setSearchParams({ ...searchParams, username: e.target.value })}
              style={{ width: 200 }}
            />
            <Input
              placeholder="昵称"
              value={searchParams.nickname}
              onChange={(e) => setSearchParams({ ...searchParams, nickname: e.target.value })}
              style={{ width: 200 }}
            />
            <Input
              placeholder="手机号"
              value={searchParams.mobile}
              onChange={(e) => setSearchParams({ ...searchParams, mobile: e.target.value })}
              style={{ width: 200 }}
            />
            <Select
              placeholder="状态"
              value={searchParams.status}
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={2}>禁用</Select.Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>

          {/* Action Buttons */}
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增用户
            </Button>
            <Popconfirm
              title="确定要删除选中的用户吗？"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
              >
                批量删除
              </Button>
            </Popconfirm>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
            >
              刷新
            </Button>
          </Space>

          {/* Table */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, size) => {
                setPageNum(page);
                setPageSize(size);
              },
            }}
          />
        </Space>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            label="邮箱"
            name="mail"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="mobile"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="角色"
            name="roleIds"
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
            >
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            initialValue={1}
          >
            <Select>
              <Select.Option value={1}>正常</Select.Option>
              <Select.Option value={2}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="简介"
            name="introduction"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
