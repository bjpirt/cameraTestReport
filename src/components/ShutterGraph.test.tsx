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
    render(<ShutterGraph readings={readings} />);

    expect(screen.getByText("Shutter Speed Graph")).toBeInTheDocument();
  });

  it("shows reading count", () => {
    const readings: ShutterReading[] = [
      { id: "1", expectedTime: "1/1000", measuredMs: 1 },
      { id: "2", expectedTime: "1/500", measuredMs: null },
    ];
    render(<ShutterGraph readings={readings} />);

    expect(screen.getByText(/1 of 2 readings/)).toBeInTheDocument();
  });
});
