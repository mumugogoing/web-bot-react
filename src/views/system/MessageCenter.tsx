import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, message, Popconfirm, Tag, Card, Select, Badge
} from 'antd';
import { DeleteOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  getMessageList, 
  batchMarkMessagesAsRead, 
  batchDeleteMessages,
  markAllMessagesAsRead,
  deleteAllMessages
} from '@/api/system/messages';
import type { Message } from '@/types/system';

const MessageCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isReadFilter, setIsReadFilter] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchMessages();
  }, [pageNum, pageSize, isReadFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await getMessageList({ 
        isRead: isReadFilter,
        pageNum, 
        pageSize 
      });
      if (response.data.code === 201) {
        setMessages(response.data.data.list || []);
        setTotal(response.data.data.total || 0);
      }
    } catch (error) {
      message.error('获取消息列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (ids: string) => {
    try {
      await batchMarkMessagesAsRead(ids);
      message.success('标记已读成功');
      fetchMessages();
    } catch (error) {
      message.error('标记已读失败');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllMessagesAsRead();
      message.success('全部标记已读成功');
      fetchMessages();
    } catch (error) {
      message.error('标记已读失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await batchDeleteMessages(String(id));
      message.success('删除成功');
      fetchMessages();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的消息');
      return;
    }
    try {
      await batchDeleteMessages(selectedRowKeys.join(','));
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchMessages();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllMessages();
      message.success('清空消息成功');
      fetchMessages();
    } catch (error) {
      message.error('清空消息失败');
    }
  };

  const columns: ColumnsType<Message> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '发送人',
      dataIndex: 'fromUsername',
      key: 'fromUsername',
      width: 120,
    },
    {
      title: '接收人',
      dataIndex: 'toUsername',
      key: 'toUsername',
      width: 120,
    },
    {
      title: '消息类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: number) => {
        const typeMap: Record<number, { text: string; color: string }> = {
          1: { text: '系统消息', color: 'blue' },
          2: { text: '通知消息', color: 'green' },
          3: { text: '告警消息', color: 'red' },
        };
        return (
          <Tag color={typeMap[type]?.color || 'default'}>
            {typeMap[type]?.text || '未知'}
          </Tag>
        );
      },
    },
    {
      title: '消息内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 100,
      render: (isRead: number) => (
        isRead === 1 ? (
          <Tag color="green">已读</Tag>
        ) : (
          <Badge status="processing" text="未读" />
        )
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
      fixed: 'right',
      render: (_: unknown, record: Message) => (
        <Space size="middle">
          {record.isRead === 0 && (
            <Button 
              type="link" 
              icon={<CheckOutlined />}
              onClick={() => handleMarkAsRead(String(record.id))}
            >
              标记已读
            </Button>
          )}
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
          {/* Filter */}
          <Space wrap>
            <Select
              placeholder="消息状态"
              value={isReadFilter}
              onChange={(value) => {
                setIsReadFilter(value);
                setPageNum(1);
              }}
              style={{ width: 150 }}
              allowClear
            >
              <Select.Option value={0}>未读</Select.Option>
              <Select.Option value={1}>已读</Select.Option>
            </Select>
            <Button type="primary" onClick={() => fetchMessages()}>
              搜索
            </Button>
          </Space>

          {/* Action Buttons */}
          <Space>
            <Button 
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              全部标记已读
            </Button>
            <Popconfirm
              title="确定要删除选中的消息吗？"
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
            <Popconfirm
              title="确定要清空所有消息吗？"
              onConfirm={handleDeleteAll}
              okText="确定"
              cancelText="取消"
            >
              <Button danger>
                清空消息
              </Button>
            </Popconfirm>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchMessages}
            >
              刷新
            </Button>
          </Space>

          {/* Table */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={messages}
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
    </div>
  );
};

export default MessageCenter;
