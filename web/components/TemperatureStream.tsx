'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TemperatureData {
  type: 'start' | 'data' | 'error' | 'stderr' | 'close' | 'process_error';
  data?: any;
  error?: string;
  message?: string;
  raw_output?: string;
  exit_code?: number;
  timestamp: string;
}

interface TemperatureStreamProps {
  autoStart?: boolean;
}

export default function TemperatureStream({ autoStart = false }: TemperatureStreamProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<TemperatureData[]>([]);
  const [latestReading, setLatestReading] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  
  const eventSourceRef = useRef<EventSource | null>(null);

  // SSE接続を開始する関数
  const startStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/temperature?cmd=spawn&stream=true');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('Connected');
      console.log('SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const newData: TemperatureData = JSON.parse(event.data);
        
        setData(prev => [...prev.slice(-99), newData]); // 最新100件を保持
        
        if (newData.type === 'data' && newData.data) {
          setLatestReading(newData.data);
        }
        
        console.log('Received data:', newData);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setConnectionStatus('Error');
      setIsConnected(false);
    };

    eventSource.addEventListener('close', () => {
      setIsConnected(false);
      setConnectionStatus('Closed');
      console.log('SSE connection closed');
    });
  };

  // SSE接続を停止する関数
  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  };

  // 一回限りのデータ取得
  const fetchOnce = async () => {
    try {
      setConnectionStatus('Fetching...');
      const response = await fetch('/api/temperature?cmd=spawn&stream=false');
      const result = await response.json();
      
      if (result.success) {
        const newData: TemperatureData = {
          type: 'data',
          data: result,
          timestamp: new Date().toISOString()
        };
        setData(prev => [...prev.slice(-99), newData]);
        setConnectionStatus('Fetch completed');
      } else {
        setConnectionStatus('Fetch failed');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setConnectionStatus('Fetch error');
    }
  };

  // ステータス確認
  const checkStatus = async () => {
    try {
      const response = await fetch('/api/temperature?cmd=status');
      const result = await response.json();
      console.log('API Status:', result);
      alert(`API Status: ${result.status}`);
    } catch (error) {
      console.error('Status check error:', error);
      alert('Status check failed');
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    if (autoStart) {
      startStream();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [autoStart]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Temperature Monitoring</h2>
        
        {/* 接続状態表示 */}
        <div className="mb-4 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="font-medium">Connection Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus}
            </span>
          </div>
        </div>

        {/* 最新の温度データ */}
        {latestReading && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Latest Reading</h3>
            <pre className="text-sm bg-white p-2 rounded border">
              {JSON.stringify(latestReading, null, 2)}
            </pre>
          </div>
        )}

        {/* コントロールボタン */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={startStream}
            disabled={isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Stream
          </button>
          <button
            onClick={stopStream}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Stop Stream
          </button>
          <button
            onClick={fetchOnce}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Fetch Once
          </button>
          <button
            onClick={checkStatus}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Check Status
          </button>
        </div>

        {/* データログ */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Data Log ({data.length} entries)</h3>
          <div className="max-h-96 overflow-y-auto">
            {data.length === 0 ? (
              <p className="text-gray-500">No data received yet</p>
            ) : (
              <div className="space-y-2">
                {data.slice().reverse().map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border text-sm ${
                      item.type === 'error' || item.type === 'stderr' || item.type === 'process_error'
                        ? 'bg-red-50 border-red-200'
                        : item.type === 'data'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'error' || item.type === 'stderr' || item.type === 'process_error'
                          ? 'bg-red-100 text-red-800'
                          : item.type === 'data'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 