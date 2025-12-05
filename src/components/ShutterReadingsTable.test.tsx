import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { ShutterReadingsTable } from "./ShutterReadingsTable";
import { ShutterReading } from "../types/ShutterReading";

describe("ShutterReadingsTable", () => {
  const mockReadings: ShutterReading[] = [
    { id: "1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [] },
    { id: "2", expectedTime: "1/500", beforeSamples: [], measurementSamples: [2.1] },
    { id: "3", expectedTime: "1/250", beforeSamples: [], measurementSamples: [4] },
  ];

  describe("with showBeforeColumn=false (default mode)", () => {
    it("renders table headers with Actual column", () => {
      render(
        <ShutterReadingsTable readings={mockReadings} onChange={() => {}} showBeforeColumn={false} showMultipleMeasurements={false} />
      );

      expect(screen.getByText("Expected")).toBeInTheDocument();
      expect(screen.getByText("Actual (ms)")).toBeInTheDocument();
      expect(screen.getByText("EV Diff")).toBeInTheDocument();
      expect(screen.queryByText("Before (ms)")).not.toBeInTheDocument();
      expect(screen.queryByText("After (ms)")).not.toBeInTheDocument();
    });

    it("displays expected times", () => {
      render(
        <ShutterReadingsTable readings={mockReadings} onChange={() => {}} showBeforeColumn={false} showMultipleMeasurements={false} />
      );

      expect(screen.getByText("1/1000")).toBeInTheDocument();
      expect(screen.getAllByText("1/500").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("1/250").length).toBeGreaterThanOrEqual(1);
    });

    it("displays measured values when present", () => {
      render(
        <ShutterReadingsTable readings={mockReadings} onChange={() => {}} showBeforeColumn={false} showMultipleMeasurements={false} />
      );

      expect(screen.getByDisplayValue("2.1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("4")).toBeInTheDocument();
    });

    it("calls onChange when actual value is updated", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const readings: ShutterReading[] = [
        { id: "1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [] },
      ];

      render(
        <ShutterReadingsTable readings={readings} onChange={handleChange} showBeforeColumn={false} showMultipleMeasurements={false} />
      );

      const input = screen.getByPlaceholderText("—");
      await user.type(input, "5");

      expect(handleChange).toHaveBeenCalledWith([
        { id: "1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [5] },
      ]);
    });
  });

  describe("with showBeforeColumn=true (before/after mode)", () => {
    it("renders table headers with Before and After columns", () => {
      render(
        <ShutterReadingsTable readings={mockReadings} onChange={() => {}} showBeforeColumn={true} showMultipleMeasurements={false} />
      );

      expect(screen.getByText("Expected")).toBeInTheDocument();
      expect(screen.getByText("Before (ms)")).toBeInTheDocument();
      expect(screen.getByText("After (ms)")).toBeInTheDocument();
      expect(screen.getByText("EV Diff")).toBeInTheDocument();
      expect(screen.queryByText("Actual (ms)")).not.toBeInTheDocument();
    });

    it("displays measured values when present", () => {
      render(
        <ShutterReadingsTable readings={mockReadings} onChange={() => {}} showBeforeColumn={true} showMultipleMeasurements={false} />
      );

      expect(screen.getByDisplayValue("2.1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("4")).toBeInTheDocument();
    });

    it("displays EV difference", () => {
      render(
        <ShutterReadingsTable readings={mockReadings} onChange={() => {}} showBeforeColumn={true} showMultipleMeasurements={false} />
      );

      const evCells = screen.getAllByText(/-?\d+\.\d+/);
      expect(evCells.length).toBeGreaterThan(0);
    });

    it("calls onChange when after value is updated", async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      const readings: ShutterReading[] = [
        { id: "1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [] },
      ];

      render(
        <ShutterReadingsTable readings={readings} onChange={handleChange} showBeforeColumn={true} showMultipleMeasurements={false} />
      );

      // Get the second input (after field - first is before)
      const inputs = screen.getAllByPlaceholderText("—");
      await user.type(inputs[1], "5");

      expect(handleChange).toHaveBeenCalledWith([
        { id: "1", expectedTime: "1/1000", beforeSamples: [], measurementSamples: [5] },
      ]);
    });

    it("shows dash for unmeasured readings in EV column", () => {
      render(
        <ShutterReadingsTable readings={mockReadings} onChange={() => {}} showBeforeColumn={true} showMultipleMeasurements={false} />
      );

      // The first row has no after measurement, should show dash in EV diff
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBe(1); // just EV diff for first row
    });
  });
});
