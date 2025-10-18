import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Switch,
  Space,
  message,
  Select,
  Typography,
  Tag,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { monitorPendingTx, xykSerialize } from '@/api/dex/alex';

const { Title, Text } = Typography;
const { Option } = Select;

interface LogItem {
  id: number;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

interface PendingTransaction {
  txid?: string;
  amount?: string | number;
  dx?: string;
  dy?: string;
  fee?: string;
  quote?: string;
  singper?: boolean; // Backend flag to trigger immediate broadcast
  [key: string]: any;
}

const PendingMonitor: React.FC = () => {
  // 监控配置
  const [monitorAddress, setMonitorAddress] = useState('');
  const [pollingInterval, setPollingInterval] = useState(500); // 默认500ms
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(false);
  
  // 交易参数
  const [txParams, setTxParams] = useState({
    amount: '',
    dx: '',
    dy: '',
    fee: '',
    quote: '',
  });
  
  // 日志和状态
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedTxid, setLastSubmittedTxid] = useState('');
  const [cooldownEndTime, setCooldownEndTime] = useState(0);
  
  // 引用
  const logIdCounter = useRef(0);
  const monitorInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPendingTxid = useRef('');

  // 添加日志
  const addLog = (type: LogItem['type'], message: string) => {
    const now = new Date();
    const timestamp = now.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
    
    const newLog: LogItem = {
      id: logIdCounter.current++,
      timestamp,
      type,
      message,
    };
    
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      // 只保留最近10条日志
      return updatedLogs.slice(0, 10);
    });
  };

  // 验证交易参数
  const validateTxParams = (params: any): boolean => {
    if (!params.amount || isNaN(Number(params.amount)) || Number(params.amount) <= 0) {
      addLog('error', '交易参数验证失败: amount 无效');
      return false;
    }
    if (!params.dx || typeof params.dx !== 'string' || params.dx.trim() === '') {
      addLog('error', '交易参数验证失败: dx 无效');
      return false;
    }
    if (!params.dy || typeof params.dy !== 'string' || params.dy.trim() === '') {
      addLog('error', '交易参数验证失败: dy 无效');
      return false;
    }
    if (!params.fee || isNaN(Number(params.fee)) || Number(params.fee) < 0) {
      addLog('error', '交易参数验证失败: fee 无效');
      return false;
    }
    if (!params.quote || isNaN(Number(params.quote)) || Number(params.quote) <= 0) {
      addLog('error', '交易参数验证失败: quote 无效');
      return false;
    }
    return true;
  };

  // 检查是否在冷却期
  const isInCooldown = (): boolean => {
    return Date.now() < cooldownEndTime;
  };

  // 提交交易
  const submitTransaction = async (pendingTx: PendingTransaction) => {
    if (isSubmitting) {
      addLog('warning', '正在提交交易，请勿重复操作');
      return;
    }

    if (isInCooldown()) {
      const remainingTime = Math.ceil((cooldownEndTime - Date.now()) / 1000);
      addLog('warning', `冷却期内，剩余 ${remainingTime} 秒`);
      return;
    }

    // 防止重复提交同一交易
    if (pendingTx.txid && pendingTx.txid === lastSubmittedTxid) {
      addLog('warning', `交易已提交过: ${pendingTx.txid.substring(0, 10)}...`);
      return;
    }

    const params = {
      amount: pendingTx.amount || txParams.amount,
      dx: pendingTx.dx || txParams.dx,
      dy: pendingTx.dy || txParams.dy,
      fee: pendingTx.fee || txParams.fee,
      quote: pendingTx.quote || txParams.quote,
    };

    if (!validateTxParams(params)) {
      return;
    }

    try {
      setIsSubmitting(true);
      addLog('info', '正在提交 xykserialize 交易...');
      
      const response: any = await xykSerialize(params);
      
      if (response && response.data) {
        const txid = response.data.txid || response.data.txId || 'unknown';
        addLog('success', `交易提交成功: ${txid}`);
        setLastSubmittedTxid(pendingTx.txid || txid);
        
        // 设置3秒冷却期
        setCooldownEndTime(Date.now() + 3000);
        
        // 如果开启自动提交，在提交一次后自动关闭监控（防止被批量交易攻击）
        if (autoSubmit) {
          addLog('warning', '自动提交完成，已停止监控（防止批量攻击）');
          stopMonitoring();
        }
      } else {
        throw new Error('提交响应无效');
      }
    } catch (error: any) {
      addLog('error', `交易提交失败: ${error.message || '未知错误'}`);
      message.error('交易提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 轮询检查待处理交易
  const checkPendingTransactions = async () => {
    if (!monitorAddress) {
      return;
    }

    try {
      const response: any = await monitorPendingTx({ address: monitorAddress });
      
      if (response && response.data) {
        const pendingTx: PendingTransaction = response.data;
        
        // 检查是否有新的待处理交易
        if (pendingTx && pendingTx.txid) {
          // 避免重复检测同一交易
          if (pendingTx.txid !== lastPendingTxid.current) {
            lastPendingTxid.current = pendingTx.txid;
            addLog('info', `检测到待处理交易: ${pendingTx.txid.substring(0, 10)}...`);
            
            // 如果后端返回 singper: true，立即广播交易
            if (pendingTx.singper === true) {
              addLog('warning', '后端触发立即广播信号 (singper: true)');
              
              if (autoSubmit) {
                await submitTransaction(pendingTx);
              } else {
                addLog('info', '自动提交未开启，跳过交易提交');
              }
            } else {
              addLog('info', '等待后端确认或手动提交');
            }
          }
        } else {
          // 没有待处理交易，重置lastPendingTxid
          if (lastPendingTxid.current !== '') {
            lastPendingTxid.current = '';
            addLog('info', '当前无待处理交易');
          }
        }
      }
    } catch (error: any) {
      // 处理速率限制
      if (error.response && error.response.status === 429) {
        addLog('error', '请求频率过高，已被限制');
        // 自动暂停监控
        stopMonitoring();
        message.error('请求频率过高，已暂停监控');
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        addLog('warning', '请求超时，继续监控');
      } else {
        addLog('error', `监控错误: ${error.message || '未知错误'}`);
      }
    }
  };

  // 启动监控
  const startMonitoring = () => {
    if (!monitorAddress) {
      message.warning('请输入要监控的地址');
      return;
    }

    if (pollingInterval < 100) {
      message.warning('轮询间隔不能小于100ms');
      return;
    }

    setIsMonitoring(true);
    addLog('success', `开始监控地址: ${monitorAddress} (间隔: ${pollingInterval}ms)`);
    
    // 立即执行一次
    checkPendingTransactions();
    
    // 设置定时器
    monitorInterval.current = setInterval(() => {
      checkPendingTransactions();
    }, pollingInterval);
  };

  // 停止监控
  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitorInterval.current) {
      clearInterval(monitorInterval.current);
      monitorInterval.current = null;
    }
    addLog('info', '监控已停止');
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
    logIdCounter.current = 0;
  };

  // 手动提交
  const handleManualSubmit = () => {
    const params = {
      amount: txParams.amount,
      dx: txParams.dx,
      dy: txParams.dy,
      fee: txParams.fee,
      quote: txParams.quote,
    };
    submitTransaction(params);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (monitorInterval.current) {
        clearInterval(monitorInterval.current);
      }
    };
  }, []);

  // 日志颜色映射
  const getLogColor = (type: LogItem['type']) => {
    switch (type) {
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      default:
        return '#1890ff';
    }
  };

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      <Title level={2}>实时交易监控与压单</Title>
      
      {/* 监控配置 */}
      <Card title="监控配置" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Text>监控地址:</Text>
            <Input
              placeholder="输入 Stacks 地址"
              value={monitorAddress}
              onChange={(e) => setMonitorAddress(e.target.value)}
              style={{ width: 400 }}
              disabled={isMonitoring}
            />
          </Space>
          
          <Space>
            <Text>轮询间隔:</Text>
            <Select
              value={pollingInterval}
              onChange={setPollingInterval}
              style={{ width: 150 }}
              disabled={isMonitoring}
            >
              <Option value={100}>100ms (极快)</Option>
              <Option value={200}>200ms (很快)</Option>
              <Option value={500}>500ms (快速)</Option>
              <Option value={1000}>1000ms (标准)</Option>
              <Option value={2000}>2000ms (慢速)</Option>
            </Select>
            <Text type="secondary">
              注意: 间隔过小可能触发速率限制
            </Text>
          </Space>
          
          <Space>
            <Text>自动提交:</Text>
            <Switch
              checked={autoSubmit}
              onChange={setAutoSubmit}
              checkedChildren="开启"
              unCheckedChildren="关闭"
              disabled={isMonitoring}
            />
            <Text type="secondary">
              检测到待处理交易且后端返回 singper:true 时自动提交（提交一次后自动关闭）
            </Text>
          </Space>
          
          <Space>
            {!isMonitoring ? (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={startMonitoring}
              >
                开始监控
              </Button>
            ) : (
              <Button
                type="primary"
                danger
                icon={<PauseCircleOutlined />}
                onClick={stopMonitoring}
              >
                停止监控
              </Button>
            )}
            
            <Tag color={isMonitoring ? 'green' : 'default'}>
              {isMonitoring ? '监控中' : '未监控'}
            </Tag>
            
            {isInCooldown() && (
              <Tag color="orange">
                冷却中 ({Math.ceil((cooldownEndTime - Date.now()) / 1000)}s)
              </Tag>
            )}
          </Space>
        </Space>
      </Card>

      {/* 交易参数 */}
      <Card title="交易参数配置" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Text style={{ width: 80 }}>金额:</Text>
            <Input
              placeholder="Amount"
              value={txParams.amount}
              onChange={(e) => setTxParams({ ...txParams, amount: e.target.value })}
              style={{ width: 300 }}
            />
          </Space>
          
          <Space>
            <Text style={{ width: 80 }}>DX:</Text>
            <Input
              placeholder="输入代币合约地址"
              value={txParams.dx}
              onChange={(e) => setTxParams({ ...txParams, dx: e.target.value })}
              style={{ width: 500 }}
            />
          </Space>
          
          <Space>
            <Text style={{ width: 80 }}>DY:</Text>
            <Input
              placeholder="输出代币合约地址"
              value={txParams.dy}
              onChange={(e) => setTxParams({ ...txParams, dy: e.target.value })}
              style={{ width: 500 }}
            />
          </Space>
          
          <Space>
            <Text style={{ width: 80 }}>费率:</Text>
            <Input
              placeholder="Fee"
              value={txParams.fee}
              onChange={(e) => setTxParams({ ...txParams, fee: e.target.value })}
              style={{ width: 300 }}
            />
          </Space>
          
          <Space>
            <Text style={{ width: 80 }}>报价:</Text>
            <Input
              placeholder="Quote"
              value={txParams.quote}
              onChange={(e) => setTxParams({ ...txParams, quote: e.target.value })}
              style={{ width: 300 }}
            />
          </Space>
          
          <Button
            type="primary"
            onClick={handleManualSubmit}
            loading={isSubmitting}
            disabled={isMonitoring}
          >
            手动提交交易
          </Button>
        </Space>
      </Card>

      {/* 活动日志 */}
      <Card
        title={
          <Space>
            <span>活动日志</span>
            <Text type="secondary">(最近 10 条)</Text>
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={clearLogs}
            >
              清空日志
            </Button>
          </Space>
        }
      >
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: '#f5f5f5',
            padding: 10,
            borderRadius: 4,
          }}
        >
          {logs.length === 0 ? (
            <Text type="secondary">暂无日志</Text>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '8px 12px',
                  marginBottom: 8,
                  backgroundColor: '#fff',
                  borderLeft: `4px solid ${getLogColor(log.type)}`,
                  borderRadius: 4,
                }}
              >
                <Space>
                  <Text
                    type="secondary"
                    style={{ fontSize: '12px', fontFamily: 'monospace' }}
                  >
                    {log.timestamp}
                  </Text>
                  <Tag color={log.type === 'success' ? 'success' : log.type === 'error' ? 'error' : log.type === 'warning' ? 'warning' : 'processing'}>
                    {log.type.toUpperCase()}
                  </Tag>
                  <Text>{log.message}</Text>
                </Space>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 说明文档 */}
      <Card title="功能说明" style={{ marginTop: 20 }}>
        <ul>
          <li><Text strong>实时监控：</Text>以毫秒级轮询指定的 Stacks 地址，查找待处理的交易</li>
          <li><Text strong>自动提交：</Text>检测到待处理交易且后端返回 singper:true 时立即触发 xykserialize 交易提交</li>
          <li><Text strong>智能验证：</Text>在启用之前验证所有交易参数（金额、dx、dy、费用、报价）</li>
          <li><Text strong>重复预防：</Text>3 秒冷却期可防止同一待处理交易的重复提交</li>
          <li><Text strong>活动日志：</Text>维护最近 10 个监控事件的可滚动日志，并带有时间戳</li>
          <li><Text strong>防攻击：</Text>提交一次后自动关闭压单，防止被批量交易攻击</li>
          <li><Text strong>速率限制处理：</Text>遇到速率限制自动暂停监控，避免被封禁</li>
        </ul>
      </Card>
    </div>
  );
};

export default PendingMonitor;
