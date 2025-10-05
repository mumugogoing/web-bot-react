import React, { useState, useEffect } from 'react';
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
  Input
} from 'antd';
import {
  ReloadOutlined,
  LinkOutlined,
  SearchOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getLatestTransactions,
  parseTransactionType,
  parseTransactionStatus,
  formatAddress,
  formatTimestamp,
  type StarknetTransaction
} from '@/api/starknet';

const { Title, Text, Paragraph } = Typography;

const StarknetMonitor: React.FC = () => {
  const [transactions, setTransactions] = useState<StarknetTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchHash, setSearchHash] = useState('');

  // 获取交易数据
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const result = await getLatestTransactions(currentPage, pageSize);
      setTransactions(result.items);
      setLastUpdateTime(new Date().toLocaleTimeString('zh-CN'));
      message.success('交易数据已更新');
    } catch (error) {
      message.error('获取交易数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, pageSize]);

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
  }, [autoRefresh, currentPage, pageSize]);

  // 解析交易中的平台信息
  const parsePlatform = (tx: StarknetTransaction): string => {
    if (tx.calldata && tx.calldata.length > 0) {
      const platformData = tx.calldata.find((data: string) => data.startsWith('Platform:'));
      if (platformData) {
        return platformData.split(':')[1];
      }
    }
    return '未知平台';
  };

  // 解析代币信息
  const parseTokenInfo = (tx: StarknetTransaction): { from: string; to: string; amount: string } => {
    const defaultInfo = { from: '-', to: '-', amount: '-' };
    if (!tx.calldata || tx.calldata.length === 0) return defaultInfo;

    const fromData = tx.calldata.find((data: string) => data.startsWith('From:'));
    const toData = tx.calldata.find((data: string) => data.startsWith('To:'));
    const amountData = tx.calldata.find((data: string) => data.startsWith('Amount:'));

    return {
      from: fromData ? fromData.split(':')[1] : '-',
      to: toData ? toData.split(':')[1] : '-',
      amount: amountData ? amountData.split(':')[1] : '-'
    };
  };

  // 表格列定义
  const columns: ColumnsType<StarknetTransaction> = [
    {
      title: '交易哈希',
      dataIndex: 'hash',
      key: 'hash',
      width: 150,
      render: (hash: string) => (
        <Tooltip title={hash}>
          <Space>
            <Text copyable={{ text: hash }}>{formatAddress(hash)}</Text>
            <a
              href={`https://voyager.online/tx/${hash}`}
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
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">{parseTransactionType(type)}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const color = status === 'ACCEPTED_ON_L1' ? 'green' : 
                     status === 'ACCEPTED_ON_L2' ? 'cyan' : 'orange';
        return <Tag color={color}>{parseTransactionStatus(status)}</Tag>;
      },
    },
    {
      title: '平台',
      key: 'platform',
      width: 100,
      render: (_: any, record: StarknetTransaction) => {
        const platform = parsePlatform(record);
        return <Tag color="purple">{platform}</Tag>;
      },
    },
    {
      title: '代币交换',
      key: 'tokenSwap',
      width: 150,
      render: (_: any, record: StarknetTransaction) => {
        const tokenInfo = parseTokenInfo(record);
        return (
          <Space direction="vertical" size="small">
            <Text>
              <Tag color="gold">{tokenInfo.from}</Tag> → <Tag color="green">{tokenInfo.to}</Tag>
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              数量: {tokenInfo.amount}
            </Text>
          </Space>
        );
      },
    },
    {
      title: '发送地址',
      dataIndex: 'sender_address',
      key: 'sender_address',
      width: 150,
      render: (address: string) => address ? (
        <Tooltip title={address}>
          <Text copyable={{ text: address }}>{formatAddress(address)}</Text>
        </Tooltip>
      ) : '-',
    },
    {
      title: '合约地址',
      dataIndex: 'contract_address',
      key: 'contract_address',
      width: 150,
      render: (address: string) => address ? (
        <Tooltip title={address}>
          <Text copyable={{ text: address }}>{formatAddress(address)}</Text>
        </Tooltip>
      ) : '-',
    },
    {
      title: '区块高度',
      dataIndex: 'block_number',
      key: 'block_number',
      width: 100,
      render: (blockNumber: number) => blockNumber?.toLocaleString() || '-',
    },
    {
      title: '手续费 (ETH)',
      dataIndex: 'actual_fee',
      key: 'actual_fee',
      width: 120,
      render: (fee: string) => (
        <Text>{fee || '-'}</Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: number) => (
        <Tooltip title={formatTimestamp(timestamp)}>
          <Space>
            <ClockCircleOutlined />
            <Text>{formatTimestamp(timestamp)}</Text>
          </Space>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* 页面标题和说明 */}
      <Card style={{ marginBottom: '20px' }}>
        <Title level={2}>Starknet 交易监控</Title>
        <Paragraph>
          实时监控 Starknet 网络上的所有交易，包括 DEX 交易、代币转账、合约调用等。
          本页面使用免费的公共 API，无需登录即可查看。
        </Paragraph>
        <Paragraph type="secondary">
          <Text strong>数据来源：</Text>Voyager (Starknet 区块浏览器公共 API)
        </Paragraph>
      </Card>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="显示交易数"
              value={transactions.length}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前页"
              value={currentPage}
              suffix={`/ ${pageSize}条/页`}
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
              setCurrentPage(1);
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
          dataSource={transactions.filter(tx => 
            !searchHash || tx.hash.toLowerCase().includes(searchHash.toLowerCase())
          )}
          rowKey="hash"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: 2000, // 总数可以根据实际情况调整
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, newPageSize) => {
              setCurrentPage(page);
              if (newPageSize) setPageSize(newPageSize);
            },
            pageSizeOptions: ['10', '20', '50', '100'],
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
            <li><Text strong>交易哈希：</Text>点击复制图标可复制完整地址，点击链接图标可在 Voyager 浏览器中查看详情</li>
            <li><Text strong>类型：</Text>显示交易类型（调用、部署、声明等）</li>
            <li><Text strong>状态：</Text>显示交易确认状态（L1已确认、L2已确认、待处理等）</li>
            <li><Text strong>平台：</Text>显示执行交易的 DEX 平台（如 Jediswap、MySwap 等）</li>
            <li><Text strong>代币交换：</Text>显示交易涉及的代币对和数量</li>
            <li><Text strong>地址：</Text>显示发送地址和合约地址，可点击复制</li>
            <li><Text strong>自动刷新：</Text>开启后每30秒自动更新交易数据</li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  );
};

export default StarknetMonitor;
