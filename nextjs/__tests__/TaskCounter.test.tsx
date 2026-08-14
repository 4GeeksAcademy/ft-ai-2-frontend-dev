import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TaskCounter } from "@/components/TaskCounter";

describe("TaskCounter", () => {
  it('shows "No tasks yet" when total is 0', () => {
    render(<TaskCounter total={0} completed={0} />);
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
  });

  it("shows correct counts for partial completion", () => {
    render(<TaskCounter total={3} completed={2} />);
    expect(screen.getByText("Showing 2 of 3 tasks completed")).toBeInTheDocument();
  });

  it("shows all complete message when all tasks are done", () => {
    render(<TaskCounter total={3} completed={3} />);
    expect(screen.getByText(/All tasks completed!/)).toBeInTheDocument();
  });

  it("shows all complete for a single task", () => {
    render(<TaskCounter total={1} completed={1} />);
    expect(screen.getByText(/All tasks completed!/)).toBeInTheDocument();
  });
});