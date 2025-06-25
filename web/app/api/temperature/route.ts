import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { airControl } from './air-control';
import { AirControlDto } from '@/app/type';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからパラメータを取得
    const body = await request.json();
    console.log(body)
    const cmd = body.cmd;
    console.log(`Temperature API called with cmd: ${cmd}`);

    // cmdに応じて処理を分岐
    switch (cmd) {
      case 'dht-start':
        return dhtStart();
      /* case 'dht-stop':
        return dhtStop(); */
      case 'air-control':
        const out = await airControl(body.data as AirControlDto);
        return NextResponse.json({ success: true, message: 'Air control command completed successfully', out: out }, { status: 200 });
      default:
        return NextResponse.json({ error: 'Invalid command' }, { status: 400 });
    }

  } catch (error) {
    console.error('Temperature API error:', error);
    return NextResponse.json({ error: 'Internal server error' + JSON.stringify(error) }, { status: 500 });
  }
}

// プロセスをスポーンして処理する関数
async function dhtStart() {
  const scriptPath = path.join(process.cwd(), '..', 'scripts', 'dht.py');


  // Server-Sent Eventsでストリーミング
  return new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // SSEヘッダーを送信
        controller.enqueue(encoder.encode('data: {"type":"start","message":"Temperature monitoring started","timestamp":"' + new Date().toISOString() + '"}\n\n'));

        const pythonProcess = spawn('python3', [scriptPath]);

        // 標準出力をストリーミング
        pythonProcess.stdout.on('data', (data) => {
          const output = data.toString().trim();
          console.log('Temperature Python stdout:', output);

          const lines = output.split('\n').filter((line: string) => line.trim());

          lines.forEach((line: string) => {
            try {
              const parsed = JSON.parse(line);
              const sseData = {
                type: 'data',
                data: parsed,
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`));
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              const errorData = {
                type: 'error',
                error: 'JSON parse failed',
                raw_output: line,
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
            }
          });
        });

        // エラー出力をストリーミング
        pythonProcess.stderr.on('data', (data) => {
          console.error('Temperature Python stderr:', data.toString());
          const errorData = {
            type: 'stderr',
            message: data.toString(),
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        });

        // プロセス終了時
        pythonProcess.on('close', (code) => {
          console.log(`Temperature Python process exited with code ${code}`);
          const closeData = {
            type: 'close',
            exit_code: code,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(closeData)}\n\n`));
          controller.close();
        });

        // プロセスエラー時
        pythonProcess.on('error', (error) => {
          console.error('Failed to start temperature Python process:', error);
          const errorData = {
            type: 'process_error',
            error: 'Failed to start Python process',
            message: error.message,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        });
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    }
  );

}

// ステータス確認用の関数
async function handleStatus() {
  return NextResponse.json({
    success: true,
    status: 'Temperature API is running',
    available_commands: ['spawn', 'status', 'stop'],
    timestamp: new Date().toISOString()
  });
}

// 停止処理用の関数（将来の拡張用）
async function handleStop() {
  return NextResponse.json({
    success: true,
    message: 'Stop command received (not implemented yet)',
    timestamp: new Date().toISOString()
  });
}