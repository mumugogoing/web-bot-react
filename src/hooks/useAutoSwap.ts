import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  startAutoSwap,
  stopAutoSwap,
  getAutoSwapStatus,
  type AutoSwapConfig,
  type AutoSwapStatus
} from '@/api/bot/autoswap';

interface WebSocketMessage {
  type: string;
  timestamp: number;
  running: boolean;
  config?: AutoSwapConfig;
  data?: unknown;
  message?: string;
}

interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  msg: string;
}

export const useAutoSwap = () => {
  const [status, setStatus] = useState<AutoSwapStatus>({
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
    const wsUrl = baseUrl.replace(/^https?:/, protocol) + '/api/v1/bot/autoswap/ws';

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('AutoSwap WebSocket connected');
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
        console.error('AutoSwap WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('AutoSwap WebSocket disconnected');
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
      const response = await getAutoSwapStatus() as any as ApiResponse<AutoSwapStatus>;
      if (response.code === 201) {
        setStatus(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
      setError(err.message || 'Failed to fetch status');
    }
  }, []);

  // Start bot
  const start = useCallback(async (config: AutoSwapConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await startAutoSwap(config) as any as ApiResponse;
      if (response.code === 201) {
        message.success('AutoSwap started successfully');
        addLog('AutoSwap started');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to start');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start AutoSwap';
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
      const response = await stopAutoSwap() as any as ApiResponse;
      if (response.code === 201) {
        message.success('AutoSwap stopped successfully');
        addLog('AutoSwap stopped');
        await fetchStatus();
      } else {
        throw new Error(response.msg || 'Failed to stop');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to stop AutoSwap';
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
