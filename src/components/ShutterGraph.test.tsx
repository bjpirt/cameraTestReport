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
    render(<ShutterGraph readings={readings} showBeforeColumn={false} />);

    expect(screen.getByText("Shutter Speed Graph")).toBeInTheDocument();
  });

  it("renders chart container", () => {
    const readings: ShutterReading[] = [
      { id: "1", expectedTime: "1/1000", beforeMs: null, measuredMs: 1 },
      { id: "2", expectedTime: "1/500", beforeMs: null, measuredMs: null },
    ];
    render(<ShutterGraph readings={readings} showBeforeColumn={false} />);

    expect(document.getElementById("shutter-graph-container")).toBeInTheDocument();
  });

  it("renders chart container with before column enabled", () => {
    const readings: ShutterReading[] = [
      { id: "1", expectedTime: "1/1000", beforeMs: 1.2, measuredMs: 1 },
      { id: "2", expectedTime: "1/500", beforeMs: 2.1, measuredMs: 2 },
    ];
    render(<ShutterGraph readings={readings} showBeforeColumn={true} />);

    expect(document.getElementById("shutter-graph-container")).toBeInTheDocument();
  });
});
