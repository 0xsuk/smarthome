import { useState, useEffect, useRef } from 'react'

// 温度データの型定義
interface TemperatureReading {
  temp: number
  humidity: number
  timestamp: Date
}

interface UseTemperatureReturn {
  tempObj: TemperatureReading | null
  isConnected: boolean
  startTemperatureStream: () => void
  stopTemperatureStream: () => void
}

export const useTemperature = (): UseTemperatureReturn => {
  const [tempObj, setTempObj] = useState<TemperatureReading | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  // SSE接続を開始する関数
  const startTemperatureStream = () => {
    try {
      // EventSourceでSSEストリームを開始
      const eventSource = new EventSource('/api/temperature?cmd=temperature')
      
      eventSourceRef.current = eventSource

      console.log("startTemperatureStream", eventSource)

      eventSource.onopen = () => {
        setIsConnected(true)
        console.log('Temperature SSE connection opened')
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Temperature reading:', data)
          setTempObj(data)
        } catch (error) {
          console.error('Error parsing temperature data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('Temperature SSE error:', error)
        setIsConnected(false)
      }

    } catch (error) {
      console.error('Temperature stream error:', error)
      setIsConnected(false)
    }
  }

  // SSE接続を停止する関数
  const stopTemperatureStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopTemperatureStream()
    }
  }, [])

  return {
    tempObj,
    isConnected,
    startTemperatureStream,
    stopTemperatureStream
  }
} 