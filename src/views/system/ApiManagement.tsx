import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Card, Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getApiList, createApi, updateApi, batchDeleteApis } from '@/api/system/apis';
import type { Api } from '@/types/system';

const ApiManagement: React.FC = () => {
  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingApi, setEditingApi] = useState<Api | null>(null);
  const [searchParams, setSearchParams] = useState({
    method: '',
    path: '',
    category: ''
  });

  const [form] = Form.useForm();

  useEffect(() => {
    fetchApis();
  }, [pageNum, pageSize]);

  const fetchApis = async () => {
    setLoading(true);
    try {
      const response = await getApiList({ 
        ...searchParams,
        pageNum, 
        pageSize 
      });
      if (response.data.code === 201) {
        setApis(response.data.data.list || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      message.error('获取API列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingApi(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Api) => {
    setEditingApi(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await batchDeleteApis(String(id));
      message.success('删除成功');
      fetchApis();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的API');
      return;
    }
    try {
      await batchDeleteApis(selectedRowKeys.join(','));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchApis();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingApi) {
        await updateApi(editingApi.id, values);
        message.success('更新成功');
      } else {
        await createApi(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchApis();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSearch = () => {
    setPageNum(1);
    fetchApis();
  };

  const handleReset = () => {
    setSearchParams({
      method: '',
      path: '',
      category: ''
    });
    setPageNum(1);
  };

  const columns: ColumnsType<Api> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (method: string) => {
        const colorMap: Record<string, string> = {
          'GET': 'blue',
          'POST': 'green',
          'PUT': 'orange',
          'PATCH': 'purple',
          'DELETE': 'red',
        };
        return <Tag color={colorMap[method] || 'default'}>{method}</Tag>;
      },
    },
    {
      title: 'API路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => <Tag color="cyan">{category}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      ellipsis: true,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
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
      fixed: 'right',
      render: (_: unknown, record: Api) => (
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
            <Select
              placeholder="请求方法"
              value={searchParams.method}
              onChange={(value) => setSearchParams({ ...searchParams, method: value })}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
            </Select>
            <Input
              placeholder="API路径"
              value={searchParams.path}
              onChange={(e) => setSearchParams({ ...searchParams, path: e.target.value })}
              style={{ width: 250 }}
            />
            <Input
              placeholder="分类"
              value={searchParams.category}
              onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
              style={{ width: 150 }}
            />
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
              新增API
            </Button>
            <Popconfirm
              title="确定要删除选中的API吗？"
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
              onClick={fetchApis}
            >
              刷新
            </Button>
          </Space>

          {/* Table */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={apis}
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
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingApi ? '编辑API' : '新增API'}
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
            label="请求方法"
            name="method"
            rules={[{ required: true, message: '请选择请求方法' }]}
          >
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="API路径"
            name="path"
            rules={[{ required: true, message: '请输入API路径' }]}
          >
            <Input placeholder="例如: /api/v1/users" />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请输入分类' }]}
          >
            <Input placeholder="例如: 用户管理" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="desc"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiManagement;
