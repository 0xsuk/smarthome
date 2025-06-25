import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // URLパラメータからcmdを取得
    const { searchParams } = new URL(request.url);
    const cmd = searchParams.get('cmd') || 'spawn';
    const stream = searchParams.get('stream') === 'true';
    
    console.log(`Temperature API called with cmd: ${cmd}, stream: ${stream}`);
    
    // cmdに応じて処理を分岐
    switch (cmd) {
      case 'spawn':
        return handleSpawnProcess(stream);
      case 'status':
        return handleStatus();
      case 'stop':
        return handleStop();
      default:
        return NextResponse.json({error: 'Invalid command'}, {status: 400});
    }
    
  } catch (error) {
    console.error('Temperature API error:', error);
    return NextResponse.json({error: 'Internal server error' + JSON.stringify(error)}, {status: 500});
  }
}

// プロセスをスポーンして処理する関数
async function handleSpawnProcess(useStream: boolean) {
  const scriptPath = path.join(process.cwd(), 'python_scripts', 'temperature_sensor.py');
  
  if (useStream) {
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
  } else {
    // 従来の一回限りのレスポンス
    return new Promise((resolve) => {
      const results: any[] = [];
      
      const pythonProcess = spawn('python3', [scriptPath]);
      
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log('Temperature Python stdout:', output);
        
        const lines = output.split('\n').filter((line: string) => line.trim());
        
        lines.forEach((line: string) => {
          try {
            const parsed = JSON.parse(line);
            results.push(parsed);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            results.push({
              error: 'JSON parse failed',
              raw_output: line,
              timestamp: new Date().toISOString()
            });
          }
        });
      });
      
      pythonProcess.stderr.on('data', (data) => {
        console.error('Temperature Python stderr:', data.toString());
        results.push({
          error: 'Python stderr',
          message: data.toString(),
          timestamp: new Date().toISOString()
        });
      });
      
      pythonProcess.on('close', (code) => {
        console.log(`Temperature Python process exited with code ${code}`);
        
        resolve(NextResponse.json({
          success: true,
          exit_code: code,
          results: results,
          total_outputs: results.length,
          timestamp: new Date().toISOString()
        }));
      });
      
      pythonProcess.on('error', (error) => {
        console.error('Failed to start temperature Python process:', error);
        
        resolve(NextResponse.json({
          success: false,
          error: 'Failed to start temperature Python process',
          message: error.message,
          timestamp: new Date().toISOString()
        }, { status: 500 }));
      });
    });
  }
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