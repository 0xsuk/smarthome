import assert from "assert";
import { spawn } from "child_process";
import path from "path";

class TemperatureManager {
  private process: ReturnType<typeof spawn> | null = null;
  private stdout_buffer: string = "";

  private temp_buffer_hourly: {
    temp: number;
    humidity: number;
    date: number;
    hour: number;
  }[] = []; // 24 bins * 7 days  of temp and humidity
  private temp_buffer_hourly_length: number = 24 * 7;

  private temp_buffer: { temp: number; humidity: number; timestamp: Date }[] =
    []; // stores temp until it's average is stack to temp_buffer_hours

  constructor() {
    this.start();
  }

  public isRunning() {
    return this.process !== null;
  }

  public start() {
    if (this.process) {
      return;
    }
    console.log("start temperature manager");

    try {
      const scriptPath = path.join(
        process.cwd(),
        "..",
        "scripts",
        "dht_emu.py"
      );

      const homePath = require("os").homedir();
      //const pythonPath = path.join(homePath, 'venv', 'air-control', 'bin', 'python3');
      const pythonPath = "python3";
      this.process = spawn(pythonPath, ["-u", scriptPath]); //-u for unbuffered output fuk python

      // Set up stdout data listener
      this.process.stdout?.on("data", (data: Buffer) => {
        this.handleStdout(data.toString());
      });

      // Handle stderr for error logging
      this.process.stderr?.on("data", (data: Buffer) => {
        console.error("Python script error:", data.toString());
      });

      // Handle process exit
      this.process.on("close", (code: number) => {
        console.log(`Python script exited with code ${code}`);
        this.process = null;
      });

      // Handle process error
      this.process.on("error", (error: Error) => {
        console.error("Failed to start Python script:", error);
        this.process = null;
      });
    } catch (error) {
      console.error("Failed to start Python script:", error);
      this.process = null;
    }
  }

  private handleStdout(data: string) {
    // Add new data to buffer
    this.stdout_buffer += data;

    // Process complete lines
    const lines = this.stdout_buffer.split("\n");

    // Keep the last incomplete line in buffer
    this.stdout_buffer = lines.pop() || "";

    // Process each complete line
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        this.processLine(trimmedLine);
      }
    });
  }

  private calcHourlyMeasurement() {
    if (this.temp_buffer.length === 0) {
      return { temp: 0, humidity: 0 };
    }

    // Sort temperatures and humidities separately
    const sortedTemps = this.temp_buffer
      .map((m) => m.temp)
      .sort((a, b) => a - b);
    const sortedHumidities = this.temp_buffer
      .map((m) => m.humidity)
      .sort((a, b) => a - b);

    const mid = Math.floor(this.temp_buffer.length / 2);

    return {
      temp: sortedTemps[mid],
      humidity: sortedHumidities[mid],
    };
  }

  private addHourlyMeasurement(hour: number, date: number) {
    const hourlyMeasurement = this.calcHourlyMeasurement();
    this.temp_buffer_hourly.push({
      temp: hourlyMeasurement.temp,
      humidity: hourlyMeasurement.humidity,
      date,
      hour,
    });

    if (this.temp_buffer_hourly.length > this.temp_buffer_hourly_length) {
      const n = this.temp_buffer_hourly.length - this.temp_buffer_hourly_length;
      this.temp_buffer_hourly.splice(0, n);
      assert(this.temp_buffer_hourly.length === this.temp_buffer_hourly_length);
    }
  }

  private processLine(line: string) {
    // Skip error messages and invalid lines
    if (!line.includes("temp=") || !line.includes("humidity=")) {
      return;
    }

    // Extract temperature and humidity using regex
    const tempMatch = line.match(/temp=([0-9.]+)/);
    const humidityMatch = line.match(/humidity=([0-9.]+)/);

    if (!tempMatch || !humidityMatch) {
      console.log("Could not parse temperature or humidity from line:", line);
      return;
    }

    const temp = parseFloat(tempMatch[1]);
    const humidity = parseFloat(humidityMatch[1]);

    if (isNaN(temp) || isNaN(humidity)) {
      console.log("Invalid temperature or humidity values:", temp, humidity);
      return;
    }

    const now = new Date();
    const currentMeasurementHour = now.getHours();
    const currentMeasurementDate = now.getDate();

    if (this.temp_buffer.length > 0) {
      const lastMeasurement = this.temp_buffer[this.temp_buffer.length - 1];
      const lastMeasurementHour = lastMeasurement.timestamp.getHours();

      if (lastMeasurementHour != currentMeasurementHour) {
        this.addHourlyMeasurement(
          currentMeasurementHour,
          currentMeasurementDate
        );
        this.temp_buffer = [];
      }
    }

    this.temp_buffer.push({ temp, humidity, timestamp: now });
  }

  public getHourlyMeasurements() {
    return this.temp_buffer_hourly;
  }

  public getLatestMeasurement(): {
    temp: number;
    humidity: number;
    timestamp: Date;
  } | null {
    if (this.temp_buffer.length === 0) {
      return null;
    }
    return this.temp_buffer[this.temp_buffer.length - 1];
  }

  public stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

export const temperatureManager = new TemperatureManager();
