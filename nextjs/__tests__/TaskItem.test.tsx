import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TaskItem } from "@/components/TaskItem";

describe("TaskItem", () => {
  const mockTask = { id: "1", title: "Buy groceries", completed: false };
  const onToggle = vi.fn();
  const onDelete = vi.fn();

  it("renders the task title", () => {
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={onDelete} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
  });

  it("renders an unchecked checkbox for incomplete tasks", () => {
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={onDelete} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("renders a checked checkbox for completed tasks", () => {
    render(
      <TaskItem
        task={{ ...mockTask, completed: true }}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("applies line-through style when completed", () => {
    render(
      <TaskItem
        task={{ ...mockTask, completed: true }}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    );
    const title = screen.getByText("Buy groceries");
    expect(title.className).toContain("line-through");
  });

  it("calls onToggle when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={onDelete} />);
    await user.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});