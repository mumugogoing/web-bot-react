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
  xykfetchdy,
  xykfetchdx,
  createCexOrder,
  checkTxStatusApi,
  xykSerialize,
  checkAddressPendingTx
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
  // @ts-ignore - Unused state variable
  const [balanceData, setBalanceData] = useState<any>(null);
  
  // 压单功能状态
  const [orderPressingEnabled, setOrderPressingEnabled] = useState(false);
  const [monitorAddress, setMonitorAddress] = useState('');
  const [pendingTxDetected, setPendingTxDetected] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState('');
  const [orderPressingLog, setOrderPressingLog] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // 防止重复提交
  
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

  // DOG/SBTC 交易对
  const [dogSbtcForm1, setDogSbtcForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wdog',  // DOG合约地址
    dy: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',  // SBTC合约地址
    su: 'sell',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  const [dogSbtcForm2, setDogSbtcForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wdog',
    dy: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    su: 'buy',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  // ALEX/STX 交易对
  const [alexStxForm1, setAlexStxForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',  // ALEX合约地址
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'sell',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  const [alexStxForm2, setAlexStxForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'buy',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  // ABTC/SUSDT 交易对
  const [abtcSusdtForm1, setAbtcSusdtForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',  // ABTC合约地址
    dy: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt',  // SUSDT合约地址
    su: 'sell',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  const [abtcSusdtForm2, setAbtcSusdtForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
    dy: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt',
    su: 'buy',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  // AEUSDC/USDA 交易对
  const [aeusdcUsdaForm1, setAeusdcUsdaForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    dy: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',  // USDA合约地址
    su: 'sell',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  const [aeusdcUsdaForm2, setAeusdcUsdaForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    dy: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
    su: 'buy',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  // USDA/STX 交易对
  const [usdaStxForm1, setUsdaStxForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'sell',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  const [usdaStxForm2, setUsdaStxForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'buy',
    fee: '0.1211',
    mindy: '0',
    profit: 1,
    txId: '',
    txStatus: ''
  });

  // 转账表单
  // @ts-ignore - Unused state variable
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
  // @ts-ignore - Unused constant
  const tokenOptions = [
    { name: 'stx', address: 'stx.1000', balance: '1000' },
    { name: 'alex', address: 'alex.10000', balance: '10000' }
  ];

  // 交易所选项
  // @ts-ignore - Unused constant
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

  // 监控pending交易并自动提交
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (orderPressingEnabled && monitorAddress) {
      const checkPendingTx = async () => {
        try {
          const currentTime = new Date().toLocaleTimeString('zh-CN');
          setLastCheckedTime(currentTime);
          
          const response: any = await checkAddressPendingTx(monitorAddress);
          
          if (response?.data?.hasPending) {
            setPendingTxDetected(true);
            
            // 防止重复提交
            if (!isSubmitting) {
              const logMessage = `${currentTime} - 检测到pending交易，自动提交xykserialize`;
              setOrderPressingLog(prev => [logMessage, ...prev].slice(0, 10));
              
              // 自动提交xykserialize交易
              await handleAutoSubmitXykSerialize();
            }
          } else {
            setPendingTxDetected(false);
          }
        } catch (error: any) {
          const currentTime = new Date().toLocaleTimeString('zh-CN');
          const errorMessage = `${currentTime} - 监控错误: ${error.message || '未知错误'}`;
          setOrderPressingLog(prev => [errorMessage, ...prev].slice(0, 10));
        }
      };
      
      // 立即检查一次
      checkPendingTx();
      
      // 每2秒检查一次
      intervalId = setInterval(() => {
        checkPendingTx();
      }, 2000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [orderPressingEnabled, monitorAddress, isSubmitting]);

  // 自动提交xykserialize
  const handleAutoSubmitXykSerialize = async () => {
    // 防止并发提交
    if (isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 参数验证
      if (!xykForm1.amount || !xykForm1.dx || !xykForm1.dy || !xykForm1.fee) {
        const currentTime = new Date().toLocaleTimeString('zh-CN');
        const errorMessage = `${currentTime} - 参数验证失败: 交易参数不完整`;
        setOrderPressingLog(prev => [errorMessage, ...prev].slice(0, 10));
        message.error('交易参数不完整，请检查STX/AEUSDC交易表单');
        return;
      }
      
      if (!xykForm1.mindy || xykForm1.mindy === '0') {
        const currentTime = new Date().toLocaleTimeString('zh-CN');
        const errorMessage = `${currentTime} - 参数验证失败: 请先获取最小获取数量`;
        setOrderPressingLog(prev => [errorMessage, ...prev].slice(0, 10));
        message.error('请先获取dy值再启用压单功能');
        return;
      }
      
      const params = {
        amount: String(xykForm1.amount),
        dx: xykForm1.dx,
        dy: xykForm1.dy,
        fee: xykForm1.fee,
        quote: String(xykForm1.mindy)
      };
      
      const response = await xykSerialize(params);
      const currentTime = new Date().toLocaleTimeString('zh-CN');
      const successMessage = `${currentTime} - xykserialize提交成功`;
      setOrderPressingLog(prev => [successMessage, ...prev].slice(0, 10));
      message.success('自动提交xykserialize成功');
      
      return response;
    } catch (error: any) {
      const currentTime = new Date().toLocaleTimeString('zh-CN');
      const errorMessage = `${currentTime} - xykserialize提交失败: ${error.message || '未知错误'}`;
      setOrderPressingLog(prev => [errorMessage, ...prev].slice(0, 10));
      message.error('自动提交xykserialize失败: ' + (error.message || '未知错误'));
    } finally {
      // 3秒后允许再次提交，防止过于频繁
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }
  };

  // 组件挂载时获取初始数据 - 已禁用自动加载以防止网络消耗
  // useEffect(() => {
  //   fetchSumData();
  // }, []);

  // 获取dy值
  const handleGetDy = async (row: DataType, setRow: React.Dispatch<React.SetStateAction<DataType>>) => {
    try {
      setRow(prev => ({ ...prev, txStatus: '', txId: '' }));
      
      const response: any = await xykfetchdy({
        amount: String(row.amount),
        dx: row.dx,
        dy: row.dy,
        fee: row.fee
      });

      if (response && response.data) {
        let quote: any;
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
      
      const response: any = await xykfetchdx({
        amount: String(row.amount),
        dx: row.dx,
        dy: row.dy,
        fee: row.fee
      });

      if (response && response.data) {
        let quote: any;
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
  // @ts-ignore - Unused function
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
  const createTradeColumns = (
    form1: DataType, 
    setForm1: React.Dispatch<React.SetStateAction<DataType>>,
    form2: DataType,
    setForm2: React.Dispatch<React.SetStateAction<DataType>>,
    pairName: string
  ): ColumnsType<DataType> => [
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: any, _record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            if (index === 0) {
              setForm1(prev => ({ ...prev, amount: e.target.value }));
            } else {
              setForm2(prev => ({ ...prev, amount: e.target.value }));
            }
          }}
        />
      )
    },
    {
      title: '最小获取',
      dataIndex: 'mindy',
      key: 'mindy',
      render: (text: any, _record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            if (index === 0) {
              setForm1(prev => ({ ...prev, mindy: e.target.value }));
            } else {
              setForm2(prev => ({ ...prev, mindy: e.target.value }));
            }
          }}
        />
      )
    },
    {
      title: '费率',
      dataIndex: 'fee',
      key: 'fee',
      render: (text: any, _record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            if (index === 0) {
              setForm1(prev => ({ ...prev, fee: e.target.value }));
            } else {
              setForm2(prev => ({ ...prev, fee: e.target.value }));
            }
          }}
        />
      )
    },
    {
      title: '方向',
      key: 'direction',
      render: (_text: any, _record: DataType, index: number) => (
        <Tag color={index === 0 ? 'green' : 'orange'}>
          {index === 0 ? 'sell' : 'buy'}
        </Tag>
      )
    },
    {
      title: 'tx状态',
      key: 'txStatus',
      render: (_text: any, record: DataType, index: number) => (
        <Button 
          type="link"
          onClick={() => {
            if (index === 0) {
              checkTxStatus(form1, setForm1);
            } else {
              checkTxStatus(form2, setForm2);
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
      render: (_text: any, _record: DataType, index: number) => (
        <Button
          type="primary"
          onClick={() => {
            if (index === 0) {
              handleGetDy(form1, setForm1);
            } else {
              handleGetDx(form2, setForm2);
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
      render: (_text: any, _record: DataType, index: number) => (
        <Button
          type="primary"
          onClick={() => {
            if (index === 0) {
              confirmAndTrade(form1, 'sell', setForm1);
            } else {
              confirmAndTrade(form2, 'buy', setForm2);
            }
          }}
        >
          {index === 0 ? `${pairName.split('/')[0]}=>${pairName.split('/')[1]}` : `${pairName.split('/')[1]}=>${pairName.split('/')[0]}`}
        </Button>
      )
    },
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      render: (text: any, _record: DataType, index: number) => (
        <Input 
          value={text}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (index === 0) {
              setForm1(prev => ({ ...prev, profit: value }));
            } else {
              setForm2(prev => ({ ...prev, profit: value }));
            }
          }}
        />
      )
    },
    {
      title: 'CEX挂单',
      key: 'cexOrder',
      render: (_text: any, _record: DataType, index: number) => (
        <Button
          type="primary"
          onClick={() => {
            if (index === 0) {
              handleCreateCexOrder(form1, 0);
            } else {
              handleCreateCexOrder(form2, 1);
            }
          }}
        >
          {index === 0 ? `${pairName.split('/')[1]}=>${pairName.split('/')[0]}` : `${pairName.split('/')[0]}=>${pairName.split('/')[1]}`}
        </Button>
      )
    },
    {
      title: '平台',
      key: 'platform',
      render: () => <span>xyk</span>
    }
  ];

  // 交易表格列定义 - STX/AEUSDC
  const tradeColumns: ColumnsType<DataType> = createTradeColumns(xykForm1, setXykForm1, xykForm2, setXykForm2, 'STX/AEUSDC');

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

      {/* 压单功能控制面板 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>STX/AEUSDC 压单功能</div>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Switch 
              checked={orderPressingEnabled}
              onChange={(checked) => {
                if (checked && !monitorAddress) {
                  message.warning('请先输入要监控的地址');
                  return;
                }
                if (checked && (!xykForm1.mindy || xykForm1.mindy === '0')) {
                  message.warning('请先在STX/AEUSDC交易表单中获取dy值');
                  return;
                }
                setOrderPressingEnabled(checked);
              }}
              checkedChildren="压单开启"
              unCheckedChildren="压单关闭"
            />
            <Input
              placeholder="输入要监控的Stacks地址"
              value={monitorAddress}
              onChange={(e) => setMonitorAddress(e.target.value)}
              style={{ width: '400px' }}
            />
            <Tag color={pendingTxDetected ? 'red' : 'green'}>
              {pendingTxDetected ? 'Pending交易检测中' : '无Pending交易'}
            </Tag>
            {isSubmitting && (
              <Tag color="blue">提交中...</Tag>
            )}
            {lastCheckedTime && (
              <span style={{ fontSize: '12px', color: '#666' }}>
                最后检查: {lastCheckedTime}
              </span>
            )}
          </div>
          
          {orderPressingLog.length > 0 && (
            <Card size="small" title="监控日志" style={{ marginTop: '10px' }}>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {orderPressingLog.map((log, index) => (
                  <div key={index} style={{ padding: '4px 0', fontSize: '12px', color: log.includes('错误') || log.includes('失败') ? '#ff4d4f' : '#666' }}>
                    {log}
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            <div style={{ color: '#ff4d4f', marginBottom: '5px' }}>
              ⚠️ 重要提示：开启前请确保已在下方STX/AEUSDC交易表单中设置好金额、费率并获取dy值
            </div>
            <div>
              说明：开启压单功能后，系统将每2秒检查一次指定地址的pending交易状态。
              一旦检测到pending交易，将自动使用当前表单参数提交xykserialize交易。
              为防止重复提交，每次提交后会有3秒冷却时间。
            </div>
          </div>
        </Space>
      </Card>

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

      {/* DOG/SBTC 交易对 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>DOG / SBTC</div>
        <Table
          dataSource={[dogSbtcForm1, dogSbtcForm2]}
          columns={createTradeColumns(dogSbtcForm1, setDogSbtcForm1, dogSbtcForm2, setDogSbtcForm2, 'DOG/SBTC')}
          pagination={false}
          bordered
        />
      </Card>

      {/* ALEX/STX 交易对 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>ALEX / STX</div>
        <Table
          dataSource={[alexStxForm1, alexStxForm2]}
          columns={createTradeColumns(alexStxForm1, setAlexStxForm1, alexStxForm2, setAlexStxForm2, 'ALEX/STX')}
          pagination={false}
          bordered
        />
      </Card>

      {/* ABTC/SUSDT 交易对 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>ABTC / SUSDT</div>
        <Table
          dataSource={[abtcSusdtForm1, abtcSusdtForm2]}
          columns={createTradeColumns(abtcSusdtForm1, setAbtcSusdtForm1, abtcSusdtForm2, setAbtcSusdtForm2, 'ABTC/SUSDT')}
          pagination={false}
          bordered
        />
      </Card>

      {/* AEUSDC/USDA 交易对 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>AEUSDC / USDA</div>
        <Table
          dataSource={[aeusdcUsdaForm1, aeusdcUsdaForm2]}
          columns={createTradeColumns(aeusdcUsdaForm1, setAeusdcUsdaForm1, aeusdcUsdaForm2, setAeusdcUsdaForm2, 'AEUSDC/USDA')}
          pagination={false}
          bordered
        />
      </Card>

      {/* USDA/STX 交易对 */}
      <Card style={{ marginTop: '20px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>USDA / STX</div>
        <Table
          dataSource={[usdaStxForm1, usdaStxForm2]}
          columns={createTradeColumns(usdaStxForm1, setUsdaStxForm1, usdaStxForm2, setUsdaStxForm2, 'USDA/STX')}
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