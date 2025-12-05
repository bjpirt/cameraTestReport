import { render, screen } from "@testing-library/react";
import { ShutterGraph } from "./ShutterGraph";
import { ShutterReading } from "../types/ShutterReading";

// Mock ResizeObserver for Recharts ResponsiveContainer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("ShutterGraph", () => {
  it("renders graph title", () => {
    const readings: ShutterReading[] = [];
    render(<ShutterGraph readings={readings} showBeforeColumn={false} showMultipleMeasurements={false} />);

    expect(screen.getByText("Shutter Speed Graph")).toBeInTheDocument();
  });

  it("renders chart container", () => {
    const readings: ShutterReading[] = [
      { id: "1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [1] },
      { id: "2", expectedTime: "1/500", beforeSamples: [], measurementSamples: [] },
    ];
    render(<ShutterGraph readings={readings} showBeforeColumn={false} showMultipleMeasurements={false} />);

    expect(document.getElementById("shutter-graph-container")).toBeInTheDocument();
  });

  it("renders chart container with before column enabled", () => {
    const readings: ShutterReading[] = [
      { id: "1", expectedTime: "1/1000", beforeSamples: [1.2], measurementSamples: [1] },
      { id: "2", expectedTime: "1/500", beforeSamples: [2.1], measurementSamples: [2] },
    ];
    render(<ShutterGraph readings={readings} showBeforeColumn={true} showMultipleMeasurements={false} />);

    expect(document.getElementById("shutter-graph-container")).toBeInTheDocument();
  });
});
