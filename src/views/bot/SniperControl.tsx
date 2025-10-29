import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  message,
  Timeline,
  Divider,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import {
  startContinuousSniper,
  stopContinuousSniper,
  getSniperStatus,
  quickCheckSniper,
  getBroadcastResults,
  clearBroadcastResults,
  type SniperStatus,
  type BroadcastResult,
} from '@/services/sniperService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface LogEntry {
  timestamp: string;
  message: string;
  isDetected?: boolean;
  type: 'info' | 'success' | 'error' | 'warning';
}

const SniperControl: React.FC = () => {
  const [targetAddress, setTargetAddress] = useState('SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR');
  const [serializedData, setSerializedData] = useState('');
  const [status, setStatus] = useState<SniperStatus | null>(null);
  const [broadcasts, setBroadcasts] = useState<BroadcastResult[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', isDetected = false) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    setLogs(prev => [{ timestamp, message, isDetected, type }, ...prev].slice(0, 50));
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const response = await getSniperStatus();
      if (response.success && response.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  }, []);

  const loadBroadcasts = useCallback(async () => {
    try {
      const response = await getBroadcastResults();
      if (response.success && response.data) {
        setBroadcasts(response.data);
      }
    } catch (error) {
      console.error('Failed to load broadcasts:', error);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    loadBroadcasts();
    addLog('狙击服务控制面板已加载', 'info');

    const interval = setInterval(() => {
      loadStatus();
      loadBroadcasts();
    }, 3000);

    return () => clearInterval(interval);
  }, [loadStatus, loadBroadcasts, addLog]);

  const handleStartContinuous = async () => {
    if (!targetAddress || !serializedData) {
      message.error('请填写目标地址和序列化数据');
      addLog('错误：缺少必要参数', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await startContinuousSniper({
        targetAddress,
        serializedData,
      });

      if (response.success) {
        message.success('持续监控已启动！');
        addLog(`持续监控已启动 - 目标: ${targetAddress}`, 'success');
        loadStatus();
      } else {
        message.error(response.message || '启动失败');
        addLog(`启动失败: ${response.message}`, 'error');
      }
    } catch (error: any) {
      message.error('网络错误: ' + error.message);
      addLog(`网络错误: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStopContinuous = async () => {
    setLoading(true);
    try {
      const response = await stopContinuousSniper();

      if (response.success) {
        message.success('监控已停止');
        addLog('持续监控已停止', 'warning');
        loadStatus();
      } else {
        message.error(response.message || '停止失败');
        addLog(`停止失败: ${response.message}`, 'error');
      }
    } catch (error: any) {
      message.error('网络错误: ' + error.message);
      addLog(`网络错误: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = async () => {
    if (!targetAddress || !serializedData) {
      message.error('请填写目标地址和序列化数据');
      return;
    }

    setLoading(true);
    addLog('执行快速检查 (1秒超时)...', 'info');
    const startTime = Date.now();

    try {
      const response = await quickCheckSniper({
        targetAddress,
        serializedData,
        timeoutMs: 1000,
      });

      const elapsed = Date.now() - startTime;

      if (response.detected) {
        message.success(`检测到目标交易！耗时: ${response.responseTimeMs}ms`);
        addLog(`✅ 检测到交易！实际耗时: ${elapsed}ms`, 'success', true);
      } else {
        message.info(`未检测到交易。耗时: ${response.responseTimeMs}ms`);
        addLog(`未检测到交易。实际耗时: ${elapsed}ms`, 'info');
      }

      loadBroadcasts();
    } catch (error: any) {
      message.error('网络错误: ' + error.message);
      addLog(`网络错误: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog('日志已清空', 'info');
  };

  const handleClearResults = async () => {
    try {
      await clearBroadcastResults();
      message.success('结果已清空');
      addLog('广播结果已清空', 'info');
      loadStatus();
      loadBroadcasts();
    } catch (error: any) {
      message.error('清空失败: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>🎯 狙击服务控制面板</Title>
      <Text type="secondary">Sniper Service Control Panel - 监控目标地址并自动广播交易</Text>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="配置" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>目标地址 (Target Address)</Text>
                <Input
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR"
                  style={{ marginTop: 8, fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <Text strong>序列化交易数据 (Serialized Transaction)</Text>
                <TextArea
                  value={serializedData}
                  onChange={(e) => setSerializedData(e.target.value)}
                  placeholder="0x00000000010400000000..."
                  rows={4}
                  style={{ marginTop: 8, fontFamily: 'monospace' }}
                />
              </div>

              <Space wrap>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartContinuous}
                  loading={loading}
                  size="large"
                >
                  启动监控
                </Button>
                <Button
                  danger
                  icon={<PauseCircleOutlined />}
                  onClick={handleStopContinuous}
                  loading={loading}
                  size="large"
                >
                  停止监控
                </Button>
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={handleQuickCheck}
                  loading={loading}
                  size="large"
                >
                  快速检查
                </Button>
              </Space>
            </Space>
          </Card>

          <Card title="状态" bordered={false} style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="运行状态"
                  value={status?.isRunning ? '运行中' : '已停止'}
                  valueStyle={{ color: status?.isRunning ? '#3f8600' : '#cf1322' }}
                  prefix={status?.isRunning ? '🟢' : '🔴'}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="检测到的交易"
                  value={status?.detectedCount || 0}
                  suffix="笔"
                />
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Statistic
                  title="广播次数"
                  value={status?.broadcastCount || 0}
                  suffix="次"
                />
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Statistic
                  title="上次检查"
                  value={status?.lastCheckTime ? new Date(status.lastCheckTime).toLocaleTimeString('zh-CN') : '--'}
                />
              </Col>
            </Row>

            {status?.detectedTxIDs && status.detectedTxIDs.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>检测到的交易ID:</Text>
                <div style={{ marginTop: 8 }}>
                  {status.detectedTxIDs.map((txId, idx) => (
                    <Tag key={idx} color="success" style={{ marginBottom: 4 }}>
                      {txId.substring(0, 16)}...
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="操作日志"
            bordered={false}
            extra={
              <Button size="small" icon={<ClearOutlined />} onClick={handleClearLogs}>
                清空日志
              </Button>
            }
          >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Timeline
                items={logs.map((log, idx) => ({
                  key: idx,
                  color: log.isDetected ? 'green' : log.type === 'error' ? 'red' : log.type === 'warning' ? 'orange' : 'blue',
                  children: (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        [{log.timestamp}]
                      </Text>{' '}
                      <Text strong={log.isDetected}>{log.message}</Text>
                    </div>
                  ),
                }))}
              />
            </div>
          </Card>

          <Card
            title="广播结果"
            bordered={false}
            style={{ marginTop: 16 }}
            extra={
              <Button size="small" icon={<ClearOutlined />} onClick={handleClearResults}>
                清空结果
              </Button>
            }
          >
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {broadcasts.length === 0 ? (
                <Text type="secondary">暂无广播记录</Text>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {broadcasts.map((broadcast, idx) => (
                    <Card key={idx} size="small">
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Tag color={broadcast.success ? 'success' : 'error'}>
                            {broadcast.success ? '成功' : '失败'}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(broadcast.timestamp).toLocaleString('zh-CN')}
                          </Text>
                        </div>
                        <Text ellipsis style={{ fontSize: '12px' }}>
                          节点: {broadcast.nodeUrl}
                        </Text>
                        {broadcast.txId && (
                          <Text ellipsis style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                            TxID: {broadcast.txId}
                          </Text>
                        )}
                        {broadcast.error && (
                          <Text type="danger" style={{ fontSize: '12px' }}>
                            错误: {broadcast.error}
                          </Text>
                        )}
                      </Space>
                    </Card>
                  ))}
                </Space>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SniperControl;
