import { render, screen } from "@testing-library/react";
import { ShutterTestSection } from "./ShutterTestSection";
import { createDefaultReadings } from "../types/ShutterReading";

describe("ShutterTestSection", () => {
  it("renders table and graph sections", () => {
    render(
      <ShutterTestSection
        readings={createDefaultReadings()}
        onChange={() => {}}
        showBeforeColumn={false}
        onShowBeforeColumnChange={() => {}}
        showMultipleMeasurements={false}
        onShowMultipleMeasurementsChange={() => {}}
      />
    );

    expect(screen.getByText("Shutter Speed Readings")).toBeInTheDocument();
    expect(screen.getByText("Shutter Speed Graph")).toBeInTheDocument();
  });

  it("displays expected shutter speeds in table", () => {
    render(
      <ShutterTestSection
        readings={createDefaultReadings()}
        onChange={() => {}}
        showBeforeColumn={false}
        onShowBeforeColumnChange={() => {}}
        showMultipleMeasurements={false}
        onShowMultipleMeasurementsChange={() => {}}
      />
    );

    expect(screen.getByText("1/1000")).toBeInTheDocument();
    expect(screen.getByText("1/500")).toBeInTheDocument();
    expect(screen.getByText("1/60")).toBeInTheDocument();
  });

  it("renders before and after checkbox", () => {
    render(
      <ShutterTestSection
        readings={createDefaultReadings()}
        onChange={() => {}}
        showBeforeColumn={false}
        onShowBeforeColumnChange={() => {}}
        showMultipleMeasurements={false}
        onShowMultipleMeasurementsChange={() => {}}
      />
    );

    expect(screen.getByText("Before and After")).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked(); // Before and After checkbox
  });

  it("shows checkbox as checked when showBeforeColumn is true", () => {
    render(
      <ShutterTestSection
        readings={createDefaultReadings()}
        onChange={() => {}}
        showBeforeColumn={true}
        onShowBeforeColumnChange={() => {}}
        showMultipleMeasurements={false}
        onShowMultipleMeasurementsChange={() => {}}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked(); // Before and After checkbox
  });

  it("renders multiple measurements checkbox", () => {
    render(
      <ShutterTestSection
        readings={createDefaultReadings()}
        onChange={() => {}}
        showBeforeColumn={false}
        onShowBeforeColumnChange={() => {}}
        showMultipleMeasurements={false}
        onShowMultipleMeasurementsChange={() => {}}
      />
    );

    expect(screen.getByText("Multiple Measurements")).toBeInTheDocument();
  });
});
