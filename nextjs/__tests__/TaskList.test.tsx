import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TaskList } from "@/components/TaskList";
import type { Task } from "@/lib/types";

const sampleTasks: Task[] = [
  { id: "1", title: "Buy groceries", completed: false },
  { id: "2", title: "Finish homework", completed: true },
  { id: "3", title: "Walk the dog", completed: false },
];

describe("TaskList", () => {
  const onToggle = vi.fn();
  const onDelete = vi.fn();

  it("renders all tasks", () => {
    render(<TaskList tasks={sampleTasks} onToggle={onToggle} onDelete={onDelete} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Finish homework")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("renders the correct number of list items", () => {
    render(<TaskList tasks={sampleTasks} onToggle={onToggle} onDelete={onDelete} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("shows empty state when no tasks", () => {
    render(<TaskList tasks={[]} onToggle={onToggle} onDelete={onDelete} />);
    expect(screen.getByText("No tasks yet. Add one above!")).toBeInTheDocument();
  });

  it("passes toggle to TaskItem (integration smoke)", async () => {
    const user = userEvent.setup();
    render(<TaskList tasks={sampleTasks} onToggle={onToggle} onDelete={onDelete} />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledWith("1");
  });
});