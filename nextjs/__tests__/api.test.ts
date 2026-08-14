import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "@/lib/api";
import type { Task } from "@/lib/types";

const initialTasks: Task[] = [
  { id: "1", title: "Buy groceries", completed: false },
  { id: "2", title: "Finish homework", completed: true },
];

vi.mock("@/lib/api", () => {
  let nextId = 4;
  let mockTasks: Task[] = [];

  const mockModule = {
    fetchTasks: vi.fn(async () => [...mockTasks]),
    addTask: vi.fn(async (title: string) => {
      const task: Task = { id: String(nextId++), title, completed: false };
      mockTasks.push(task);
      return task;
    }),
    toggleTask: vi.fn(async (id: string) => {
      const task = mockTasks.find((t) => t.id === id);
      if (!task) throw new Error(`Task ${id} not found`);
      task.completed = !task.completed;
      return { ...task };
    }),
    deleteTask: vi.fn(async (id: string) => {
      mockTasks = mockTasks.filter((t) => t.id !== id);
    }),
    __reset: () => {
      nextId = 4;
      mockTasks = [...initialTasks];
    },
  };

  return mockModule;
});

describe("API module (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api as any).__reset();
  });

  it("fetchTasks returns task list", async () => {
    const tasks = await api.fetchTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe("Buy groceries");
  });

  it("addTask creates a new task", async () => {
    const task = await api.addTask("New task");
    expect(task.title).toBe("New task");
    expect(task.completed).toBe(false);
    expect(task.id).toBeDefined();
  });

  it("toggleTask flips completed status", async () => {
    const toggled = await api.toggleTask("1");
    expect(toggled.completed).toBe(true);
  });

  it("toggleTask throws for unknown id", async () => {
    await expect(api.toggleTask("999")).rejects.toThrow("Task 999 not found");
  });

  it("deleteTask removes a task", async () => {
    await api.deleteTask("1");
    const tasks = await api.fetchTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe("2");
  });
});