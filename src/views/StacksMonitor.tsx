import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Switch,
  Typography,
  Statistic,
  Row,
  Col,
  message,
  Input,
} from 'antd';
import {
  ReloadOutlined,
  LinkOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getStacksTransactions,
  parseStacksTransactionType,
  parseStacksTransactionStatus,
  formatStacksAddress,
  formatStacksTimestamp,
  parseContractPlatform,
  formatSTXAmount,
  type StacksTransaction,
} from '@/api/stacks';

const { Title, Text, Paragraph } = Typography;

const StacksMonitor: React.FC = () => {
  const [transactions, setTransactions] = useState<StacksTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchHash, setSearchHash] = useState('');

  // 获取交易数据
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const result = await getStacksTransactions(pageSize, offset);
      setTransactions(result.results);
      setTotal(result.total);
      setLastUpdateTime(new Date().toLocaleTimeString('zh-CN'));
      message.success('交易数据已更新');
    } catch (error) {
      message.error('获取交易数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // 首次加载
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // 自动刷新
  useEffect(() => {
    let interval: number | undefined;
    if (autoRefresh) {
      interval = window.setInterval(() => {
        fetchTransactions();
      }, 30000); // 每30秒刷新一次
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchTransactions]);

  // 表格列定义
  const columns: ColumnsType<StacksTransaction> = [
    {
      title: '交易哈希',
      dataIndex: 'tx_id',
      key: 'tx_id',
      width: 150,
      render: (txId: string) => (
        <Tooltip title={txId}>
          <Space>
            <Text copyable={{ text: txId }}>{formatStacksAddress(txId)}</Text>
            <a
              href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkOutlined />
            </a>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'tx_type',
      key: 'tx_type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">{parseStacksTransactionType(type)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'tx_status',
      key: 'tx_status',
      width: 100,
      render: (status: string) => {
        const color = status === 'success' ? 'green' : 'orange';
        return <Tag color={color}>{parseStacksTransactionStatus(status)}</Tag>;
      },
    },
    {
      title: '平台/合约',
      key: 'platform',
      width: 120,
      render: (record: StacksTransaction) => {
        if (record.contract_call) {
          const platform = parseContractPlatform(record.contract_call.contract_id);
          return <Tag color="purple">{platform}</Tag>;
        }
        return <Tag color="default">-</Tag>;
      },
    },
    {
      title: '交易详情',
      key: 'details',
      width: 200,
      render: (record: StacksTransaction) => {
        if (record.token_transfer) {
          return (
            <Space direction="vertical" size="small">
              <Text>
                <Tag color="gold">STX</Tag> 转账
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                数量: {formatSTXAmount(record.token_transfer.amount)} STX
              </Text>
            </Space>
          );
        } else if (record.contract_call) {
          return (
            <Space direction="vertical" size="small">
              <Text>
                <Tag color="cyan">{record.contract_call.function_name}</Tag>
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                合约调用
              </Text>
            </Space>
          );
        }
        return <Text type="secondary">其他交易</Text>;
      },
    },
    {
      title: '发送地址',
      dataIndex: 'sender_address',
      key: 'sender_address',
      width: 150,
      render: (address: string) =>
        address ? (
          <Tooltip title={address}>
            <Text copyable={{ text: address }}>{formatStacksAddress(address)}</Text>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '接收地址',
      key: 'recipient_address',
      width: 150,
      render: (record: StacksTransaction) => {
        const address = record.token_transfer?.recipient_address || 
                       record.contract_call?.contract_id || '-';
        if (address === '-') return <Text>-</Text>;
        return (
          <Tooltip title={address}>
            <Text copyable={{ text: address }}>{formatStacksAddress(address)}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: '区块高度',
      dataIndex: 'block_height',
      key: 'block_height',
      width: 100,
      render: (height: number) => height?.toLocaleString() || '-',
    },
    {
      title: '手续费 (STX)',
      dataIndex: 'fee_rate',
      key: 'fee_rate',
      width: 120,
      render: (fee: string) => (
        <Text>{formatSTXAmount(fee)}</Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'burn_block_time',
      key: 'burn_block_time',
      width: 180,
      render: (timestamp: number) => (
        <Tooltip title={formatStacksTimestamp(timestamp)}>
          <Space>
            <ClockCircleOutlined />
            <Text>{formatStacksTimestamp(timestamp)}</Text>
          </Space>
        </Tooltip>
      ),
    },
  ];

  // 过滤交易
  const filteredTransactions = transactions.filter(
    (tx) =>
      !searchHash || tx.tx_id.toLowerCase().includes(searchHash.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题和说明 */}
      <Card style={{ marginBottom: '20px' }}>
        <Title level={2}>Stacks 区块链交易监控</Title>
        <Paragraph>
          实时监控 Stacks 区块链网络上的所有交易，包括 STX 转账、DeFi 合约调用等。
          本页面使用免费的 Hiro API，无需登录即可查看。
        </Paragraph>
        <Paragraph type="secondary">
          <Text strong>数据来源：</Text>Hiro API (Stacks 区块链公共 API - 完全免费)
        </Paragraph>
        <Paragraph type="secondary">
          <Text strong>主要 DeFi 平台：</Text>ALEX、Arkadiko、Stackswap 等
        </Paragraph>
      </Card>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前页交易数"
              value={filteredTransactions.length}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总交易数"
              value={total}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最后更新"
              value={lastUpdateTime || '未更新'}
              valueStyle={{ fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>自动刷新 (30秒)</Text>
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card style={{ marginBottom: '20px' }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchTransactions}
            loading={loading}
          >
            刷新数据
          </Button>
          <Input
            placeholder="输入交易哈希搜索"
            prefix={<SearchOutlined />}
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            onClick={() => {
              setSearchHash('');
            }}
          >
            清除筛选
          </Button>
        </Space>
      </Card>

      {/* 交易列表表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="tx_id"
          loading={loading}
          rowClassName={(_, index) => {
            // 最新一条交易（第一条）使用不同背景色
            return index === 0 ? 'latest-transaction-row' : '';
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, newPageSize) => {
              setCurrentPage(page);
              if (newPageSize) setPageSize(newPageSize);
            },
            pageSizeOptions: ['3', '5', '8', '20', '50'],
          }}
          scroll={{ x: 1500 }}
          size="small"
        />
      </Card>

      {/* 页面说明 */}
      <Card style={{ marginTop: '20px' }}>
        <Title level={4}>使用说明</Title>
        <Paragraph>
          <ul>
            <li>
              <Text strong>交易哈希：</Text>点击复制图标可复制完整地址，点击链接图标可在 Hiro 浏览器中查看详情
            </li>
            <li>
              <Text strong>类型：</Text>显示交易类型（代币转账、合约调用等）
            </li>
            <li>
              <Text strong>状态：</Text>显示交易确认状态（成功、待处理等）
            </li>
            <li>
              <Text strong>平台：</Text>显示执行交易的 DeFi 平台或合约名称
            </li>
            <li>
              <Text strong>交易详情：</Text>显示交易涉及的代币和数量或合约函数
            </li>
            <li>
              <Text strong>地址：</Text>显示发送地址和接收地址，可点击复制
            </li>
            <li>
              <Text strong>最新交易：</Text>列表中第一条交易会高亮显示（黄色背景）
            </li>
            <li>
              <Text strong>自动刷新：</Text>开启后每30秒自动更新交易数据
            </li>
          </ul>
        </Paragraph>
      </Card>

      {/* 添加 CSS 样式 */}
      <style>
        {`
          .latest-transaction-row {
            background-color: #fffbe6 !important;
          }
          .latest-transaction-row:hover {
            background-color: #fff7cc !important;
          }
        `}
      </style>
    </div>
  );
};

export default StacksMonitor;
