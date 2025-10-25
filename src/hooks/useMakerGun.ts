import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  startMakerGun,
  stopMakerGun,
  getMakerGunStatus,
  type MakerGunConfig,
  type MakerGunStatus
} from '@/api/bot/makergun';

interface WebSocketMessage {
  type: string;
  timestamp: number;
  running: boolean;
  config?: MakerGunConfig;
  data?: unknown;
  message?: string;
}

interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

export const useMakerGun = () => {
  const [status, setStatus] = useState<MakerGunStatus>({
    running: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const baseUrl = import.meta.env.VITE_BASE_API || 'http://127.0.0.1:10000';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = baseUrl.replace(/^https?:/, protocol) + '/api/v1/bot/makergun/ws';

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('MakerGun WebSocket connected');
        setError(null);
        addLog('WebSocket connected');
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
          } else if (data.type === 'log' && data.message) {
            addLog(data.message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('MakerGun WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('MakerGun WebSocket disconnected');
        addLog('WebSocket disconnected, reconnecting...');
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

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await getMakerGunStatus() as any as ApiResponse<MakerGunStatus>;
      if (response.code === 201) {
        setStatus(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
      setError(err.message || 'Failed to fetch status');
    }
  }, []);

  // Start bot
  const start = useCallback(async (config: MakerGunConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await startMakerGun(config) as any as ApiResponse;
      if (response.code === 201) {
        message.success('MakerGun started successfully');
        addLog('MakerGun started');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to start');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start MakerGun';
      setError(errorMsg);
      message.error(errorMsg);
      addLog(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // Stop bot
  const stop = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await stopMakerGun() as any as ApiResponse;
      if (response.code === 201) {
        message.success('MakerGun stopped successfully');
        addLog('MakerGun stopped');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to stop');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to stop MakerGun';
      setError(errorMsg);
      message.error(errorMsg);
      addLog(`Error: ${errorMsg}`);
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
    logs,
    start,
    stop,
    refresh: fetchStatus
  };
};
