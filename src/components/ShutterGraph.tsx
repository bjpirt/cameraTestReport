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

interface ShutterGraphProps {
  readings: ShutterReading[];
}

export interface ShutterGraphRef {
  captureAsDataUrl: () => Promise<string | null>;
}

interface ChartDataPoint {
  expectedTime: string;
  evDiff: number | null;
  toleranceRange: [number, number];
}

function getToleranceForSpeed(expectedTime: string): number {
  // 1/125 = 8ms, speeds faster than this get ±0.333 EV tolerance
  // Slower speeds (1/125 and below) get ±0.25 EV tolerance
  const ms = fractionToMs(expectedTime);
  return ms >= 8 ? 0.25 : 0.333;
}

function prepareChartData(readings: ShutterReading[]): ChartDataPoint[] {
  return readings.map((reading) => {
    const expectedMs = fractionToMs(reading.expectedTime);
    const tolerance = getToleranceForSpeed(reading.expectedTime);
    const evDiff =
      reading.measuredMs !== null
        ? calculateEvDifference(expectedMs, reading.measuredMs)
        : null;

    return {
      expectedTime: reading.expectedTime,
      evDiff,
      toleranceRange: [-tolerance, tolerance] as [number, number],
    };
  });
}

export const ShutterGraph = forwardRef<ShutterGraphRef, ShutterGraphProps>(
  function ShutterGraph({ readings }, ref) {
    const measuredCount = readings.filter((r) => r.measuredMs !== null).length;
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
                domain={[-1, 1]}
                ticks={[-1, -0.5, 0, 0.5, 1]}
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
                formatter={(value) => {
                  if (typeof value === "number") {
                    return `${value > 0 ? "+" : ""}${value.toFixed(2)} EV`;
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
              {/* Measured EV difference line */}
              <Line
                type="monotone"
                dataKey="evDiff"
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
        <p className="text-sm text-gray-500 text-center mt-2">
          {measuredCount} of {readings.length} readings
        </p>
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
