import { render, screen } from "@testing-library/react";
import { ShutterGraph } from "./ShutterGraph";
import { ShutterReading } from "../types/ShutterReading";

describe("ShutterGraph", () => {
  it("renders placeholder text", () => {
    const readings: ShutterReading[] = [];
    render(<ShutterGraph readings={readings} />);

    expect(screen.getByText("Graph Placeholder")).toBeInTheDocument();
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
