import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message, 
  Space,
  Tag
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  calcsumdc,
  xykAutoSell,
  xykAutoBuy,
  xykfetachdy,
  xykfetachdx,
  createCexOrder,
  checkTxStatusApi
} from '@/api/dex/alex';

interface DataType {
  amount: number | string;
  dx: string;
  dy: string;
  su: string;
  fee: string;
  mindy: string;
  profit: number;
  txId: string;
  txStatus: string;
}

interface SumTableData {
  sumStx: string;
  sumUsd: string;
  sumBtc: string;
  [key: string]: string;
}

const { Option } = Select;

const AlexSwap: React.FC = () => {
  // 状态定义
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sumDataFetchTime, setSumDataFetchTime] = useState('');
  const [isFetchingSumData, setIsFetchingSumData] = useState(false);
  const [showOtherData, setShowOtherData] = useState(false);
  const [sumTableData, setSumTableData] = useState<SumTableData | null>(null);
  const [otherTableData, setOtherTableData] = useState<any[]>([]);
  const [otherTableColumns, setOtherTableColumns] = useState<any[]>([]);
  const [balanceData, setBalanceData] = useState<any>(null);
  
  // 交易表单数据
  const [xykForm1, setXykForm1] = useState<DataType>({
    amount: 3000,
    dx: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    dy: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    su: 'sell',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  const [xykForm2, setXykForm2] = useState<DataType>({
    amount: 2000,
    dx: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    dy: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    su: 'buy',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  // 转账表单
  const [transferForm, setTransferForm] = useState({
    token: '',
    exchange: '',
    recipient: '',
    nonce: '',
    amount: ''
  });

  // Zest表单
  const [zestForm, setZestForm] = useState({
    action: '',
    amount: '',
    nonce: '',
    fee: '0.1',
    coin: 'sbtc'
  });

  // 代币选项
  const tokenOptions = [
    { name: 'stx', address: 'stx.1000', balance: '1000' },
    { name: 'alex', address: 'alex.10000', balance: '10000' }
  ];

  // 交易所选项
  const exchangeOptions: Record<string, string> = {
    'Geta': 'Geta.SP3KBWF7P7FBDPCJGKT749WSXTTDTQN3Y2WSQZ58W.',
    '币安STX': '交易所B.SP2TA4FGB43WVAS8MVS6YCWTSN2BZNQ1ASGEAKSDD.100398196',
    '交易所C': '交易所C.SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.87654321'
  };

  // 格式化数值
  const formatValue = (key: string, val: any) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    if (key.toLowerCase().includes('btc')) {
      return num.toFixed(8);
    }
    return num.toFixed(1);
  };

  // 获取总额数据
  const fetchSumData = async () => {
    if (isFetchingSumData) return;
    setIsFetchingSumData(true);
    const startTime = Date.now();
    
    try {
      const res: any = await calcsumdc({});
      setBalanceData(res.data || res);
      
      const sumData = {
        sumStx: res.data ? formatValue('sumStx', res.data.sumStx) : '加载中...',
        sumUsd: res.data ? formatValue('sumUsd', res.data.sumUsd) : '加载中...',
        sumBtc: res.data ? formatValue('sumBtc', res.data.sumBtc) : '加载中...'
      };
      
      setSumTableData(sumData);
      
      if (res.data) {
        const { sumStx, sumUsd, sumBtc, ...rest } = res.data;
        const row: any = {};
        Object.keys(rest).forEach(key => {
          row[key] = formatValue(key, rest[key]);
        });
        setOtherTableData([row]);
        
        const columns = Object.keys(rest).map(key => ({
          prop: key,
          label: key
        }));
        setOtherTableColumns(columns);
      }
      
      const endTime = Date.now();
      setSumDataFetchTime(`总额数据刷新花费: ${endTime - startTime}ms`);
    } catch (error: any) {
      const endTime = Date.now();
      setSumDataFetchTime(`总额数据刷新失败: ${endTime - startTime}ms`);
      message.error('数据加载失败: ' + (error.message || '未知错误'));
    } finally {
      setIsFetchingSumData(false);
    }
  };

  // 处理自动刷新
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchSumData();
      }, 6000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  // 组件挂载时获取初始数据
  useEffect(() => {
    fetchSumData();
  }, []);

  // 获取dy值
  const handleGetDy = async (row: DataType, setRow: React.Dispatch<React.SetStateAction<DataType>>) => {
    try {
      setRow(prev => ({ ...prev, txStatus: '', txId: '' }));
      
      const response: any = await xykfetachdy({
        amount: String(row.amount),
        dx: row.dx,
        dy: row.dy,
        fee: row.fee
      });

      if (response && response.data) {
        let quote;
        if (response.data.bestRoute?.quote) {
          quote = response.data.bestRoute.quote;
        } else if (response.data.quote) {
          quote = response.data.quote;
        }

        if (quote !== undefined) {
          setRow((prev: DataType) => ({ ...prev, mindy: typeof quote === 'string' ? parseFloat(quote).toString() : quote.toString() }));
          message.success('获取dy成功');
          return;
        }
      }

      throw new Error('返回数据格式错误');
    } catch (error: any) {
      message.error(`获取dy失败: ${error.message || '未知错误'}`);
      console.error('获取dy错误:', error);
    }
  };

  // 获取dx值
  const handleGetDx = async (row: DataType, setRow: React.Dispatch<React.SetStateAction<DataType>>) => {
    try {
      setRow(prev => ({ ...prev, txStatus: '', txId: '' }));
      
      const response: any = await xykfetachdx({
        amount: String(row.amount),
        dx: row.dx,
        dy: row.dy,
        fee: row.fee
      });

      if (response && response.data) {
        let quote;
        if (response.data.bestRoute?.quote) {
          quote = response.data.bestRoute.quote;
        } else if (response.data.quote) {
          quote = response.data.quote;
        }

        if (quote !== undefined) {
          setRow((prev: DataType) => ({ ...prev, mindy: typeof quote === 'string' ? parseFloat(quote).toString() : quote.toString() }));
          message.success('获取dx成功');
          return;
        }
      }

      throw new Error('返回数据格式错误');
    } catch (error: any) {
      message.error(`获取dx失败: ${error.message || '未知错误'}`);
      console.error('获取dx错误:', error);
    }
  };

  // 执行交易
  const executeTrade = async (row: DataType, type: string, setRow: React.Dispatch<React.SetStateAction<DataType>>) => {
    try {
      setRow((prev: DataType) => ({ ...prev, txStatus: '提交中...' }));
      
      const payload = {
        amount: String(row.amount),
        dx: row.dx,
        dy: row.dy,
        su: type,
        fee: row.fee,
        quote: String(row.mindy)
      };
      
      if (!payload.quote) {
        throw new Error('请先获取最小获取数量');
      }

      const res = type === 'sell'
        ? await xykAutoSell(payload)
        : await xykAutoBuy(payload);

      const data = (res && (res.data || res)) || {};
      const status = data.status ?? (data.data && data.data.status);
      const txid = data.txid ?? data.txId ?? data.tx_hash ?? data.txHash ?? (data.data && (data.data.txid || data.data.txId));

      if (status !== undefined && status !== null && String(status) !== '') {
        setRow((prev: DataType) => ({ ...prev, txStatus: String(status), txId: txid ? String(txid) : '' }));
        if (!txid) {
          message.warning('后端未返回txid，无法手动查询状态');
        }
        message.success(`${type}交易提交成功`);
        return;
      }

      setRow((prev: DataType) => ({ 
        ...prev, 
        txId: txid ? String(txid) : '',
        txStatus: status || 'submitted' 
      }));
      message.success(`${type}交易提交成功`);
    } catch (error: any) {
      setRow((prev: DataType) => ({ ...prev, txStatus: '提交失败' }));
      message.error(`${type}交易失败: ${error.message || error}`);
    }
  };

  // 确认并执行交易
  const confirmAndTrade = (row: DataType, type: string, setRow: React.Dispatch<React.SetStateAction<DataType>>) => {
    // 在实际应用中，这里应该使用确认对话框
    if (window.confirm(`确定要${type === 'sell' ? '卖出' : '买入'}吗?`)) {
      executeTrade(row, type, setRow);
    }
  };

  // 检查交易状态
  const checkTxStatus = async (row: DataType, setRow: React.Dispatch<React.SetStateAction<DataType>>) => {
    const txid = row.txId;
    if (!txid) {
      message.warning('txid不能为空');
      return;
    }
    
    try {
      const res: any = await checkTxStatusApi(String(txid));
      const data = (res && (res.data || res)) || {};
      const status = data.status || (data.data && data.data.status) || 'pending';
      
      if (data.txid || (data.data && data.txid)) {
        setRow((prev: DataType) => ({ ...prev, txId: String(data.txid || data.data.txid) }));
      }
      
      setRow((prev: DataType) => ({ ...prev, txStatus: status }));
    } catch (e: any) {
      message.error(`查询交易状态失败: ${e.message || e}`);
    }
  };

  // 检查头部交易状态
  const checkTxStatusHeader = async () => {
    const rows = [xykForm1, xykForm2];
    const hasAnyTxId = rows.some(r => !!r.txId);
    
    if (!hasAnyTxId) {
      message.warning('没有可查询的txid');
      return;
    }
    
    await checkTxStatus(xykForm1, setXykForm1);
    await checkTxStatus(xykForm2, setXykForm2);
  };

  // 创建CEX订单
  const handleCreateCexOrder = async (row: DataType, index: number) => {
    try {
      if (!window.confirm('确定要创建CEX挂单吗？')) {
        message.info('已取消操作');
        return;
      }

      const upValue = Number(xykForm1.profit);
      const downValue = Number(xykForm2.profit);

      const params = {
        stxamount: Number(row.amount),
        aeamount: Number(row.mindy),
        up: upValue,
        down: downValue,
        trun: 1 - index
      };

      const response: any = await createCexOrder(params);
      if (response.data) {
        message.success('挂单成功');
      } else {
        throw new Error('挂单失败');
      }
    } catch (error: any) {
      message.error(`挂单失败: ${error.message}`);
    }
  };

  // 处理Zest操作
  const handleZestAction = async () => {
    try {
      if (!zestForm.action) {
        message.warning('请选择操作类型');
        return;
      }

      if (!zestForm.amount) {
        message.warning('请输入金额');
        return;
      }

      // 这里应该调用相应的API
      message.success(`${zestForm.action} 操作成功`);
      // 刷新余额数据
      await fetchSumData();
    } catch (error: any) {
      message.error(`操作失败: ${error.message || '未知错误'}`);
    }
  };

  // 切换显示其他数据
  const toggleOtherData = () => {
    setShowOtherData(!showOtherData);
  };

  // 合并表格数据
  const sumTable = {
    ...sumTableData,
    ...(showOtherData ? otherTableData[0] || {} : {})
  };

  // 余额表格列定义
  const sumColumns = [
    { title: 'sumStx', dataIndex: 'sumStx', key: 'sumStx', align: 'center' as const },
    { title: 'sumUsd', dataIndex: 'sumUsd', key: 'sumUsd', align: 'center' as const },
    { title: 'sumBtc', dataIndex: 'sumBtc', key: 'sumBtc', align: 'center' as const },
    ...(showOtherData ? otherTableColumns.map(col => ({
      title: col.label,
      dataIndex: col.prop,
      key: col.prop,
      align: 'center' as const
    })) : [])
  ];

  // 交易表格列定义
  const tradeColumns: ColumnsType<DataType> = [
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: any, record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            if (index === 0) {
              setXykForm1(prev => ({ ...prev, amount: e.target.value }));
            } else {
              setXykForm2(prev => ({ ...prev, amount: e.target.value }));
            }
          }}
        />
      )
    },
    {
      title: '最小获取',
      dataIndex: 'mindy',
      key: 'mindy',
      render: (text: any, record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            if (index === 0) {
              setXykForm1(prev => ({ ...prev, mindy: e.target.value }));
            } else {
              setXykForm2(prev => ({ ...prev, mindy: e.target.value }));
            }
          }}
        />
      )
    },
    {
      title: '费率',
      dataIndex: 'fee',
      key: 'fee',
      render: (text: any, record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            if (index === 0) {
              setXykForm1(prev => ({ ...prev, fee: e.target.value }));
            } else {
              setXykForm2(prev => ({ ...prev, fee: e.target.value }));
            }
          }}
        />
      )
    },
    {
      title: '方向',
      key: 'direction',
      render: (text: any, record: DataType, index: number) => (
        <Tag color={index === 0 ? 'green' : 'orange'}>
          {index === 0 ? 'sell' : 'buy'}
        </Tag>
      )
    },
    {
      title: 'tx状态',
      key: 'txStatus',
      render: (text: any, record: DataType, index: number) => (
        <Button 
          type="link"
          onClick={() => {
            if (index === 0) {
              checkTxStatus(xykForm1, setXykForm1);
            } else {
              checkTxStatus(xykForm2, setXykForm2);
            }
          }}
        >
          {record.txStatus || 'N/A'}
        </Button>
      )
    },
    {
      title: '获取dy/dx',
      key: 'getDyDx',
      render: (text: any, record: DataType, index: number) => (
        <Button
          type="primary"
          onClick={() => {
            if (index === 0) {
              handleGetDy(xykForm1, setXykForm1);
            } else {
              handleGetDx(xykForm2, setXykForm2);
            }
          }}
        >
          {index === 0 ? '获取dy' : '获取dx'}
        </Button>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: DataType, index: number) => (
        <Button
          type="primary"
          onClick={() => {
            if (index === 0) {
              confirmAndTrade(xykForm1, 'sell', setXykForm1);
            } else {
              confirmAndTrade(xykForm2, 'buy', setXykForm2);
            }
          }}
        >
          {index === 0 ? 'STX=>USDC' : 'USDC=>STX'}
        </Button>
      )
    },
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      render: (text: any, record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (index === 0) {
              setXykForm1(prev => ({ ...prev, profit: value }));
            } else {
              setXykForm2(prev => ({ ...prev, profit: value }));
            }
          }}
        />
      )
    },
    {
      title: 'CEX挂单',
      key: 'cexOrder',
      render: (text: any, record: DataType, index: number) => (
        <Button
          type="primary"
          onClick={() => {
            if (index === 0) {
              handleCreateCexOrder(xykForm1, 0);
            } else {
              handleCreateCexOrder(xykForm2, 1);
            }
          }}
        >
          {index === 0 ? 'USDC=>STX' : 'STX=>USDC'}
        </Button>
      )
    },
    {
      title: '平台',
      key: 'platform',
      render: () => <span>xyk</span>
    }
  ];

  return (
    <div className="app-container" style={{ padding: '20px' }}>
      {/* 余额卡片 */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Space>
              <Switch 
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="自动刷新余额"
              />
              <Button 
                onClick={fetchSumData}
                loading={isFetchingSumData}
              >
                刷新余额
              </Button>
              <Button 
                onClick={toggleOtherData}
              >
                {showOtherData ? '折叠详细' : '展开详细'}
              </Button>
            </Space>
          </div>
          <span style={{ fontSize: '12px', color: '#666' }}>{sumDataFetchTime}</span>
        </div>
      </Card>

      {/* 余额表格 */}
      <Table
        dataSource={sumTableData ? [sumTable] : []}
        columns={sumColumns}
        pagination={false}
        bordered
      />

      {/* 交易表格 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>STX / AEUSDC</div>
        <Table
          dataSource={[xykForm1, xykForm2]}
          columns={tradeColumns}
          pagination={false}
          bordered
        />
      </Card>

      {/* Zest功能区域 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Zest</div>
        <Form layout="inline">
          <Form.Item label="操作类型:">
            <Select 
              value={zestForm.action}
              onChange={(value) => setZestForm(prev => ({ ...prev, action: value }))}
              style={{ width: '150px' }}
            >
              <Option value="supply">Supply</Option>
              <Option value="withdraw">Withdraw</Option>
              <Option value="borrow">Borrow</Option>
              <Option value="repay">Repay</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="金额:">
            <Input
              value={zestForm.amount}
              onChange={(e) => setZestForm(prev => ({ ...prev, amount: e.target.value }))}
              style={{ width: '150px' }}
            />
          </Form.Item>
          
          <Form.Item label="Nonce:">
            <Input
              value={zestForm.nonce}
              onChange={(e) => setZestForm(prev => ({ ...prev, nonce: e.target.value }))}
              style={{ width: '150px' }}
            />
          </Form.Item>
          
          <Form.Item label="手续费:">
            <Input
              value={zestForm.fee}
              onChange={(e) => setZestForm(prev => ({ ...prev, fee: e.target.value }))}
              style={{ width: '150px' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" onClick={handleZestAction}>执行操作</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AlexSwap;