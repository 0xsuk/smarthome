"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// 温度データの型定義
interface TemperatureReading {
  temp: number
  humidity: number
  timestamp: Date
}

// チャート用データの型定義
interface ChartData {
  time: string
  temperature: number
  humidity: number
}

// サンプルデータ生成（初期表示用）
const generateHourlyData = (): ChartData[] => {
  const data = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.getHours().toString().padStart(2, "0") + ":00",
      temperature: 18 + Math.random() * 8, // 18-26度の範囲
      humidity: 45 + Math.random() * 20, // 45-65%の範囲
    })
  }
  return data
}

const generateDailyData = (days: number) => {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    data.push({
      time: `${date.getMonth() + 1}/${date.getDate()}`,
      temperature: 18 + Math.random() * 8,
      humidity: 45 + Math.random() * 20,
    })
  }
  return data
}

export default function ThermometerPage() {

  const [tempObj, setTempObj] = useState<TemperatureReading | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewMode, setViewMode] = useState<"today" | "1day" | "2-6days">("today")
  const [isConnected, setIsConnected] = useState(false)
  //const [realtimeData, setRealtimeData] = useState<ChartData[]>([])

  const eventSourceRef = useRef<EventSource | null>(null)

  /* const hourlyData = generateHourlyData()
  const dailyData1 = generateDailyData(1)
  const dailyData6 = generateDailyData(6) */

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

  useEffect(() => {
    // 時刻更新タイマー
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // 温度ストリームを開始
    startTemperatureStream()

    return () => {
      clearInterval(timer)
      stopTemperatureStream()
    }
  }, [])

