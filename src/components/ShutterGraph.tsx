import React, { forwardRef } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ShutterReading } from "../types/ShutterReading";
import { fractionToMs, calculateEvDifference } from "../utils/shutter";
import { calculateAverage, calculateStdDev } from "../utils/statistics";

interface ShutterGraphProps {
  readings: ShutterReading[];
  showBeforeColumn: boolean;
  showMultipleMeasurements: boolean;
}

export interface ShutterGraphRef {
  captureAsDataUrl: () => Promise<string | null>;
}

interface ChartDataPoint {
  expectedTime: string;
  beforeEvDiff: number | null;
  afterEvDiff: number | null;
  toleranceRange: [number, number];
  // Variance band for multiple measurements
  afterEvVarianceRange: [number, number] | null;
  beforeEvVarianceRange: [number, number] | null;
}

function getToleranceForSpeed(expectedTime: string): number {
  // 1/125 = 8ms, speeds faster than this get ±0.333 EV tolerance
  // Slower speeds (1/125 and below) get ±0.25 EV tolerance
  const ms = fractionToMs(expectedTime);
  return ms >= 8 ? 0.25 : 0.333;
}

// Calculate variance range in EV for visualization
function calculateEvVarianceRange(
  expectedMs: number,
  samples: number[]
): [number, number] | null {
  const avg = calculateAverage(samples);
  const stdDev = calculateStdDev(samples);
  if (avg === null || stdDev === null) return null;

  // Calculate ±1σ range in EV
  // Use avg ± stdDev in ms, then convert to EV
  const lowMs = Math.max(0.001, avg - stdDev);
  const highMs = avg + stdDev;
  const lowEv = calculateEvDifference(expectedMs, lowMs);
  const highEv = calculateEvDifference(expectedMs, highMs);

  return [Math.min(lowEv, highEv), Math.max(lowEv, highEv)];
}

function prepareChartData(readings: ShutterReading[]): ChartDataPoint[] {
  return readings.map((reading) => {
    const expectedMs = fractionToMs(reading.expectedTime);
    const tolerance = getToleranceForSpeed(reading.expectedTime);

    // Use average for EV calculations
    const beforeAvg = calculateAverage(reading.beforeSamples);
    const afterAvg = calculateAverage(reading.measurementSamples);

    const beforeEvDiff =
      beforeAvg !== null ? calculateEvDifference(expectedMs, beforeAvg) : null;
    const afterEvDiff =
      afterAvg !== null ? calculateEvDifference(expectedMs, afterAvg) : null;

    // Calculate variance ranges for multiple measurements
    const afterEvVarianceRange = calculateEvVarianceRange(
      expectedMs,
      reading.measurementSamples
    );
    const beforeEvVarianceRange = calculateEvVarianceRange(
      expectedMs,
      reading.beforeSamples
    );

    return {
      expectedTime: reading.expectedTime,
      beforeEvDiff,
      afterEvDiff,
      toleranceRange: [-tolerance, tolerance] as [number, number],
      afterEvVarianceRange,
      beforeEvVarianceRange,
    };
  });
}

export const ShutterGraph = forwardRef<ShutterGraphRef, ShutterGraphProps>(
  function ShutterGraph({ readings, showBeforeColumn, showMultipleMeasurements }, ref) {
    // Reverse so slower speeds (1s) are on the left, faster (1/1000) on the right
    const chartData = prepareChartData(readings).reverse();

    // Expose capture method via ref
    React.useImperativeHandle(ref, () => ({
      captureAsDataUrl: async () => {
        const container = document.getElementById("shutter-graph-container");
        if (!container) return null;

        const svg = container.querySelector("svg");
        if (!svg) return null;

        return svgToDataUrl(svg as SVGElement);
      },
    }));

    return (
      <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Shutter Speed Graph
        </h2>
        <div id="shutter-graph-container" className="flex-1 min-h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="expectedTime"
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: "#9ca3af" }}
                axisLine={{ stroke: "#9ca3af" }}
              />
              <YAxis
                domain={[-0.5, 0.5]}
                ticks={[-0.5, -0.25, 0, 0.25, 0.5]}
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: "#9ca3af" }}
                axisLine={{ stroke: "#9ca3af" }}
                tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}`}
                label={{
                  value: "EV",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fontSize: 12 },
                }}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (typeof value === "number") {
                    const label = showBeforeColumn
                      ? name === "beforeEvDiff" ? "Before" : "After"
                      : "Actual";
                    return [`${value > 0 ? "+" : ""}${value.toFixed(2)} EV`, label];
                  }
                  return "—";
                }}
                labelFormatter={(label) => `Expected: ${label}`}
              />
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1} />
              {/* Tolerance band */}
              <Area
                type="step"
                dataKey="toleranceRange"
                stroke="none"
                fill="#22c55e"
                fillOpacity={0.2}
                isAnimationActive={false}
              />
              {/* Variance band for After/Actual measurements - only when multiple measurements enabled */}
              {showMultipleMeasurements && (
                <Area
                  type="monotone"
                  dataKey="afterEvVarianceRange"
                  stroke="none"
                  fill="#2563eb"
                  fillOpacity={0.2}
                  isAnimationActive={false}
                />
              )}
              {/* Variance band for Before measurements - only when both showBeforeColumn and showMultipleMeasurements are true */}
              {showBeforeColumn && showMultipleMeasurements && (
                <Area
                  type="monotone"
                  dataKey="beforeEvVarianceRange"
                  stroke="none"
                  fill="#9ca3af"
                  fillOpacity={0.2}
                  isAnimationActive={false}
                />
              )}
              {/* Before EV difference line (grey) - only shown when showBeforeColumn is true */}
              {showBeforeColumn && (
                <Line
                  type="monotone"
                  dataKey="beforeEvDiff"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  dot={{ fill: "#9ca3af", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#6b7280" }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              )}
              {/* After/Actual EV difference line (blue) */}
              <Line
                type="monotone"
                dataKey="afterEvDiff"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#1d4ed8" }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

async function svgToDataUrl(svgElement: SVGElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const svgRect = svgElement.getBoundingClientRect();
    const scale = 2;
    canvas.width = svgRect.width * scale;
    canvas.height = svgRect.height * scale;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, svgRect.width, svgRect.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image"));
    };
    img.src = url;
  });
}
