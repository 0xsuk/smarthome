"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Power, ChevronUp, ChevronDown, Wind, Snowflake, Sun, Droplets } from "lucide-react"
import Link from "next/link"

export default function RemotePage() {
  const [isOn, setIsOn] = useState(false)
  const [temperature, setTemperature] = useState(25)
  const [mode, setMode] = useState<"cool" | "heat" | "dry" | "auto">("cool")
  const [fanSpeed, setFanSpeed] = useState<"auto" | "low" | "med" | "high">("auto")

  const handlePowerToggle = () => {
    setIsOn(!isOn)
  }

  const handleTempUp = () => {
    if (temperature < 30) setTemperature(temperature + 1)
  }

  const handleTempDown = () => {
    if (temperature > 16) setTemperature(temperature - 1)
  }

  const getModeIcon = (modeType: string) => {
    switch (modeType) {
      case "cool":
        return <Snowflake className="w-4 h-4" />
      case "heat":
        return <Sun className="w-4 h-4" />
      case "dry":
        return <Droplets className="w-4 h-4" />
      case "auto":
        return <Wind className="w-4 h-4" />
      default:
        return <Wind className="w-4 h-4" />
    }
  }

  const getModeText = (modeType: string) => {
    switch (modeType) {
      case "cool":
        return "冷房"
      case "heat":
        return "暖房"
      case "dry":
        return "除湿"
      case "auto":
        return "自動"
      default:
        return "自動"
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
            backgroundSize: "25px 25px",
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
      </div>

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
                {isOn ? `${temperature}°C` : "--°C"}
              </div>
              <div className="text-sm flex items-center justify-center gap-2 text-green-300 font-mono">
                {isOn && (
                  <>
                    {getModeIcon(mode)}
                    <span>{getModeText(mode)}</span>
                    <span>・</span>
                    <Wind className="w-4 h-4" />
                    <span>{fanSpeed === "auto" ? "自動" : fanSpeed}</span>
                  </>
                )}
                {!isOn && <span className="text-red-400">SYSTEM_OFFLINE</span>}
              </div>
            </div>

            {/* 電源ボタン */}
            <div className="flex justify-center mb-6">
              <Button
                onClick={handlePowerToggle}
                className={`w-16 h-16 rounded-lg font-bold font-mono tracking-wider border-2 transition-all ${
                  isOn
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
                disabled={!isOn || temperature <= 16}
                variant="outline"
                size="lg"
                className="w-12 h-12 rounded-lg bg-gray-800/50 border-2 border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                <ChevronDown className="w-6 h-6" />
              </Button>
              <div className="text-xl font-bold min-w-[80px] text-center font-mono tracking-wider text-blue-400">
                {isOn ? `${temperature}°C` : "--°C"}
              </div>
              <Button
                onClick={handleTempUp}
                disabled={!isOn || temperature >= 30}
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
                onClick={() => setMode("cool")}
                disabled={!isOn}
                variant="outline"
                className={`h-12 flex items-center gap-2 font-mono tracking-wider border-2 transition-all ${
                  mode === "cool" && isOn
                    ? "bg-cyan-900/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/50"
                    : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
                }`}
              >
                <Snowflake className="w-4 h-4" />
                COOL
              </Button>
              <Button
                onClick={() => setMode("heat")}
                disabled={!isOn}
                variant="outline"
                className={`h-12 flex items-center gap-2 font-mono tracking-wider border-2 transition-all ${
                  mode === "heat" && isOn
                    ? "bg-red-900/80 border-red-400 text-red-300 shadow-lg shadow-red-500/50"
                    : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400"
                }`}
              >
                <Sun className="w-4 h-4" />
                HEAT
              </Button>
              <Button
                onClick={() => setMode("dry")}
                disabled={!isOn}
                variant="outline"
                className={`h-12 flex items-center gap-2 font-mono tracking-wider border-2 transition-all ${
                  mode === "dry" && isOn
                    ? "bg-purple-900/80 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/50"
                    : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-purple-500 hover:text-purple-400"
                }`}
              >
                <Droplets className="w-4 h-4" />
                DRY
              </Button>
              <Button
                onClick={() => setMode("auto")}
                disabled={!isOn}
                variant="outline"
                className={`h-12 flex items-center gap-2 font-mono tracking-wider border-2 transition-all ${
                  mode === "auto" && isOn
                    ? "bg-green-900/80 border-green-400 text-green-300 shadow-lg shadow-green-500/50"
                    : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400"
                }`}
              >
                <Wind className="w-4 h-4" />
                AUTO
              </Button>
            </div>

            {/* 風量調整 */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(["auto", "low", "med", "high"] as const).map((speed) => (
                <Button
                  key={speed}
                  onClick={() => setFanSpeed(speed)}
                  disabled={!isOn}
                  variant="outline"
                  size="sm"
                  className={`h-10 font-mono text-xs tracking-wider border-2 transition-all ${
                    fanSpeed === speed && isOn
                      ? "bg-orange-900/80 border-orange-400 text-orange-300 shadow-lg shadow-orange-500/50"
                      : "bg-gray-800/50 border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400"
                  }`}
                >
                  {speed === "auto" ? "AUTO" : speed === "low" ? "LOW" : speed === "med" ? "MED" : "HIGH"}
                </Button>
              ))}
            </div>

            {/* その他の機能ボタン */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                disabled={!isOn}
                variant="outline"
                size="sm"
                className="h-10 bg-gray-800/50 border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 font-mono text-xs tracking-wider"
              >
                TIMER
              </Button>
              <Button
                disabled={!isOn}
                variant="outline"
                size="sm"
                className="h-10 bg-gray-800/50 border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 font-mono text-xs tracking-wider"
              >
                SWING
              </Button>
              <Button
                disabled={!isOn}
                variant="outline"
                size="sm"
                className="h-10 bg-gray-800/50 border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 font-mono text-xs tracking-wider"
              >
                ECO
              </Button>
              <Button
                disabled={!isOn}
                variant="outline"
                size="sm"
                className="h-10 bg-gray-800/50 border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 font-mono text-xs tracking-wider"
              >
                QUIET
              </Button>
              <Button
                disabled={!isOn}
                variant="outline"
                size="sm"
                className="h-10 bg-gray-800/50 border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 font-mono text-xs tracking-wider"
              >
                CLEAN
              </Button>
              <Button
                disabled={!isOn}
                variant="outline"
                size="sm"
                className="h-10 bg-gray-800/50 border-gray-600 text-gray-400 hover:border-yellow-500 hover:text-yellow-400 font-mono text-xs tracking-wider"
              >
                RESET
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