/*   const getChartData = (): ChartData[] => {
    switch (viewMode) {
      case "today":
        // リアルタイムデータがある場合はそれを使用、なければサンプルデータ
        return realtimeData.length > 0 ? realtimeData : hourlyData
      case "1day":
        return dailyData1
      case "2-6days":
        return dailyData6
      default:
        return realtimeData.length > 0 ? realtimeData : hourlyData
    }
  } */

  const getTitle = () => {
    switch (viewMode) {
      case "today":
        return "当日"
      case "1day":
        return "1日前"
      case "2-6days":
        return "2日前〜6日前"
      default:
        return "当日"
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* ハッカー風背景パターン */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(90deg, #00ff00 1px, transparent 1px),
            linear-gradient(180deg, #00ff00 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/20"></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-green-900/50 border-green-500 text-green-400 hover:bg-green-800/50"
              >
                <Home className="w-4 h-4 mr-2" />
                ホーム
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-green-400 font-mono tracking-wider">TEMPERATURE MONITOR v2.1</h1>
            <div className="text-green-500 font-mono text-sm">{currentTime.toLocaleTimeString()}</div>
          </div>

          {/* メインディスプレイ */}
          <Card className="mb-6 bg-gray-900 border-2 border-green-500 shadow-lg shadow-green-500/20">
            <CardContent className="p-6">
              {/* LCD風ディスプレイ */}
              <div className="bg-black border-4 border-gray-700 p-6 rounded-lg font-mono text-center mb-4 shadow-inner">
                <div className="text-4xl font-bold mb-2 text-green-400 tracking-wider">
                  {tempObj == null ? "N/A" : tempObj?.temp.toFixed(1) + "°C " + tempObj?.humidity.toFixed(1) + "%"}
                </div>
                <div className="text-sm mb-4 text-green-300">
                  {tempObj?.timestamp.toLocaleString("ja-JP")} | MODE: {getTitle()}
                </div>

                {/* ミニグラフ表示エリア */}
               {/*  <div className="h-20 bg-green-950 rounded border-2 border-green-700 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData().slice(-12)}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00ff00" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#00ff00" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0099ff" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#0099ff" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="temperature"
                        stroke="#00ff00"
                        strokeWidth={1}
                        fill="url(#tempGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="humidity"
                        stroke="#0099ff"
                        strokeWidth={1}
                        fill="url(#humidityGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div> */}

                {/* システム情報 */}
                <div className="mt-4 text-xs text-green-500 flex justify-between">
                  <span>SYS: ONLINE</span>
                  <span>CONN: {isConnected ? "LIVE" : "OFFLINE"}</span>
                  <span>PWR: 98%</span>
                </div>
              </div>

              {/* ナビゲーションボタン */}
              <div className="flex justify-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewMode === "1day") setViewMode("today")
                    else if (viewMode === "2-6days") setViewMode("1day")
                  }}
                  disabled={viewMode === "today"}
                  className="bg-orange-900/50 hover:bg-orange-800/50 text-orange-400 border-orange-500 font-mono"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  PREV
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewMode === "today") setViewMode("1day")
                    else if (viewMode === "1day") setViewMode("2-6days")
                  }}
                  disabled={viewMode === "2-6days"}
                  className="bg-blue-900/50 hover:bg-blue-800/50 text-blue-400 border-blue-500 font-mono"
                >
                  NEXT
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/*  
              <div className="text-center text-sm text-green-400 mb-4 font-mono">
                [DISPLAY_MODE: {getTitle()}] | [DATA_POINTS: {getChartData().length}] | [STATUS: {isConnected ? "LIVE" : "OFFLINE"}]
              </div> */}
            </CardContent>
          </Card>

          {/* 詳細グラフ */}
          {/* <Card className="bg-gray-900 border-2 border-blue-500 shadow-lg shadow-blue-500/20">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-center text-blue-400 font-mono tracking-wider">
                [{getTitle()}] ENVIRONMENTAL_DATA_ANALYSIS
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-black">
              <ChartContainer
                config={{
                  temperature: {
                    label: "TEMP (°C)",
                    color: "#00ff00",
                  },
                  humidity: {
                    label: "HUMID (%)",
                    color: "#0099ff",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <defs>
                      <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ff00" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#00ff00" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="humidGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0099ff" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#0099ff" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#666" tick={{ fill: "#666", fontSize: 12 }} />
                    <YAxis
                      yAxisId="temp"
                      orientation="left"
                      domain={[10, 30]}
                      stroke="#00ff00"
                      tick={{ fill: "#00ff00", fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="humidity"
                      orientation="right"
                      domain={[30, 80]}
                      stroke="#0099ff"
                      tick={{ fill: "#0099ff", fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent className="bg-gray-900 border-green-500 text-green-400" />}
                    />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="temperature"
                      stroke="#00ff00"
                      strokeWidth={3}
                      dot={{ fill: "#00ff00", strokeWidth: 2, r: 4 }}
                      filter="drop-shadow(0 0 6px #00ff00)"
                    />
                    <Line
                      yAxisId="humidity"
                      type="monotone"
                      dataKey="humidity"
                      stroke="#0099ff"
                      strokeWidth={3}
                      dot={{ fill: "#0099ff", strokeWidth: 2, r: 4 }}
                      filter="drop-shadow(0 0 6px #0099ff)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="flex justify-center gap-8 mt-4 text-sm font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded shadow-lg shadow-green-500/50"></div>
                  <span className="text-green-400">TEMPERATURE_SENSOR</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded shadow-lg shadow-blue-500/50"></div>
                  <span className="text-blue-400">HUMIDITY_SENSOR</span>
                </div>
              </div>

              {/* 追加のハッカー風情報 
              <div className="mt-6 grid grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-gray-800 border border-green-500 p-2 rounded">
                  <div className="text-green-400">TEMP_AVG</div>
                  <div className="text-green-300">
                    {(getChartData().reduce((sum, item) => sum + item.temperature, 0) / getChartData().length).toFixed(
                      1,
                    )}
                    °C
                  </div>
                </div>
                <div className="bg-gray-800 border border-blue-500 p-2 rounded">
                  <div className="text-blue-400">HUMID_AVG</div>
                  <div className="text-blue-300">
                    {(getChartData().reduce((sum, item) => sum + item.humidity, 0) / getChartData().length).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-800 border border-purple-500 p-2 rounded">
                  <div className="text-purple-400">STATUS</div>
                  <div className="text-purple-300">{isConnected ? "LIVE" : "OFFLINE"}</div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  )
}
