import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { ShutterReadingsTable } from "./ShutterReadingsTable";
import { ShutterReading } from "../types/ShutterReading";

describe("ShutterReadingsTable", () => {
  const mockReadings: ShutterReading[] = [
    { id: "1", expectedTime: "1/1000", measuredMs: null },
    { id: "2", expectedTime: "1/500", measuredMs: 2.1 },
    { id: "3", expectedTime: "1/250", measuredMs: 4 },
  ];

  it("renders table headers", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    expect(screen.getByText("Expected")).toBeInTheDocument();
    expect(screen.getByText("Measured (ms)")).toBeInTheDocument();
    expect(screen.getByText("Actual")).toBeInTheDocument();
    expect(screen.getByText("EV Diff")).toBeInTheDocument();
  });

  it("displays expected times", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    expect(screen.getByText("1/1000")).toBeInTheDocument();
    expect(screen.getByText("1/500")).toBeInTheDocument();
    // 1/250 appears twice (expected and actual when measurement = 4ms)
    expect(screen.getAllByText("1/250")).toHaveLength(2);
  });

  it("displays measured values when present", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    expect(screen.getByDisplayValue("2.1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
  });

  it("displays calculated actual time as fraction", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    // 2.1ms ≈ 1/476
    expect(screen.getByText("1/476")).toBeInTheDocument();
    // 4ms = 1/250 (appears twice - expected and actual)
    expect(screen.getAllByText("1/250")).toHaveLength(2);
  });

  it("displays EV difference", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    // 1/500 expected (2ms) vs 2.1ms actual = slight underexposure
    // EV diff = log2(2/2.1) ≈ -0.07
    const evCells = screen.getAllByText(/-?\d+\.\d+/);
    expect(evCells.length).toBeGreaterThan(0);
  });

  it("calls onChange when measured value is updated", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const readings: ShutterReading[] = [
      { id: "1", expectedTime: "1/1000", measuredMs: null },
    ];

    render(
      <ShutterReadingsTable readings={readings} onChange={handleChange} />
    );

    const input = screen.getByPlaceholderText("—");
    await user.type(input, "5");

    expect(handleChange).toHaveBeenCalledWith([
      { id: "1", expectedTime: "1/1000", measuredMs: 5 },
    ]);
  });

  it("shows dash for unmeasured readings in actual and EV columns", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    // The first row has no measurement, should show dashes
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(2); // actual and EV diff
  });
});
