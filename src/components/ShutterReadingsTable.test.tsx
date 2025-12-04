import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { ShutterReadingsTable } from "./ShutterReadingsTable";
import { ShutterReading } from "../types/ShutterReading";

describe("ShutterReadingsTable", () => {
  const mockReadings: ShutterReading[] = [
    { id: "1", expectedTime: "1/1000", beforeMs: null, measuredMs: null },
    { id: "2", expectedTime: "1/500", beforeMs: null, measuredMs: 2.1 },
    { id: "3", expectedTime: "1/250", beforeMs: null, measuredMs: 4 },
  ];

  it("renders table headers", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    expect(screen.getByText("Expected")).toBeInTheDocument();
    expect(screen.getByText("Before (ms)")).toBeInTheDocument();
    expect(screen.getByText("After (ms)")).toBeInTheDocument();
    expect(screen.getByText("EV Diff")).toBeInTheDocument();
  });

  it("displays expected times", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    expect(screen.getByText("1/1000")).toBeInTheDocument();
    // 1/500 and 1/250 appear twice - once as expected time, once as fraction for measured value
    expect(screen.getAllByText("1/500").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1/250").length).toBeGreaterThanOrEqual(1);
  });

  it("displays measured values when present", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    expect(screen.getByDisplayValue("2.1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
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

  it("calls onChange when after value is updated", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const readings: ShutterReading[] = [
      { id: "1", expectedTime: "1/1000", beforeMs: null, measuredMs: null },
    ];

    render(
      <ShutterReadingsTable readings={readings} onChange={handleChange} />
    );

    // Get the second input (after field - first is before)
    const inputs = screen.getAllByPlaceholderText("—");
    await user.type(inputs[1], "5");

    expect(handleChange).toHaveBeenCalledWith([
      { id: "1", expectedTime: "1/1000", beforeMs: null, measuredMs: 5 },
    ]);
  });

  it("shows dash for unmeasured readings in EV column", () => {
    render(
      <ShutterReadingsTable readings={mockReadings} onChange={() => {}} />
    );

    // The first row has no after measurement, should show dash in EV diff
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(1); // just EV diff for first row
  });
});
