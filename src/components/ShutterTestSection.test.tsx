import { render, screen } from "@testing-library/react";
import { ShutterTestSection } from "./ShutterTestSection";
import { createDefaultReadings } from "../types/ShutterReading";

describe("ShutterTestSection", () => {
  it("renders table and graph sections", () => {
    render(
      <ShutterTestSection
        readings={createDefaultReadings()}
        onChange={() => {}}
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
      />
    );

    expect(screen.getByText("1/1000")).toBeInTheDocument();
    expect(screen.getByText("1/500")).toBeInTheDocument();
    expect(screen.getByText("1/60")).toBeInTheDocument();
  });
});
