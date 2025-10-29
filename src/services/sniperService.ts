import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

export interface SniperStartRequest {
  targetAddress: string;
  serializedData: string;
}

export interface SniperCheckRequest {
  targetAddress: string;
  serializedData: string;
  timeoutMs?: number;
}

export interface BroadcastResult {
  nodeUrl: string;
  txId: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface SniperStatus {
  isRunning: boolean;
  targetAddress: string;
  detectedCount: number;
  detectedTxIDs: string[];
  broadcastCount: number;
  lastCheckTime: string;
}

export interface SniperResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  detected?: boolean;
  detectedTxIDs?: string[];
  targetTxIDs?: string[];
  broadcastTxIDs?: string[];
  responseTimeMs?: number;
  broadcastCount?: number;
}

// Start continuous monitoring
export const startContinuousSniper = async (
  request: SniperStartRequest
): Promise<SniperResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/sniper/start-continuous`,
    request
  );
  return response.data;
};

// Stop continuous monitoring
export const stopContinuousSniper = async (): Promise<SniperResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/sniper/stop-continuous`
  );
  return response.data;
};

// Get sniper status
export const getSniperStatus = async (): Promise<SniperResponse<SniperStatus>> => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/sniper/status`);
  return response.data;
};

// Perform quick check
export const quickCheckSniper = async (
  request: SniperCheckRequest
): Promise<SniperResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/sniper/quick-check`,
    request
  );
  return response.data;
};

// Perform one-time snipe
export const snipeOnce = async (
  request: SniperStartRequest
): Promise<SniperResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/sniper/snipe`,
    request
  );
  return response.data;
};

// Get broadcast results
export const getBroadcastResults = async (): Promise<SniperResponse<BroadcastResult[]>> => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/sniper/broadcasts`);
  return response.data;
};

// Clear broadcast results
export const clearBroadcastResults = async (): Promise<SniperResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/sniper/broadcasts/clear`
  );
  return response.data;
};
