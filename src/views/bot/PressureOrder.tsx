import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Switch,
  Input,
  Select,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  message,
  Alert,
  Divider,
  InputNumber,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getPressureOrderMonitor,
  resetPressureOrderMonitor,
  type PressureOrderConfig,
  type PressureOrderStatus,
  type DetectedTransaction,
} from '@/services/pressureOrderMonitor';

const { Title, Text } = Typography;
const { Option } = Select;

const PressureOrder: React.FC = () => {
  // Configuration state
  const [config, setConfig] = useState<PressureOrderConfig>({
    enabled: true,
    monitoredAddresses: [],
    tradePair: 'STX/AEUSDC',
    tradeAmount: 3000,
    tradeDirection: 'sell',
    maxApiCallsPerMinute: 30,
    checkIntervalMs: 5000,
    dx: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    dy: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    fee: '0.124251',
  });

  // Status state
  const [status, setStatus] = useState<PressureOrderStatus>({
    running: false,
    monitoredAddresses: [],
    lastCheckTime: '',
    detectedTransactions: 0,
    executedTrades: 0,
    currentApiCallRate: 0,
    errors: [],
  });

  // Transactions state
  const [transactions, setTransactions] = useState<DetectedTransaction[]>([]);
  
  // UI state
  const [newAddress, setNewAddress] = useState('');
  const [statusUpdateInterval, setStatusUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  // Load saved config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('pressureOrderConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Failed to load saved config:', error);
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pressureOrderConfig', JSON.stringify(config));
  }, [config]);

  // Update status periodically
  useEffect(() => {
    if (status.running) {
      const interval = setInterval(() => {
        try {
          const monitor = getPressureOrderMonitor();
          setStatus(monitor.getStatus());
          setTransactions(monitor.getDetectedTransactions(50));
        } catch (error) {
          console.error('Failed to get status:', error);
        }
      }, 1000);
      setStatusUpdateInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (statusUpdateInterval) {
        clearInterval(statusUpdateInterval);
        setStatusUpdateInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.running]);

  // Start monitoring
  const handleStart = () => {
    if (config.monitoredAddresses.length === 0) {
      message.error('请至少添加一个监控地址');
      return;
    }

    try {
      const monitor = getPressureOrderMonitor(config);
      
      // Set up callbacks
      monitor.onStatusUpdate((newStatus) => {
        setStatus(newStatus);
      });
      
      monitor.onTransactionDetected((tx) => {
        message.success(`检测到新交易: ${tx.txId.substring(0, 10)}...`);
        setTransactions(monitor.getDetectedTransactions(50));
      });
      
      monitor.start();
      setStatus(monitor.getStatus());
      message.success('压单监控已启动');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      message.error(`启动失败: ${errorMsg}`);
    }
  };

  // Stop monitoring
  const handleStop = () => {
    try {
      const monitor = getPressureOrderMonitor();
      monitor.stop();
      setStatus(monitor.getStatus());
      message.success('压单监控已停止');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      message.error(`停止失败: ${errorMsg}`);
    }
  };

  // Reset monitor
  const handleReset = () => {
    try {
      resetPressureOrderMonitor();
      setStatus({
        running: false,
        monitoredAddresses: [],
        lastCheckTime: '',
        detectedTransactions: 0,
        executedTrades: 0,
        currentApiCallRate: 0,
        errors: [],
      });
      setTransactions([]);
      message.success('监控已重置');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      message.error(`重置失败: ${errorMsg}`);
    }
  };

  // Add address
  const handleAddAddress = () => {
    if (!newAddress.trim()) {
      message.warning('请输入地址');
      return;
    }
    
    if (config.monitoredAddresses.includes(newAddress.trim())) {
      message.warning('地址已存在');
      return;
    }

    setConfig({
      ...config,
      monitoredAddresses: [...config.monitoredAddresses, newAddress.trim()],
    });
    setNewAddress('');
    message.success('地址已添加');
  };

  // Remove address
  const handleRemoveAddress = (address: string) => {
    setConfig({
      ...config,
      monitoredAddresses: config.monitoredAddresses.filter(a => a !== address),
    });
    message.success('地址已移除');
  };

  // Update config
  const handleConfigChange = (key: keyof PressureOrderConfig, value: unknown) => {
    setConfig({
      ...config,
      [key]: value,
    });
    
    // Update monitor config if running
    if (status.running) {
      try {
        const monitor = getPressureOrderMonitor();
        monitor.updateConfig({ [key]: value });
      } catch (error) {
        console.error('Failed to update monitor config:', error);
      }
    }
  };

  // Table columns for detected transactions
  const columns: ColumnsType<DetectedTransaction> = [
    {
      title: '交易ID',
      dataIndex: 'txId',
      key: 'txId',
      width: 150,
      render: (txId: string) => (
        <Text copyable={{ text: txId }}>{txId.substring(0, 10)}...</Text>
      ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 150,
      render: (address: string) => (
        <Text copyable={{ text: address }}>{address.substring(0, 10)}...</Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleString('zh-CN'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount?: string) => amount ? `${parseFloat(amount) / 1000000} STX` : '-',
    },
    {
      title: '自动交易',
      dataIndex: 'autoTradeExecuted',
      key: 'autoTradeExecuted',
      width: 100,
      render: (executed: boolean) => (
        <Tag color={executed ? 'success' : 'default'}>
          {executed ? '已执行' : '未执行'}
        </Tag>
      ),
    },
    {
      title: '交易结果',
      dataIndex: 'tradeResult',
      key: 'tradeResult',
      render: (result?: string) => result || '-',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '20px' }}>
        <Title level={2}>压单功能 (Pressure Order)</Title>
        <Text type="secondary">
          自动监控指定地址的交易，并在检测到交易时自动执行STX/AEUSDC交易
        </Text>
      </Card>

      {/* Status Overview */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行状态"
              value={status.running ? '运行中' : '已停止'}
              valueStyle={{ color: status.running ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="检测到的交易"
              value={status.detectedTransactions}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已执行交易"
              value={status.executedTrades}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="API调用速率"
              value={status.currentApiCallRate}
              suffix={`/ ${config.maxApiCallsPerMinute} 次/分钟`}
            />
          </Card>
        </Col>
      </Row>

      {/* Control Panel */}
      <Card title="控制面板" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Start/Stop Controls */}
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStart}
              disabled={status.running}
            >
              启动监控
            </Button>
            <Button
              danger
              icon={<PauseCircleOutlined />}
              onClick={handleStop}
              disabled={!status.running}
            >
              停止监控
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
          </Space>

          <Divider />

          {/* Configuration */}
          <Row gutter={16}>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>基本配置</Text>
                
                <Space>
                  <Text>启用自动交易：</Text>
                  <Switch
                    checked={config.enabled}
                    onChange={(checked) => handleConfigChange('enabled', checked)}
                  />
                </Space>

                <Space>
                  <Text>交易对：</Text>
                  <Select
                    value={config.tradePair}
                    onChange={(value) => handleConfigChange('tradePair', value)}
                    style={{ width: 200 }}
                  >
                    <Option value="STX/AEUSDC">STX/AEUSDC</Option>
                    <Option value="STX/BTC">STX/BTC</Option>
                    <Option value="STX/USDT">STX/USDT</Option>
                  </Select>
                </Space>

                <Space>
                  <Text>交易金额：</Text>
                  <InputNumber
                    value={config.tradeAmount}
                    onChange={(value) => handleConfigChange('tradeAmount', value || 3000)}
                    min={100}
                    max={100000}
                    style={{ width: 200 }}
                  />
                  <Text>STX</Text>
                </Space>

                <Space>
                  <Text>交易方向：</Text>
                  <Select
                    value={config.tradeDirection}
                    onChange={(value) => handleConfigChange('tradeDirection', value)}
                    style={{ width: 200 }}
                  >
                    <Option value="buy">买入</Option>
                    <Option value="sell">卖出</Option>
                    <Option value="auto">自动</Option>
                  </Select>
                </Space>

                <Space>
                  <Text>手续费：</Text>
                  <Input
                    value={config.fee}
                    onChange={(e) => handleConfigChange('fee', e.target.value)}
                    style={{ width: 200 }}
                  />
                </Space>
              </Space>
            </Col>

            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>性能配置</Text>
                
                <Space>
                  <Text>API调用限制：</Text>
                  <InputNumber
                    value={config.maxApiCallsPerMinute}
                    onChange={(value) => handleConfigChange('maxApiCallsPerMinute', value || 30)}
                    min={1}
                    max={100}
                    style={{ width: 200 }}
                  />
                  <Text>次/分钟</Text>
                </Space>

                <Space>
                  <Text>检查间隔：</Text>
                  <InputNumber
                    value={config.checkIntervalMs}
                    onChange={(value) => handleConfigChange('checkIntervalMs', value || 5000)}
                    min={1000}
                    max={60000}
                    step={1000}
                    style={{ width: 200 }}
                  />
                  <Text>毫秒</Text>
                </Space>

                <Alert
                  message="性能提示"
                  description="程序会自动调整检查频率以避免超出API限制。当接近限制时，检查间隔会自动延长。"
                  type="info"
                  showIcon
                />
              </Space>
            </Col>
          </Row>

          <Divider />

          {/* Monitored Addresses */}
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>监控地址 ({config.monitoredAddresses.length})</Text>
            
            <Space>
              <Input
                placeholder="输入Stacks地址 (例如: SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                onPressEnter={handleAddAddress}
                style={{ width: 500 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddAddress}
              >
                添加地址
              </Button>
            </Space>

            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {config.monitoredAddresses.map((address) => (
                <Tag
                  key={address}
                  closable
                  onClose={() => handleRemoveAddress(address)}
                  style={{ marginBottom: 8 }}
                >
                  {address}
                </Tag>
              ))}
              {config.monitoredAddresses.length === 0 && (
                <Text type="secondary">暂无监控地址</Text>
              )}
            </div>
          </Space>

          {/* Status Info */}
          {status.lastCheckTime && (
            <Alert
              message={`最后检查时间: ${new Date(status.lastCheckTime).toLocaleString('zh-CN')}`}
              type="success"
              showIcon
            />
          )}

          {/* Errors */}
          {status.errors.length > 0 && (
            <Alert
              message="错误日志"
              description={
                <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                  {status.errors.slice(-5).map((error, index) => (
                    <div key={index} style={{ marginBottom: 4 }}>
                      <Text type="danger">{error}</Text>
                    </div>
                  ))}
                </div>
              }
              type="error"
              showIcon
              closable
            />
          )}
        </Space>
      </Card>

      {/* Detected Transactions */}
      <Card title="检测到的交易" style={{ marginBottom: '20px' }}>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="txId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 笔交易`,
          }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default PressureOrder;
