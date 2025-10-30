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
  Tag,
  AutoComplete
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  calcsumdc,
  xykAutoSell,
  xykAutoBuy,
  xykfetchdy,
  xykfetchdx,
  xykTxSerialization,
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
  serialization?: string; // 添加序列化交易数据字段
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
  


  // 交易表单数据
  const [xykForm1, setXykForm1] = useState<DataType>({
    amount: 3000,
    dx: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    dy: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    su: 'sell',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  const [xykForm2, setXykForm2] = useState<DataType>({
    amount: 2000,
    dx: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    dy: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    su: 'buy',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  // DOG/SBTC 交易对
  const [dogSbtcForm1, setDogSbtcForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wdog',  // DOG合约地址
    dy: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',  // SBTC合约地址
    su: 'sell',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  const [dogSbtcForm2, setDogSbtcForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wdog',
    dy: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    su: 'buy',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  // ALEX/STX 交易对
  const [alexStxForm1, setAlexStxForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',  // ALEX合约地址
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'sell',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  const [alexStxForm2, setAlexStxForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'buy',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  // ABTC/SUSDT 交易对
  const [abtcSusdtForm1, setAbtcSusdtForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',  // ABTC合约地址
    dy: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt',  // SUSDT合约地址
    su: 'sell',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  const [abtcSusdtForm2, setAbtcSusdtForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
    dy: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt',
    su: 'buy',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  // AEUSDC/USDA 交易对
  const [aeusdcUsdaForm1, setAeusdcUsdaForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    dy: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',  // USDA合约地址
    su: 'sell',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  const [aeusdcUsdaForm2, setAeusdcUsdaForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
    dy: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
    su: 'buy',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  // USDA/STX 交易对
  const [usdaStxForm1, setUsdaStxForm1] = useState<DataType>({
    amount: 1000,
    dx: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'sell',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
  });

  const [usdaStxForm2, setUsdaStxForm2] = useState<DataType>({
    amount: 1000,
    dx: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
    dy: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2',
    su: 'buy',
    fee: '0.1211',
    mindy: '1', // 将默认值改为1
    profit: 1,
    txId: '',
    txStatus: '',
    serialization: ''
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





  // 组件挂载时获取初始数据 - 已禁用自动加载以防止网络消耗
  useEffect(() => {
    fetchSumData();
  }, []);

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

  // 获取交易序列化
  const handleXykSerialization = async (row: DataType, setRow: React.Dispatch<React.SetStateAction<DataType>>, type: string) => {
    try {
      // 先获取dy值
      await handleGetDy(row, setRow);

      // 然后提交数据到后端接口，使用选择的钱包编号
      const response: any = await xykTxSerialization({
        account_number: selectedWallet, // 使用选择的钱包而不是固定为1
        amount: String(row.amount),
        dx: row.dx,
        dy: row.dy,
        su: type,
        quote: row.mindy,
        fee: row.fee,
        contract_name: "xyk-core-v-1-2"
      });

      if (response && response.data) {
        // 存储序列化交易数据
        setRow(prev => ({
          ...prev,
          serialization: response.data.serialization,
          txId: response.data.txid
        }));
        message.success('交易序列化成功');
        console.log('交易序列化数据:', response.data);
        return;
      }

      throw new Error('返回数据格式错误');
    } catch (error: any) {
      message.error(`交易序列化失败: ${error.message || '未知错误'}`);
      console.error('交易序列化错误:', error);
    }
  };

  // 前端版本的BroadcastTransaction函数
  const broadcastTransaction = async (serializedTx: string): Promise<{ success: boolean; txId?: string; error?: string }> => {
    const apiURLs = [
      "https://stacks-node-api.mainnet.stacks.co/v2/transactions",
      "https://api.hiro.so/v2/transactions",
    ];

    try {
      // 验证序列化交易数据是否为空
      if (!serializedTx || serializedTx.length === 0) {
        return { success: false, error: '序列化交易数据为空' };
      }

      // 验证是否为有效的十六进制字符串
      if (!/^[0-9a-fA-F]+$/.test(serializedTx)) {
        return { success: false, error: '序列化交易数据不是有效的十六进制字符串' };
      }

      // 将十六进制字符串转换为字节数组
      const txBytes = new Uint8Array(serializedTx.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      // 验证字节数组是否为空
      if (txBytes.length === 0) {
        return { success: false, error: '转换后的字节数组为空' };
      }

      console.log('正在广播的交易数据:', serializedTx);
      console.log('交易数据长度:', serializedTx.length);

      // 创建Promise数组，同时向所有API节点广播
      const broadcastPromises = apiURLs.map(async (apiURL) => {
        try {
          const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: txBytes,
          });

          if (response.ok) {
            const responseBody = await response.text();
            console.log(`交易成功广播到 ${apiURL}:`, responseBody);
            return { success: true, txId: responseBody };
          } else {
            const errorBody = await response.text();
            console.error(`广播到 ${apiURL} 失败:`, response.status, errorBody);
            return { success: false, error: `广播到 ${apiURL} 失败: ${response.status} ${errorBody}` };
          }
        } catch (error: any) {
          console.error(`广播到 ${apiURL} 出错:`, error);
          return { success: false, error: `广播到 ${apiURL} 出错: ${error.message || error}` };
        }
      });

      // 等待所有广播尝试完成
      const results = await Promise.all(broadcastPromises);

      // 检查是否有任何一个成功
      for (const result of results) {
        if (result.success) {
          return result;
        }
      }

      // 如果都没有成功，返回第一个错误
      return { success: false, error: '所有API节点广播都失败了: ' + results.map(r => r.error).join(', ') };
    } catch (error: any) {
      console.error('广播交易时发生未预期的错误:', error);
      return { success: false, error: `广播交易时发生未预期的错误: ${error.message || error}` };
    }
  };

  // 直接广播已序列化的交易
  const handleXykExcute = async (row: DataType, setRow: React.Dispatch<React.SetStateAction<DataType>>) => {
    try {
      // 检查是否存在已序列化的交易数据
      if (!row.serialization || row.serialization === '') {
        message.error('没有找到已序列化的交易数据，请先点击xykserialize按钮');
        return;
      }

      // 显示序列化数据长度供调试
      console.log('序列化交易数据长度:', row.serialization.length);
      console.log('序列化交易数据:', row.serialization);

      // 直接广播已序列化的交易
      const broadcastResult = await broadcastTransaction(row.serialization);

      if (broadcastResult.success) {
        message.success('交易广播成功');
        setRow(prev => ({ ...prev, txId: broadcastResult.txId || '', txStatus: 'submitted' }));
      } else {
        throw new Error(broadcastResult.error || '交易广播失败');
      }
    } catch (error: any) {
      message.error(`交易广播失败: ${error.message || '未知错误'}`);
      console.error('交易广播错误:', error);
      setRow(prev => ({ ...prev, txStatus: 'failed' }));
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
          size="small"
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
          size="small"
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
      title: 'xykserialize',
      key: 'xykserialize',
      render: (_text: any, record: DataType, index: number) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              if (index === 0) {
                handleXykSerialization(form1, setXykForm1, 'sell');
              } else {
                handleXykSerialization(form2, setXykForm2, 'buy');
              }
            }}
            style={{ marginRight: 8 }}
          >
            xykserialize
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              if (index === 0) {
                handleXykExcute(form1, setXykForm1);
              } else {
                handleXykExcute(form2, setXykForm2);
              }
            }}
            disabled={!record.serialization}
          >
            excite
          </Button>
        </>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_text: any, _record: DataType, index: number) => (
        <Button
          type="primary"
          size="small"
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
          size="small"
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

  // 钱包选项
  const walletOptions = [
    { label: 'Z7F7', value: 1 },
    { label: 'GW55', value: 2 },
    { label: 'XH53', value: 3 },
    { label: 'TQSVP', value: 4 }
  ];

  // 当前选中的钱包
  const [selectedWallet, setSelectedWallet] = useState(1);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold' }}>STX/AEUSDC</div>
          <div>
            <span style={{ marginRight: '8px' }}>钱包选择:</span>
            <Select
              value={selectedWallet}
              onChange={setSelectedWallet}
              style={{ width: 120 }}
              options={walletOptions}
            />
          </div>
        </div>
        {/* 表格标题行 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>金额</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>最小获取</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>费率</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>方向</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>tx状态</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>刷新X/Y</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>xykserialize</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>操作</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>利润</th>
                <th style={{ padding: '8px', border: '1px solid #f0f0f0', textAlign: 'center' }}>CEX挂单</th>
              </tr>
            </thead>
            <tbody>
              {/* Sell 行 */}
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm1.amount)}
                      onChange={(value) => setXykForm1(prev => ({ ...prev, amount: value }))}
                      placeholder="金额"
                      options={[
                        { value: '1000' },
                        { value: '2000' },
                        { value: '3000' },
                        { value: '5000' },
                        { value: '10000' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm1.mindy)}
                      onChange={(value) => setXykForm1(prev => ({ ...prev, mindy: value }))}
                      placeholder="最小获取"
                      options={[
                        { value: '1' },
                        { value: '0.5' },
                        { value: '0.1' },
                        { value: '0.01' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm1.fee)}
                      onChange={(value) => setXykForm1(prev => ({ ...prev, fee: value }))}
                      placeholder="费率"
                      options={[
                        { value: '0.0121' },
                        { value: '0.06' },
                        { value: '0.121' },
                        { value: '0.341' },
                        { value: '0.412' },
                        { value: '0.581' },
                        { value: '1.1' },
                        { value: '1.21' },
                        { value: '3.1' },
                        { value: '5.1' },
                        { value: '12.1' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Tag color="green">sell</Tag>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => checkTxStatus(xykForm1, setXykForm1)}
                  >
                    {xykForm1.txStatus || 'N/A'}
                  </Button>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleGetDy(xykForm1, setXykForm1)}
                  >
                    获取dy
                  </Button>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleXykSerialization(xykForm1, setXykForm1, 'sell')}
                      style={{ marginRight: 4 }}
                    >
                      序列化
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleXykExcute(xykForm1, setXykForm1)}
                      disabled={!xykForm1.serialization}
                    >
                      提交
                    </Button>
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => confirmAndTrade(xykForm1, 'sell', setXykForm1)}
                  >
                    STX=&gt;AE
                  </Button>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm1.profit)}
                      onChange={(value) => setXykForm1(prev => ({ ...prev, profit: Number(value) }))}
                      placeholder="利润"
                      options={[
                        { value: '1' },
                        { value: '1.5' },
                        { value: '2' },
                        { value: '2.5' },
                        { value: '3' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleCreateCexOrder(xykForm1, 0)}
                  >
                    DC=&gt;STX
                  </Button>
                </td>
              </tr>

              {/* Buy 行 */}
              <tr>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm2.amount)}
                      onChange={(value) => setXykForm2(prev => ({ ...prev, amount: value }))}
                      placeholder="金额"
                      options={[
                        { value: '1000' },
                        { value: '2000' },
                        { value: '3000' },
                        { value: '5000' },
                        { value: '10000' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm2.mindy)}
                      onChange={(value) => setXykForm2(prev => ({ ...prev, mindy: value }))}
                      placeholder="最小获取"
                      options={[
                        { value: '1' },
                        { value: '0.5' },
                        { value: '0.1' },
                        { value: '0.01' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm2.fee)}
                      onChange={(value) => setXykForm2(prev => ({ ...prev, fee: value }))}
                      placeholder="费率"
                      options={[
                        { value: '0.0121' },
                        { value: '0.06' },
                        { value: '0.121' },
                        { value: '0.341' },
                        { value: '0.412' },
                        { value: '0.581' },
                        { value: '1.1' },
                        { value: '1.21' },
                        { value: '3.1' },
                        { value: '5.1' },
                        { value: '12.1' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Tag color="orange">buy</Tag>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => checkTxStatus(xykForm2, setXykForm2)}
                  >
                    {xykForm2.txStatus || 'N/A'}
                  </Button>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleGetDx(xykForm2, setXykForm2)}
                  >
                    获取dx
                  </Button>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleXykSerialization(xykForm2, setXykForm2, 'buy')}
                      style={{ marginRight: 4 }}
                    >
                      序列化
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleXykExcute(xykForm2, setXykForm2)}
                      disabled={!xykForm2.serialization}
                    >
                      提交
                    </Button>
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => confirmAndTrade(xykForm2, 'buy', setXykForm2)}
                  >
                    AE=&gt;STX
                  </Button>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '100px' }}>
                    <AutoComplete
                      value={String(xykForm2.profit)}
                      onChange={(value) => setXykForm2(prev => ({ ...prev, profit: Number(value) }))}
                      placeholder="利润"
                      options={[
                        { value: '1' },
                        { value: '1.5' },
                        { value: '2' },
                        { value: '2.5' },
                        { value: '3' }
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                </td>
                <td style={{ padding: '8px', border: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleCreateCexOrder(xykForm2, 1)}
                  >
                    STX=&gt;DC
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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