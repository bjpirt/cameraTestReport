import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsPerformed } from "./ActionsPerformed";

describe("ActionsPerformed", () => {
  it("renders the title", () => {
    render(<ActionsPerformed actions={[]} onChange={() => {}} />);
    expect(screen.getByText("Actions Performed")).toBeInTheDocument();
  });

  it("shows empty state when no actions", () => {
    render(<ActionsPerformed actions={[]} onChange={() => {}} />);
    expect(screen.getByText("No actions recorded")).toBeInTheDocument();
  });

  it("displays existing actions", () => {
    const actions = ["Cleaned shutter", "Lubricated mechanism"];
    render(<ActionsPerformed actions={actions} onChange={() => {}} />);

    expect(screen.getByText("Cleaned shutter")).toBeInTheDocument();
    expect(screen.getByText("Lubricated mechanism")).toBeInTheDocument();
  });

  it("adds new action when Add button clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ActionsPerformed actions={[]} onChange={onChange} />);

    const input = screen.getByPlaceholderText("Enter action...");
    await user.type(input, "Replaced curtain");
    await user.click(screen.getByText("Add"));

    expect(onChange).toHaveBeenCalledWith(["Replaced curtain"]);
  });

  it("adds new action when Enter pressed", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ActionsPerformed actions={[]} onChange={onChange} />);

    const input = screen.getByPlaceholderText("Enter action...");
    await user.type(input, "Adjusted timing{Enter}");

    expect(onChange).toHaveBeenCalledWith(["Adjusted timing"]);
  });

  it("clears input after adding action", async () => {
    const user = userEvent.setup();
    render(<ActionsPerformed actions={[]} onChange={() => {}} />);

    const input = screen.getByPlaceholderText("Enter action...");
    await user.type(input, "Test action{Enter}");

    expect(input).toHaveValue("");
  });

  it("does not add empty actions", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ActionsPerformed actions={[]} onChange={onChange} />);

    await user.click(screen.getByText("Add"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes action when remove button clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const actions = ["Action 1", "Action 2"];
    render(<ActionsPerformed actions={actions} onChange={onChange} />);

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove action",
    });
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(["Action 2"]);
  });

  it("appends new actions to existing list", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const existingActions = ["Existing action"];
    render(
      <ActionsPerformed actions={existingActions} onChange={onChange} />
    );

    const input = screen.getByPlaceholderText("Enter action...");
    await user.type(input, "New action{Enter}");

    expect(onChange).toHaveBeenCalledWith(["Existing action", "New action"]);
  });
});
