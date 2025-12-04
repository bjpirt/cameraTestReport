import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { CameraMetadataForm } from "./CameraMetadataForm";
import { CameraMetadata, createEmptyCameraMetadata } from "../types/CameraMetadata";

describe("CameraMetadataForm", () => {
  it("renders all metadata fields", () => {
    render(
      <CameraMetadataForm
        metadata={createEmptyCameraMetadata()}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Make")).toBeInTheDocument();
    expect(screen.getByText("Model")).toBeInTheDocument();
    expect(screen.getByText("Serial Number")).toBeInTheDocument();
    expect(screen.getByText("Customer Name")).toBeInTheDocument();
    expect(screen.getByText("Service Date")).toBeInTheDocument();
  });

  it("displays metadata values", () => {
    const metadata: CameraMetadata = {
      make: "Nikon",
      model: "F3",
      serialNumber: "123456",
      customerName: "John Doe",
      serviceDate: "2025-12-04",
    };

    render(
      <CameraMetadataForm metadata={metadata} onChange={() => {}} />
    );

    expect(screen.getByText("Nikon")).toBeInTheDocument();
    expect(screen.getByText("F3")).toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("calls onChange when a field is updated", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const metadata: CameraMetadata = {
      ...createEmptyCameraMetadata(),
      make: "Nikon",
    };

    render(
      <CameraMetadataForm metadata={metadata} onChange={handleChange} />
    );

    await user.click(screen.getByText("Nikon"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Canon");
    await user.tab();

    expect(handleChange).toHaveBeenCalledWith({
      ...metadata,
      make: "Canon",
    });
  });
});
