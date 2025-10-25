import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  startSUSDT,
  stopSUSDT,
  getSUSDTStatus,
  type SUSDTConfig,
  type SUSDTStatus
} from '@/api/bot/susdt';

interface WebSocketMessage {
  type: string;
  timestamp: number;
  running: boolean;
  config?: SUSDTConfig;
  data?: unknown;
  message?: string;
}

interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

export const useSUSDT = () => {
  const [status, setStatus] = useState<SUSDTStatus>({
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
    const wsUrl = baseUrl.replace(/^https?:/, protocol) + '/api/v1/bot/susdt/ws';

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('sUSDT WebSocket connected');
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
        console.error('sUSDT WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('sUSDT WebSocket disconnected');
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
      const response = await getSUSDTStatus() as any as ApiResponse<SUSDTStatus>;
      if (response.code === 201) {
        setStatus(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
      setError(err.message || 'Failed to fetch status');
    }
  }, []);

  // Start bot
  const start = useCallback(async (config: SUSDTConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await startSUSDT(config) as any as ApiResponse;
      if (response.code === 201) {
        message.success('sUSDT test started successfully');
        addLog('sUSDT test started');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to start');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start sUSDT test';
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
      const response = await stopSUSDT() as any as ApiResponse;
      if (response.code === 201) {
        message.success('sUSDT test stopped successfully');
        addLog('sUSDT test stopped');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to stop');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to stop sUSDT test';
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
