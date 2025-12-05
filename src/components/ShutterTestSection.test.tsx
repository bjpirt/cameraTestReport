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
      />
    );

    expect(screen.getByText("Before and After")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("shows checkbox as checked when showBeforeColumn is true", () => {
    render(
      <ShutterTestSection
        readings={createDefaultReadings()}
        onChange={() => {}}
        showBeforeColumn={true}
        onShowBeforeColumnChange={() => {}}
      />
    );

    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
