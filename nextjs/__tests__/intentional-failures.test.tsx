import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TaskItem } from "@/components/TaskItem";
import { TaskList } from "@/components/TaskList";
import { AddTaskForm } from "@/components/AddTaskForm";
import type { Task } from "@/lib/types";

// ---------------------------------------------------------------------------
// These tests FAIL intentionally — they demonstrate common testing mistakes.
// ---------------------------------------------------------------------------

describe("INTENTIONAL FAILURES — TaskItem", () => {
  const task: Task = { id: "1", title: "Buy groceries", completed: false };

  it("expects wrong task text (INTENTIONAL FAIL)", () => {
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />);
    // FAILS: "Walk the dog" is not rendered — "Buy groceries" is
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("expects checkbox to be checked when it isn't (INTENTIONAL FAIL)", () => {
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />);
    // FAILS: task.completed is false, so checkbox is unchecked
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});

describe("INTENTIONAL FAILURES — TaskList", () => {
  const tasks: Task[] = [
    { id: "1", title: "A", completed: false },
    { id: "2", title: "B", completed: true },
  ];

  it("expects wrong number of list items (INTENTIONAL FAIL)", () => {
    render(<TaskList tasks={tasks} onToggle={vi.fn()} onDelete={vi.fn()} />);
    // FAILS: there are 2 items, not 5
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
  });
});

describe("INTENTIONAL FAILURES — AddTaskForm", () => {
  it("submits even with empty input — no guard (INTENTIONAL FAIL)", async () => {
    // Note: this test DELIBERATELY forgets to set up userEvent
    // and just checks the form rendered — it passes vacuously.
    // The real bug is that we're not testing what happens on submit.
    render(<AddTaskForm onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText("What needs to be done?")).toBeInTheDocument();
    // No assertion about onAdd not being called — weak test
  });
});