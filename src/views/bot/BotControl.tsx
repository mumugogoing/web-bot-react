import React from 'react';
import { Card, Row, Col, Button, Space, Tag, Alert, Divider } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useMakerGun } from '@/hooks/useMakerGun';
import { useAutoSwap } from '@/hooks/useAutoSwap';
import { useSUSDT } from '@/hooks/useSUSDT';
import './BotControl.css';

const BotControl: React.FC = () => {
  const makerGun = useMakerGun();
  const autoSwap = useAutoSwap();
  const susdt = useSUSDT();

  const renderBotCard = (
    title: string,
    description: string,
    status: { running: boolean },
    loading: boolean,
    error: string | null,
    logs: string[],
    onStart: () => void,
    onStop: () => void,
    onRefresh: () => void
  ) => {
    return (
      <Card
        className="bot-card"
        title={
          <Space>
            <span>{title}</span>
            {status.running ? (
              <div className="status-indicator running" />
            ) : (
              <div className="status-indicator stopped" />
            )}
          </Space>
        }
        extra={
          <Tag
            icon={status.running ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={status.running ? 'success' : 'default'}
          >
            {status.running ? 'Running' : 'Stopped'}
          </Tag>
        }
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        <div className="bot-description">{description}</div>

        <Divider />

        <Space style={{ marginBottom: 16 }}>
          {!status.running ? (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={onStart}
              loading={loading}
            >
              Start
            </Button>
          ) : (
            <Button
              danger
              icon={<PauseCircleOutlined />}
              onClick={onStop}
              loading={loading}
            >
              Stop
            </Button>
          )}
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Space>

        {/* Live Logs */}
        <Card type="inner" title="Activity Log" size="small">
          <div className="log-container">
            {logs.length === 0 ? (
              <div className="no-logs">No activity yet</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="log-entry">
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>
      </Card>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title={
          <Space>
            <SyncOutlined spin={makerGun.status.running || autoSwap.status.running || susdt.status.running} />
            <span>Bot Control Panel</span>
          </Space>
        }
      >
        <Alert
          message="Bot Control System"
          description="Control and monitor MakerGun, AutoSwap, and sUSDT test bots. Real-time status updates via WebSocket connections."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            {renderBotCard(
              'MakerGun',
              'Market making bot with 100ms ticker using Wallet2. Executes market making operations on DEX platforms.',
              makerGun.status,
              makerGun.loading,
              makerGun.error,
              makerGun.logs,
              () => makerGun.start({}),
              makerGun.stop,
              makerGun.refresh
            )}
          </Col>

          <Col xs={24} lg={8}>
            {renderBotCard(
              'AutoSwap',
              'Automated swap operations with 900ms ticker. Executes swaps in non-monitoring mode for optimal performance.',
              autoSwap.status,
              autoSwap.loading,
              autoSwap.error,
              autoSwap.logs,
              () => autoSwap.start({}),
              autoSwap.stop,
              autoSwap.refresh
            )}
          </Col>

          <Col xs={24} lg={8}>
            {renderBotCard(
              'sUSDT Test',
              'One-time execution using Wallet1. Performs SUSDT to ABTC conversion via AlexAutoSellSTX.',
              susdt.status,
              susdt.loading,
              susdt.error,
              susdt.logs,
              () => susdt.start({}),
              susdt.stop,
              susdt.refresh
            )}
          </Col>
        </Row>

        <Divider />

        <Card type="inner" title="Security & Configuration Notes">
          <ul>
            <li>✅ All endpoints are protected by Casbin authorization middleware</li>
            <li>✅ Thread-safe state management with proper mutex locking</li>
            <li>✅ WebSocket connections with automatic reconnection (5s interval)</li>
            <li>⚠️ All bots execute real blockchain transactions</li>
            <li>⚠️ Ensure proper wallet configuration and sufficient balance before use</li>
            <li>⚠️ Monitor logs carefully during operation</li>
          </ul>
        </Card>
      </Card>
    </div>
  );
};

export default BotControl;
