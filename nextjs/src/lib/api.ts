/** Simulated API layer — in-memory storage for the demo. */

import type { Task } from "./types";

// In-memory task store (seeded with sample data)
let nextId = 4;
let tasks: Task[] = [
  { id: "1", title: "Buy groceries", completed: false },
  { id: "2", title: "Finish homework", completed: true },
  { id: "3", title: "Walk the dog", completed: false },
];

/** Simulate network delay (200–400ms). */
function delay(): Promise<void> {
  const ms = 200 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch all tasks. */
export async function fetchTasks(): Promise<Task[]> {
  await delay();
  return [...tasks];
}

/** Add a new task. */
export async function addTask(title: string): Promise<Task> {
  await delay();
  const task: Task = { id: String(nextId++), title, completed: false };
  tasks.push(task);
  return task;
}

/** Toggle a task's completed status. */
export async function toggleTask(id: string): Promise<Task> {
  await delay();
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task ${id} not found`);
  task.completed = !task.completed;
  return { ...task };
}

/** Delete a task. */
export async function deleteTask(id: string): Promise<void> {
  await delay();
  tasks = tasks.filter((t) => t.id !== id);
}