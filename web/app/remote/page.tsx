"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Power, ChevronUp, ChevronDown, Wind, Snowflake, Sun, Droplets, Zap } from "lucide-react"
import Link from "next/link"
import { Mode, FanSpeed, AirControlDto } from "@/app/type"
import { useTemperature } from "@/hooks/useTemperature"

// 電力消費データの型定義
interface PowerData {
  date: string
  consumption: number
}

export default function RemotePage() {
  const { tempObj, startTemperatureStream } = useTemperature()
  const [state, setState] = useState<AirControlDto | null>(null)
  const isInitialLoad = useRef(true)

  // サンプル電力消費データ（実際のアプリでは API から取得）
  const [powerData] = useState<PowerData[]>([
    { date: "11/22", consumption: 8.5 },
    { date: "11/23", consumption: 12.3 },
    { date: "11/24", consumption: 6.7 },
    { date: "11/25", consumption: 15.2 },
    { date: "11/26", consumption: 9.8 },
    { date: "11/27", consumption: 11.4 },
    { date: "11/28", consumption: 13.6 },
    { date: "11/29", consumption: 7.9 },
    { date: "11/30", consumption: 14.1 },
    { date: "12/01", consumption: 10.5 },
    { date: "12/02", consumption: 8.3 },
    { date: "12/03", consumption: 16.7 },
    { date: "12/04", consumption: 12.8 },
    { date: "12/05", consumption: 9.2 },
    { date: "12/06", consumption: 11.9 },
    { date: "12/07", consumption: 13.4 },
    { date: "12/08", consumption: 7.6 },
    { date: "12/09", consumption: 15.8 },
    { date: "12/10", consumption: 10.1 },
    { date: "12/11", consumption: 8.9 },
    { date: "12/12", consumption: 14.3 },
    { date: "12/13", consumption: 11.7 },
    { date: "12/14", consumption: 9.5 },
    { date: "12/15", consumption: 12.6 },
    { date: "12/16", consumption: 8.1 },
    { date: "12/17", consumption: 16.2 },
    { date: "12/18", consumption: 13.9 },
    { date: "12/19", consumption: 10.8 },
    { date: "12/20", consumption: 7.4 },
    { date: "12/21", consumption: 15.5 },
  ])

  useEffect(() => { 
    startTemperatureStream()

    const fetchRemoteController = async () => {
      const response = await fetch('/api/temperature?cmd=air-control')

      const data = await response.json()
      const state = data.data.state as AirControlDto

      if (state) {
        setState(state)
        
      }
    }
    fetchRemoteController()
  }, [])

  useEffect(() => {
    const postInfrared = async () => {
      if (!state) return
      
      // Skip API call on initial load
      if (isInitialLoad.current) {
        isInitialLoad.current = false
        return
      }
      
      try {
        const response = await fetch('/api/temperature', {
          method: 'POST',
          body: JSON.stringify({
            cmd: "air-control", data: {
              isOn: state.isOn,
              temperature: state.temperature,
              mode: state.mode,
              fanSpeed: state.fanSpeed
            }
          })
        })
        const data = await response.json()
        console.log(data, state)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    postInfrared()
  }, [state])



  const handlePowerToggle = () => {
    if (!state) return
    setState({ ...state, isOn: !state.isOn })
  }

  const handleTempUp = () => {
    if (!state) return
    if (state.temperature < 30) setState({ ...state, temperature: state.temperature + 1 })
  }

  const handleTempDown = () => {
    if (!state) return
    if (state.temperature > 16) setState({ ...state, temperature: state.temperature - 1 })
  }

  const getModeIcon = (modeType: Mode) => {
    switch (modeType) {
      case "COOL":
        return <Snowflake className="w-4 h-4" />
      case "HEAT":
        return <Sun className="w-4 h-4" />
      case "DRY":
        return <Droplets className="w-4 h-4" />
      default:
        return <Wind className="w-4 h-4" />
    }
  }

  // 電力消費グラフコンポーネント
  const PowerConsumptionChart = () => {
    const maxConsumption = Math.max(...powerData.map(d => d.consumption))

    return (
      <Card className="bg-gray-900 border-2 border-green-500 rounded-2xl shadow-lg shadow-green-500/20 mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-green-400 font-mono tracking-wider">
              POWER_CONSUMPTION
            </h2>
          </div>

          <div className="bg-black border-2 border-gray-700 rounded-lg p-4">
            <div className="flex items-end justify-between gap-0.5 h-40 mb-4 overflow-x-auto">
              {powerData.map((data, index) => {
                const height = Math.max((data.consumption / maxConsumption) * 100, 5) // 最小5%の高さを保証
                return (
                  <div key={index} className="flex flex-col items-center gap-1 min-w-0 flex-shrink-0" style={{ width: '10px' }}>
                    <div className="w-full h-32 flex items-end justify-center">
                      <div
                        className="w-2 bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm transition-all duration-300 hover:from-green-500 hover:to-green-300 hover:shadow-lg hover:shadow-green-400/50 hover:w-3"
                        style={{
                          height: `${height}%`,
                          minHeight: '4px' // 最小の高さを設定
                        }}
                        title={`${data.date}: ${data.consumption}kWh`} // ツールチップ追加
                      />
                    </div>
                    <div className="text-[6px] text-green-300 font-mono text-center w-full transform rotate-45 origin-bottom-left mt-2">
                      <div className="font-bold">{data.consumption}</div>
                      <div className="text-gray-400">{data.date}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 統計情報 */}
            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400 font-mono">TOTAL</div>
                  <div className="text-sm font-bold text-blue-400 font-mono">
                    {powerData.reduce((sum, d) => sum + d.consumption, 0).toFixed(1)}kWh
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-mono">AVG</div>
                  <div className="text-sm font-bold text-yellow-400 font-mono">
                    {(powerData.reduce((sum, d) => sum + d.consumption, 0) / powerData.length).toFixed(1)}kWh
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-mono">MAX</div>
                  <div className="text-sm font-bold text-red-400 font-mono">
                    {Math.max(...powerData.map(d => d.consumption)).toFixed(1)}kWh
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log(tempObj)

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
            backgroundSize: "25px 25px",
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
      </div>

      {state && 
      
      <div className="relative z-10 max-w-md mx-auto p-4">
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
          <h1 className="text-2xl font-bold text-blue-400 font-mono tracking-wider">REMOTE_CTRL</h1>
          <div></div>
        </div>

        {/* リモコン本体 */}
        <Card className="bg-gray-900 border-2 border-blue-500 rounded-3xl shadow-lg shadow-blue-500/20">
          <CardContent className="p-6">
            {/* ディスプレイ */}
            <div className="bg-black border-4 border-gray-700 text-white p-4 rounded-lg mb-6 text-center shadow-inner">
              <div className="text-3xl font-bold mb-2 text-blue-400 font-mono tracking-wider">
                {state.temperature}
              </div>
              <div className="text-sm flex items-center justify-center gap-2 text-green-300 font-mono">
                <>
                  {getModeIcon(state.mode)}
                  <span>{state.mode}</span>
                  <span>   </span>
                  <Wind className="w-4 h-4" />
                  <span>{state.fanSpeed}</span>
                </>
              </div>
            </div>

            {/* 電源ボタン */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handlePowerToggle}
                className={`w-16 h-16 rounded-lg font-bold font-mono tracking-wider border-2 transition-all ${state.isOn
                  ? "bg-red-900/80 border-red-400 text-red-300 shadow-lg shadow-red-500/50 hover:bg-red-800/80"
                  : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400"
                  }`}
              >
                <Power className="w-6 h-6" />
              </Button>
            </div>

            {/* 温度調整 */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <Button
                onClick={handleTempDown}
                disabled={state.temperature <= 17}
                variant="outline"
                size="lg"
                className="w-12 h-12 rounded-lg bg-gray-800/50 border-2 border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
              <div className="text-xl font-bold min-w-[80px] text-center font-mono tracking-wider text-blue-400">
                {tempObj ? `${tempObj.temp.toFixed(1)}°C ${tempObj.humidity.toFixed(1)}%` : "---°C  　---%"}
              </div>
              <Button
                onClick={handleTempUp}
                disabled={state.temperature >= 30}
                variant="outline"
                size="lg"
                className="w-12 h-12 rounded-lg bg-gray-800/50 border-2 border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <ChevronUp className="w-6 h-6" />
              </Button>
            </div>

            {/* モードボタン */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                onClick={() => setState({ ...state, mode: "COOL" })}
                variant="outline"
                className={`h-12 flex items-center gap-2 font-mono tracking-wider border-2 transition-all ${state.mode === "COOL" 
                  ? "bg-cyan-900/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/50"
                  : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
                  }`}
              >
                <Snowflake className="w-4 h-4" />
                COOL
              </Button>
              <Button
                onClick={() => setState({ ...state, mode: "HEAT" })}
                variant="outline"
                className={`h-12 flex items-center gap-2 font-mono tracking-wider border-2 transition-all ${state.mode === "HEAT" 
                  ? "bg-red-900/80 border-red-400 text-red-300 shadow-lg shadow-red-500/50"
                  : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400"
                  }`}
              >
                <Sun className="w-4 h-4" />
                HEAT
              </Button>
              <Button
                onClick={() => setState({ ...state, mode: "DRY" })}
                variant="outline"
                className={`h-12 flex items-center gap-2 font-mono tracking-wider border-2 transition-all ${state.mode === "DRY" 
                  ? "bg-purple-900/80 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/50"
                  : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-purple-500 hover:text-purple-400"
                  }`}
              >
                <Droplets className="w-4 h-4" />
                DRY
              </Button>
            </div>

            {/* 風量調整 */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(["AUTO+", "AUTO", "SIZUKA"] as const).map((speed) => (
                <Button
                  key={speed}
                  onClick={() => setState({ ...state, fanSpeed: speed })}
                  variant="outline"
                  size="sm"
                  className={`h-10 font-mono text-xs tracking-wider border-2 transition-all ${state.fanSpeed === speed 
                    ? "bg-orange-900/80 border-orange-400 text-orange-300 shadow-lg shadow-orange-500/50"
                    : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400"
                    }`}
                >
                  {speed === "AUTO+" ? "AUTO+" : speed === "AUTO" ? "AUTO" : "SIZUKA"}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 電力消費グラフ */}
        <PowerConsumptionChart />
      </div>
      }
    </div>
  )
}
