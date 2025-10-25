import { getAddressTransactions } from '@/api/stacks';
import { xykAutoSell as xykAutoSellApi, xykAutoBuy as xykAutoBuyApi } from '@/api/dex/alex';
import type { StacksTransaction } from '@/api/stacks';

export interface PressureOrderConfig {
  enabled: boolean;
  monitoredAddresses: string[];
  tradePair: 'STX/AEUSDC' | 'STX/BTC' | 'STX/USDT';
  tradeAmount: number;
  tradeDirection: 'buy' | 'sell' | 'auto';
  maxApiCallsPerMinute: number;
  checkIntervalMs: number;
  dx?: string;
  dy?: string;
  fee?: string;
}

export interface DetectedTransaction {
  txId: string;
  address: string;
  timestamp: string;
  type: string;
  amount?: string;
  autoTradeExecuted: boolean;
  tradeResult?: string;
}

export interface PressureOrderStatus {
  running: boolean;
  monitoredAddresses: string[];
  lastCheckTime: string;
  detectedTransactions: number;
  executedTrades: number;
  currentApiCallRate: number;
  errors: string[];
}

class PressureOrderMonitor {
  private running = false;
  private config: PressureOrderConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private lastSeenTxIds: Set<string> = new Set();
  private detectedTransactions: DetectedTransaction[] = [];
  private executedTrades = 0;
  private apiCallTimestamps: number[] = [];
  private errors: string[] = [];
  private lastCheckTime = '';
  private statusUpdateCallbacks: Array<(status: PressureOrderStatus) => void> = [];
  private transactionCallbacks: Array<(tx: DetectedTransaction) => void> = [];

  constructor(config: PressureOrderConfig) {
    this.config = config;
  }

  public start(): void {
    if (this.running) {
      console.warn('Pressure order monitor is already running');
      return;
    }

    this.running = true;
    this.errors = [];
    console.log('Starting pressure order monitor...', this.config);
    
    // Start monitoring loop
    this.monitorLoop();
  }

  public stop(): void {
    if (!this.running) {
      console.warn('Pressure order monitor is not running');
      return;
    }

    this.running = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    console.log('Pressure order monitor stopped');
    this.notifyStatusUpdate();
  }

  public updateConfig(newConfig: Partial<PressureOrderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Pressure order config updated:', this.config);
  }

  public getStatus(): PressureOrderStatus {
    return {
      running: this.running,
      monitoredAddresses: this.config.monitoredAddresses,
      lastCheckTime: this.lastCheckTime,
      detectedTransactions: this.detectedTransactions.length,
      executedTrades: this.executedTrades,
      currentApiCallRate: this.calculateCurrentApiCallRate(),
      errors: [...this.errors],
    };
  }

  public getDetectedTransactions(limit = 50): DetectedTransaction[] {
    return this.detectedTransactions.slice(0, limit);
  }

  public onStatusUpdate(callback: (status: PressureOrderStatus) => void): void {
    this.statusUpdateCallbacks.push(callback);
  }

  public onTransactionDetected(callback: (tx: DetectedTransaction) => void): void {
    this.transactionCallbacks.push(callback);
  }

