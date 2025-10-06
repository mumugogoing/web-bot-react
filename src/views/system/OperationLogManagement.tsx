import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, message, Popconfirm, Tag, Card, Input, Select
} from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getOperationLogList, batchDeleteOperationLogs } from '@/api/system/operationLogs';
import type { OperationLog } from '@/types/system';

const OperationLogManagement: React.FC = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchParams, setSearchParams] = useState({
    username: '',
    ip: '',
    path: '',
    method: '',
    status: undefined as number | undefined
  });

  useEffect(() => {
    fetchLogs();
  }, [pageNum, pageSize]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await getOperationLogList({ 
        ...searchParams,
        pageNum, 
        pageSize 
      });
      console.log('OperationLogManagement response:', response);
      if (response.data.code === 201) {
        setLogs(response.data.data.list || []);
        setTotal(response.data.data.total || 0);
      } else {
        message.error(`获取操作日志失败: ${response.data.msg || '未知错误'}`);
      }
    } catch (error: any) {
      console.error('获取操作日志失败:', error);
      message.error(`获取操作日志失败: ${error.message || '网络错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await batchDeleteOperationLogs(String(id));
      message.success('删除成功');
      fetchLogs();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的日志');
      return;
    }
    try {
      await batchDeleteOperationLogs(selectedRowKeys.join(','));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchLogs();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleSearch = () => {
    setPageNum(1);
    fetchLogs();
  };

  const handleReset = () => {
    setSearchParams({
      username: '',
      ip: '',
      path: '',
      method: '',
      status: undefined
    });
    setPageNum(1);
  };

  const columns: ColumnsType<OperationLog> = [
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
      width: 120,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 150,
    },
    {
      title: '请求路径',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
    },
    {
      title: '请求方法',
      dataIndex: 'method',
      key: 'method',
      width: 100,
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
      title: '状态码',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={status < 400 ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '耗时(ms)',
      dataIndex: 'latency',
      key: 'latency',
      width: 120,
      render: (latency: number) => {
        const color = latency > 1000 ? 'red' : latency > 500 ? 'orange' : 'green';
        return <Tag color={color}>{latency}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      ellipsis: true,
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
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: OperationLog) => (
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
              style={{ width: 150 }}
            />
            <Input
              placeholder="IP地址"
              value={searchParams.ip}
              onChange={(e) => setSearchParams({ ...searchParams, ip: e.target.value })}
              style={{ width: 150 }}
            />
            <Input
              placeholder="请求路径"
              value={searchParams.path}
              onChange={(e) => setSearchParams({ ...searchParams, path: e.target.value })}
              style={{ width: 200 }}
            />
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
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>

          {/* Action Buttons */}
          <Space>
            <Popconfirm
              title="确定要删除选中的日志吗？"
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
              onClick={fetchLogs}
            >
              刷新
            </Button>
          </Space>

          {/* Table */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={logs}
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
            scroll={{ x: 1400 }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default OperationLogManagement;
