import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Zap } from "lucide-react"

export default function HomePage() {
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
            backgroundSize: "30px 30px",
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/20"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-400 font-mono tracking-wider">
          SMART_HOME_CONTROL_SYSTEM v3.0
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/thermometer">
            <Card className="hover:shadow-lg hover:shadow-green-500/20 transition-all cursor-pointer bg-gray-900 border-2 border-green-500">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mb-4 border-2 border-green-500">
                  <Thermometer className="w-8 h-8 text-green-400" />
                </div>
                <CardTitle className="text-xl text-green-400 font-mono">TEMPERATURE_MONITOR</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-300 font-mono text-sm">Real-time environmental data analysis</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/remote">
            <Card className="hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer bg-gray-900 border-2 border-blue-500">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500">
                  <Zap className="w-8 h-8 text-blue-400" />
                </div>
                <CardTitle className="text-xl text-blue-400 font-mono">REMOTE_CONTROL</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-300 font-mono text-sm">Climate control interface</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
