import axios from 'axios';

// Stacks 公共API基础URL - 使用 Hiro API (免费)
const STACKS_API_BASE = 'https://api.mainnet.hiro.so';

export interface StacksTransaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height: number;
  burn_block_time: number;
  sender_address: string;
  fee_rate: string;
  nonce: number;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_args?: unknown[];
  };
  token_transfer?: {
    recipient_address: string;
    amount: string;
    memo: string;
  };
}

export interface StacksTransactionResponse {
  limit: number;
  offset: number;
  total: number;
  results: StacksTransaction[];
}

/**
 * 获取最新的 Stacks 交易
 * @param limit 每页数量
 * @param offset 偏移量
 */
export const getStacksTransactions = async (
  limit: number = 20,
  offset: number = 0
): Promise<StacksTransactionResponse> => {
  try {
    const response = await axios.get(`${STACKS_API_BASE}/extended/v1/tx`, {
      params: {
        limit,
        offset,
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    console.error('获取 Stacks 交易失败:', error);
    throw error;
  }
};

/**
 * 获取特定地址的交易
 * @param address 地址
 * @param limit 每页数量
 * @param offset 偏移量
 */
export const getAddressTransactions = async (
  address: string,
  limit: number = 20,
  offset: number = 0
): Promise<StacksTransactionResponse> => {
  try {
    const response = await axios.get(
      `${STACKS_API_BASE}/extended/v1/address/${address}/transactions`,
      {
        params: {
          limit,
          offset,
        },
        timeout: 15000,
      }
    );
    return response.data;
  } catch (error) {
    console.error('获取地址交易失败:', error);
    throw error;
  }
};

/**
 * 解析交易类型为中文
 */
export const parseStacksTransactionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    token_transfer: '代币转账',
    contract_call: '合约调用',
    smart_contract: '智能合约',
    coinbase: 'Coinbase',
    poison_microblock: '毒微块',
    tenure_change: '任期变更',
  };
  return typeMap[type] || type;
};

/**
 * 解析交易状态为中文
 */
export const parseStacksTransactionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    success: '成功',
    pending: '待处理',
    abort_by_response: '响应中止',
    abort_by_post_condition: '后置条件中止',
  };
  return statusMap[status] || status;
};

/**
 * 格式化地址
 */
export const formatStacksAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

/**
 * 格式化时间戳
 */
export const formatStacksTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 解析合约调用平台
 */
export const parseContractPlatform = (contractId: string): string => {
  if (!contractId) return '未知';
  
  // 常见的 Stacks DeFi 平台合约
  const platformMap: Record<string, string> = {
    'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko': 'Arkadiko',
    'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex': 'ALEX',
    'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap': 'Stackswap',
    'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.wrapped-stx': 'STX包装',
    'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin': 'xBTC',
  };
  
  for (const [key, value] of Object.entries(platformMap)) {
    if (contractId.includes(key)) {
      return value;
    }
  }
  
  // 提取合约名称
  const parts = contractId.split('.');
  if (parts.length > 1) {
    return parts[1].slice(0, 20);
  }
  
  return '其他平台';
};

/**
 * 格式化 STX 金额 (从微 STX 转换)
 */
export const formatSTXAmount = (amount: string | number): string => {
  const amountNum = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  return (amountNum / 1000000).toFixed(6);
};