import { NextRequest, NextResponse } from "next/server";
import { airControl } from "./air-control";
import { AirControlDto } from "@/app/type";
import { temperatureManager } from "@/lib/TemperatureManager";
import { temperature } from "./temperature";
import { remoteController } from "@/lib/RemoteController";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cmd = searchParams.get("cmd");

    console.log(`Temperature API GET called with cmd: ${cmd}`);

    if (cmd === "temperature") {
      return temperature();
    }

    if (cmd === "air-control") {
      return NextResponse.json(
        {
          success: true,
          data: remoteController,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid command for GET request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Temperature API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" + JSON.stringify(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからパラメータを取得
    const body = await request.json();
    console.log(body);
    const cmd = body.cmd;
    console.log(`Temperature API called with cmd: ${cmd}`);

    // cmdに応じて処理を分岐
    switch (cmd) {
      case "air-control":
        const out = await airControl(body.data as AirControlDto);
        return NextResponse.json(
          {
            success: true,
            message: "Air control command completed successfully",
            out: out,
          },
          { status: 200 }
        );
      default:
        return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }
  } catch (error) {
    console.error("Temperature API error:", error);
    return NextResponse.json(
      { error: "Internal server error" + JSON.stringify(error) },
      { status: 500 }
    );
  }
}