  private async monitorLoop(): Promise<void> {
    if (!this.running) return;

    try {
      // Check if we can make API calls based on rate limit
      const canMakeCall = this.checkRateLimit();
      
      if (canMakeCall) {
        await this.checkAddresses();
      } else {
        // Dynamically adjust check interval if hitting rate limits
        const adjustedInterval = this.adjustCheckInterval();
        console.log(`Rate limit approaching, adjusted interval to ${adjustedInterval}ms`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in monitor loop:', errorMsg);
      this.errors.push(`${new Date().toISOString()}: ${errorMsg}`);
      if (this.errors.length > 100) {
        this.errors = this.errors.slice(-50); // Keep last 50 errors
      }
    }

    this.notifyStatusUpdate();

    // Schedule next check
    const interval = this.config.checkIntervalMs || 5000;
    this.intervalId = setTimeout(() => this.monitorLoop(), interval);
  }

  private async checkAddresses(): Promise<void> {
    for (const address of this.config.monitoredAddresses) {
      if (!this.running) break;

      try {
        this.recordApiCall();
        
        // Fetch latest transactions for the address
        const result = await getAddressTransactions(address, 5, 0);
        this.lastCheckTime = new Date().toISOString();

        // Check for new transactions
        for (const tx of result.results) {
          if (!this.lastSeenTxIds.has(tx.tx_id)) {
            this.lastSeenTxIds.add(tx.tx_id);
            
            // Only process successful transactions
            if (tx.tx_status === 'success') {
              await this.handleNewTransaction(tx, address);
            }
          }
        }

        // Clean up old tx IDs to prevent memory growth (keep last 1000)
        if (this.lastSeenTxIds.size > 1000) {
          const txIdsArray = Array.from(this.lastSeenTxIds);
          this.lastSeenTxIds = new Set(txIdsArray.slice(-1000));
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error checking address ${address}:`, errorMsg);
        this.errors.push(`${new Date().toISOString()}: Error checking ${address}: ${errorMsg}`);
      }
    }
  }

  private async handleNewTransaction(tx: StacksTransaction, address: string): Promise<void> {
    console.log('New transaction detected:', tx.tx_id, 'from address:', address);

    const detectedTx: DetectedTransaction = {
      txId: tx.tx_id,
      address: address,
      timestamp: new Date(tx.burn_block_time * 1000).toISOString(),
      type: tx.tx_type,
      amount: tx.token_transfer?.amount,
      autoTradeExecuted: false,
      tradeResult: undefined,
    };

    // Execute auto-trade if enabled
    if (this.config.enabled) {
      try {
        const tradeResult = await this.executeAutoTrade();
        detectedTx.autoTradeExecuted = true;
        detectedTx.tradeResult = tradeResult;
        this.executedTrades++;
        console.log('Auto-trade executed successfully:', tradeResult);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        detectedTx.tradeResult = `Failed: ${errorMsg}`;
        console.error('Auto-trade failed:', errorMsg);
        this.errors.push(`${new Date().toISOString()}: Trade execution failed: ${errorMsg}`);
      }
    }

    // Store the detected transaction
    this.detectedTransactions.unshift(detectedTx);
    if (this.detectedTransactions.length > 200) {
      this.detectedTransactions = this.detectedTransactions.slice(0, 100);
    }

    // Notify listeners
    this.transactionCallbacks.forEach(callback => callback(detectedTx));
  }

  private async executeAutoTrade(): Promise<string> {
    const { tradeDirection, tradeAmount, dx, dy, fee } = this.config;

    // Default STX/AEUSDC pair
    const tradeDx = dx || 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2';
    const tradeDy = dy || 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc';
    const tradeFee = fee || '0.124251';

    const params = {
      amount: tradeAmount,
      dx: tradeDx,
      dy: tradeDy,
      su: tradeDirection === 'sell' ? 's' : 'b',
      fee: tradeFee,
    };

    if (tradeDirection === 'sell' || tradeDirection === 'auto') {
      await xykAutoSellApi(params);
    } else {
      await xykAutoBuyApi(params);
    }

    return `Trade ${tradeDirection} executed for ${tradeAmount} STX`;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove timestamps older than 1 minute
    this.apiCallTimestamps = this.apiCallTimestamps.filter(ts => ts > oneMinuteAgo);

    // Check if we're under the limit
    return this.apiCallTimestamps.length < this.config.maxApiCallsPerMinute;
  }

  private recordApiCall(): void {
    this.apiCallTimestamps.push(Date.now());
  }

  private calculateCurrentApiCallRate(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentCalls = this.apiCallTimestamps.filter(ts => ts > oneMinuteAgo);
    return recentCalls.length;
  }

  private adjustCheckInterval(): number {
    const currentRate = this.calculateCurrentApiCallRate();
    const maxRate = this.config.maxApiCallsPerMinute;
    const usageRatio = currentRate / maxRate;

    // If we're using more than 80% of our rate limit, slow down
    if (usageRatio > 0.8) {
      const newInterval = Math.min(this.config.checkIntervalMs * 1.5, 60000);
      this.config.checkIntervalMs = Math.floor(newInterval);
    }

    return this.config.checkIntervalMs;
  }

  private notifyStatusUpdate(): void {
    const status = this.getStatus();
    this.statusUpdateCallbacks.forEach(callback => callback(status));
  }
}

// Singleton instance
let monitorInstance: PressureOrderMonitor | null = null;

export const getPressureOrderMonitor = (config?: PressureOrderConfig): PressureOrderMonitor => {
  if (!monitorInstance && config) {
    monitorInstance = new PressureOrderMonitor(config);
  } else if (monitorInstance && config) {
    monitorInstance.updateConfig(config);
  }
  
  if (!monitorInstance) {
    throw new Error('Pressure order monitor not initialized. Please provide config.');
  }
  
  return monitorInstance;
};

export const resetPressureOrderMonitor = (): void => {
  if (monitorInstance) {
    monitorInstance.stop();
    monitorInstance = null;
  }
};
