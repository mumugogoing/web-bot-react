import React, { useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Switch,
  Button,
  Space,
  Alert,
  Descriptions,
  Tag,
  Divider,
  Select,
  message
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useSbtcMakerGun } from '@/hooks/useSbtcMakerGun';
import { submitSbtcStxOrder, type SbtcMakerGunConfig } from '@/api/makergun/sbtc';

const { Option } = Select;

interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

const SbtcMakerGun: React.FC = () => {
  const { status, loading, error, start, stop, refresh } = useSbtcMakerGun();
  const [form] = Form.useForm();
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Order pressing state
  const [pressingEnabled, setPressingEnabled] = useState(false);
  const [pressingInterval, setPressingInterval] = useState(500); // milliseconds
  const [pressingAmount, setPressingAmount] = useState(0.01);
  const [pressingPosition, setPressingPosition] = useState(0);
  const pressingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Default configuration
  const defaultConfig: SbtcMakerGunConfig = {
    sellamount: 0.01,
    buyamount: 100,
    up: 0.5,
    down: 0.5,
    sellswitch: true,
    buyswitch: true,
    sellfee: 0.1,
    buyfee: 0.1,
    model: 3,
    check_balance: true
  };

  // Handle start bot
  const handleStart = async () => {
    try {
      const values = await form.validateFields();
      await start(values);
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  // Handle stop bot
  const handleStop = async () => {
    await stop();
  };

  // Handle manual order submission
  const handleManualOrder = async (amount: number, position: number) => {
    setOrderLoading(true);
    try {
      const response = await submitSbtcStxOrder({ amount, position }) as any as ApiResponse;
      if (response.code === 201) {
        message.success(`Manual order submitted successfully (${position === 0 ? 'Sell SBTC' : 'Buy SBTC'})`);
      } else {
        message.error(response.msg || 'Failed to submit order');
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to submit manual order');
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle order pressing submission
  const handlePressingOrder = async () => {
    try {
      const response = await submitSbtcStxOrder({ 
        amount: pressingAmount, 
        position: pressingPosition 
      }) as any as ApiResponse;
      
      if (response.code === 201) {
        message.success(`Order pressed successfully (${pressingPosition === 0 ? 'Sell SBTC' : 'Buy SBTC'})`);
        // Auto-disable after successful submission to prevent mass trading attacks
        stopOrderPressing();
        message.info('Order pressing auto-disabled for security. Please enable manually for next use.');
      } else {
        message.error(response.msg || 'Failed to press order');
        stopOrderPressing();
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to press order');
      stopOrderPressing();
    }
  };

  // Start order pressing
  const startOrderPressing = () => {
    if (!pressingAmount || pressingAmount <= 0) {
      message.warning('Please enter a valid amount for order pressing');
      return;
    }

    if (pressingInterval < 100) {
      message.warning('Minimum interval is 100ms to prevent excessive network load');
      return;
    }

    setPressingEnabled(true);
    message.success(`Order pressing started with ${pressingInterval}ms interval`);
    
    // Execute first order immediately
    handlePressingOrder();
    
    // Set up interval for subsequent orders
    pressingIntervalRef.current = setInterval(() => {
      handlePressingOrder();
    }, pressingInterval);
  };

  // Stop order pressing
  const stopOrderPressing = () => {
    if (pressingIntervalRef.current) {
      clearInterval(pressingIntervalRef.current);
      pressingIntervalRef.current = null;
    }
    setPressingEnabled(false);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopOrderPressing();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Card title="SBTC MakerGun Trading Bot" extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
          {status.running ? (
            <Tag icon={<CheckCircleOutlined />} color="success">Running</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">Stopped</Tag>
          )}
        </Space>
      }>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            closable
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Status Display */}
        {status.running && status.config && (
          <Card type="inner" title="Current Status" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Sell Amount">{status.config.sellamount} SBTC</Descriptions.Item>
              <Descriptions.Item label="Buy Amount">{status.config.buyamount} STX</Descriptions.Item>
              <Descriptions.Item label="Sell Profit Margin">{status.config.up}%</Descriptions.Item>
              <Descriptions.Item label="Buy Profit Margin">{status.config.down}%</Descriptions.Item>
              <Descriptions.Item label="Sell Switch">
                <Tag color={status.config.sellswitch ? 'green' : 'red'}>
                  {status.config.sellswitch ? 'ON' : 'OFF'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Buy Switch">
                <Tag color={status.config.buyswitch ? 'green' : 'red'}>
                  {status.config.buyswitch ? 'ON' : 'OFF'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sell Fee">{status.config.sellfee}%</Descriptions.Item>
              <Descriptions.Item label="Buy Fee">{status.config.buyfee}%</Descriptions.Item>
              <Descriptions.Item label="Trading Mode">
                Mode {status.config.model}
                {status.config.model === 0 && ' (Normal)'}
                {status.config.model === 1 && ' (DeFi Priority -1)'}
                {status.config.model === 2 && ' (DeFi Priority -2)'}
                {status.config.model === 3 && ' (CEX Priority)'}
              </Descriptions.Item>
              <Descriptions.Item label="Balance Check">
                <Tag color={status.config.check_balance ? 'green' : 'orange'}>
                  {status.config.check_balance ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Configuration Form */}
        <Card type="inner" title="Bot Configuration">
          <Form
            form={form}
            layout="vertical"
            initialValues={status.config || defaultConfig}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label="Sell Amount (SBTC)"
                name="sellamount"
                rules={[{ required: true, message: 'Please input sell amount' }]}
              >
                <InputNumber
                  min={0.001}
                  step={0.001}
                  style={{ width: '100%' }}
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Buy Amount (STX)"
                name="buyamount"
                rules={[{ required: true, message: 'Please input buy amount' }]}
              >
                <InputNumber
                  min={1}
                  step={10}
                  style={{ width: '100%' }}
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Sell Profit Margin (%)"
                name="up"
                rules={[{ required: true, message: 'Please input sell profit margin' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: '100%' }}
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Buy Profit Margin (%)"
                name="down"
                rules={[{ required: true, message: 'Please input buy profit margin' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: '100%' }}
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Sell Fee (%)"
                name="sellfee"
                rules={[{ required: true, message: 'Please input sell fee' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Buy Fee (%)"
                name="buyfee"
                rules={[{ required: true, message: 'Please input buy fee' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Trading Mode"
                name="model"
                rules={[{ required: true, message: 'Please select trading mode' }]}
              >
                <Select disabled={status.running}>
                  <Option value={0}>Mode 0 (Normal)</Option>
                  <Option value={1}>Mode 1 (DeFi Priority -1 tick)</Option>
                  <Option value={2}>Mode 2 (DeFi Priority -2 ticks)</Option>
                  <Option value={3}>Mode 3 (CEX Priority)</Option>
                </Select>
              </Form.Item>

              <div></div>

              <Form.Item
                label="Sell Strategy Switch"
                name="sellswitch"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Buy Strategy Switch"
                name="buyswitch"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  disabled={status.running}
                />
              </Form.Item>

              <Form.Item
                label="Balance Check"
                name="check_balance"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Enabled"
                  unCheckedChildren="Disabled"
                  disabled={status.running}
                />
              </Form.Item>
            </div>

            <Divider />

            <Space>
              {!status.running ? (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStart}
                  loading={loading}
                  size="large"
                >
                  Start Bot
                </Button>
              ) : (
                <Button
                  danger
                  icon={<PauseCircleOutlined />}
                  onClick={handleStop}
                  loading={loading}
                  size="large"
                >
                  Stop Bot
                </Button>
              )}
            </Space>
          </Form>
        </Card>

        {/* Manual Order Panel */}
        <Card type="inner" title="Manual SBTC/STX Order" style={{ marginTop: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="Manual Trading"
              description="Submit manual SBTC/STX swap orders. Position 0 = Sell SBTC for STX, Position 1 = Buy SBTC with STX"
              type="info"
              showIcon
            />
            <Space>
              <InputNumber
                placeholder="Amount"
                min={0.001}
                step={0.01}
                style={{ width: 200 }}
                id="manual-order-amount"
              />
              <Button
                type="primary"
                loading={orderLoading}
                onClick={() => {
                  const amountInput = document.getElementById('manual-order-amount') as HTMLInputElement;
                  const amount = parseFloat(amountInput?.value || '0');
                  if (amount > 0) {
                    handleManualOrder(amount, 0);
                  } else {
                    message.warning('Please enter a valid amount');
                  }
                }}
              >
                Sell SBTC (Position 0)
              </Button>
              <Button
                loading={orderLoading}
                onClick={() => {
                  const amountInput = document.getElementById('manual-order-amount') as HTMLInputElement;
                  const amount = parseFloat(amountInput?.value || '0');
                  if (amount > 0) {
                    handleManualOrder(amount, 1);
                  } else {
                    message.warning('Please enter a valid amount');
                  }
                }}
              >
                Buy SBTC (Position 1)
              </Button>
            </Space>
          </Space>
        </Card>

        {/* Order Pressing Panel */}
        <Card 
          type="inner" 
          title={
            <Space>
              <span>Rapid Order Pressing (压单)</span>
              {pressingEnabled && <Tag color="red">ACTIVE</Tag>}
            </Space>
          } 
          style={{ marginTop: 16 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="⚠️ Security Notice"
              description="Order pressing will auto-disable after ONE successful submission to prevent mass trading attacks. You must manually enable it again for the next use. Use with caution due to network and RPC load."
              type="warning"
              showIcon
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>Amount:</label>
                <InputNumber
                  value={pressingAmount}
                  onChange={(value) => setPressingAmount(value || 0.01)}
                  min={0.001}
                  step={0.01}
                  style={{ width: '100%' }}
                  disabled={pressingEnabled}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>Interval (milliseconds):</label>
                <Select
                  value={pressingInterval}
                  onChange={setPressingInterval}
                  style={{ width: '100%' }}
                  disabled={pressingEnabled}
                >
                  <Option value={100}>100ms (Very Fast - High Load)</Option>
                  <Option value={200}>200ms (Fast - Medium Load)</Option>
                  <Option value={500}>500ms (Moderate)</Option>
                  <Option value={1000}>1000ms (1 second)</Option>
                  <Option value={2000}>2000ms (2 seconds)</Option>
                </Select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>Position:</label>
                <Select
                  value={pressingPosition}
                  onChange={setPressingPosition}
                  style={{ width: '100%' }}
                  disabled={pressingEnabled}
                >
                  <Option value={0}>Position 0 (Sell SBTC)</Option>
                  <Option value={1}>Position 1 (Buy SBTC)</Option>
                </Select>
              </div>
            </div>

            <Divider />

            <Space>
              {!pressingEnabled ? (
                <Button
                  type="primary"
                  danger
                  onClick={startOrderPressing}
                  icon={<PlayCircleOutlined />}
                  size="large"
                >
                  Start Order Pressing
                </Button>
              ) : (
                <Button
                  danger
                  onClick={stopOrderPressing}
                  icon={<PauseCircleOutlined />}
                  size="large"
                >
                  Stop Order Pressing
                </Button>
              )}
            </Space>
            
            {pressingEnabled && (
              <Alert
                message="Order Pressing Active"
                description={`Submitting ${pressingPosition === 0 ? 'SELL' : 'BUY'} orders every ${pressingInterval}ms. Will auto-disable after first successful submission.`}
                type="error"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Space>
        </Card>

        {/* Documentation */}
        <Card type="inner" title="Usage Guide" style={{ marginTop: 16 }}>
          <h4>Configuration Parameters:</h4>
          <ul>
            <li><strong>Sell Amount:</strong> Amount of SBTC to sell per trade</li>
            <li><strong>Buy Amount:</strong> Amount of STX to use for buying SBTC</li>
            <li><strong>Profit Margins:</strong> Expected profit percentage for each direction</li>
            <li><strong>Fees:</strong> Trading fees to consider in calculations</li>
            <li><strong>Trading Modes:</strong>
              <ul>
                <li>Mode 0: Normal operation</li>
                <li>Mode 1-2: DeFi Priority (submit DEX transactions early)</li>
                <li>Mode 3: CEX Priority (place CEX orders first)</li>
              </ul>
            </li>
            <li><strong>Strategy Switches:</strong> Enable/disable buy or sell strategies independently</li>
            <li><strong>Balance Check:</strong> Verify sufficient balance before trading</li>
          </ul>
        </Card>
      </Card>
    </div>
  );
};

export default SbtcMakerGun;
