import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  startSbtcMakerGun,
  stopSbtcMakerGun,
  getSbtcMakerGunStatus,
  type SbtcMakerGunConfig,
  type SbtcMakerGunStatus
} from '@/api/makergun/sbtc';

interface WebSocketMessage {
  type: string;
  timestamp: number;
  running: boolean;
  config?: SbtcMakerGunConfig;
  data?: any;
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

export const useSbtcMakerGun = () => {
  const [status, setStatus] = useState<SbtcMakerGunStatus>({
    running: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const baseUrl = import.meta.env.VITE_BASE_API || 'http://127.0.0.1:10000/api/v1';
    const wsUrl = baseUrl.replace('http', 'ws') + '/xyk/sbtc-makergun/ws';

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('SBTC MakerGun WebSocket connected');
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (data.type === 'status') {
            setStatus({
              running: data.running,
              config: data.config,
              data: data.data
            });
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('SBTC MakerGun WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('SBTC MakerGun WebSocket disconnected');
        // Auto reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, []);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await getSbtcMakerGunStatus() as any as ApiResponse<SbtcMakerGunStatus>;
      if (response.code === 201) {
        setStatus(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
      setError(err.message || 'Failed to fetch status');
    }
  }, []);

  // Start bot
  const start = useCallback(async (config: SbtcMakerGunConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await startSbtcMakerGun(config) as any as ApiResponse;
      if (response.code === 201) {
        message.success('SBTC MakerGun started successfully');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to start');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start SBTC MakerGun';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // Stop bot
  const stop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await stopSbtcMakerGun() as any as ApiResponse;
      if (response.code === 201) {
        message.success('SBTC MakerGun stopped successfully');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to stop');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to stop SBTC MakerGun';
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // Initialize
  useEffect(() => {
    fetchStatus();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [fetchStatus, connectWebSocket, disconnectWebSocket]);

  return {
    status,
    loading,
    error,
    start,
    stop,
    refresh: fetchStatus
  };
};
