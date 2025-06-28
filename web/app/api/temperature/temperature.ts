import { NextResponse } from "next/server";
import { temperatureManager } from "../../../lib/TemperatureManager";

export const temperature = () => {
  let isStreamActive = false;
  let intervalId: NodeJS.Timeout;

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
        isStreamActive = true;

        // Set up polling for new data
        const pollForUpdates = () => {
          if (!isStreamActive) return;

          const measurement = temperatureManager.getLatestMeasurement();

          // Send new measurements if buffer has grown
          if (measurement) {
            const sseData = `data: ${JSON.stringify(measurement)}\n\n`;
            controller.enqueue(new TextEncoder().encode(sseData));
            console.log("sending: ", measurement);
          }
        };

        // Start continuous polling every second
        pollForUpdates();
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
        isStreamActive = false;
        if (intervalId) {
          clearInterval(intervalId);
        }
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
