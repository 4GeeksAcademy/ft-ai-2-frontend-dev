import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AddTaskForm } from "@/components/AddTaskForm";

describe("AddTaskForm", () => {
  let onAdd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onAdd = vi.fn();
  });

  it("renders input and submit button", () => {
    render(<AddTaskForm onAdd={onAdd} />);
    expect(screen.getByPlaceholderText("What needs to be done?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("calls onAdd with the input text", async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);
    await user.type(screen.getByPlaceholderText("What needs to be done?"), "Write code");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith("Write code");
  });

  it("clears input after submission", async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);
    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "Write code");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(input).toHaveValue("");
  });

  it("does not call onAdd for empty input", async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("trims whitespace and submits", async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);
    await user.type(screen.getByPlaceholderText("What needs to be done?"), "   Task   ");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith("Task");
  });
});