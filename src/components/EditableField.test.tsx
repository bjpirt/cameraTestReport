import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";
import { EditableField } from "./EditableField";

describe("EditableField", () => {
  it("displays the label", () => {
    render(
      <EditableField label="Make" value="" onChange={() => {}} />
    );
    expect(screen.getByText("Make")).toBeInTheDocument();
  });

  it("displays the value when provided", () => {
    render(
      <EditableField label="Make" value="Nikon" onChange={() => {}} />
    );
    expect(screen.getByText("Nikon")).toBeInTheDocument();
  });

  it("displays placeholder when value is empty", () => {
    render(
      <EditableField
        label="Make"
        value=""
        onChange={() => {}}
        placeholder="Enter make"
      />
    );
    expect(screen.getByText("Enter make")).toBeInTheDocument();
  });

  it("switches to edit mode on click", async () => {
    const user = userEvent.setup();
    render(
      <EditableField label="Make" value="Nikon" onChange={() => {}} />
    );

    await user.click(screen.getByText("Nikon"));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Nikon");
  });

  it("calls onChange with new value on blur", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <EditableField label="Make" value="Nikon" onChange={handleChange} />
    );

    await user.click(screen.getByText("Nikon"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Canon");
    await user.tab();

    expect(handleChange).toHaveBeenCalledWith("Canon");
  });

  it("does not call onChange if value unchanged", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <EditableField label="Make" value="Nikon" onChange={handleChange} />
    );

    await user.click(screen.getByText("Nikon"));
    await user.tab();

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("reverts on Escape key", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <EditableField label="Make" value="Nikon" onChange={handleChange} />
    );

    await user.click(screen.getByText("Nikon"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Canon");
    await user.keyboard("{Escape}");

    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByText("Nikon")).toBeInTheDocument();
  });

  it("submits on Enter for text fields", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <EditableField label="Make" value="Nikon" onChange={handleChange} />
    );

    await user.click(screen.getByText("Nikon"));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Canon{Enter}");

    expect(handleChange).toHaveBeenCalledWith("Canon");
  });
});
