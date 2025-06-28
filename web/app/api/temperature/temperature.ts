import { NextResponse } from "next/server";
import { temperatureManager } from "../../../lib/TemperatureManager";

export const temperature = () => {
  try {
    console.log("temperature");
    temperatureManager.start();
    // Set up SSE headers
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Create a ReadableStream for SSE
    const readableStream = new ReadableStream({
      start(controller) {
        let isStreamActive = true;
        let intervalId: NodeJS.Timeout;

        // Set up polling for new data
        const pollForUpdates = () => {

            console.log("pollForUpdates")
          if (!isStreamActive) return;

          console.log("getLatestMeasurement")
          const measurement = temperatureManager.getLatestMeasurement();

          // Send new measurements if buffer has grown
          if (measurement) {
            const sseData = `data: ${JSON.stringify(measurement)}\n\n`;
            controller.enqueue(new TextEncoder().encode(sseData));
            console.log("sending: ", measurement);

          }
        };

        // Start continuous polling every second
        intervalId = setInterval(pollForUpdates, 1000);

        // Handle stream cancellation
        return () => {
          isStreamActive = false;
          if (intervalId) {
            clearInterval(intervalId);
          }
        };
      },
      cancel() {
        // Cleanup when stream is cancelled
        console.log("Temperature SSE stream cancelled");
      },
    });

    return new Response(readableStream, { headers });
  } catch (error) {
    console.error("Temperature API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" + JSON.stringify(error) },
      { status: 500 }
    );
  }
};
