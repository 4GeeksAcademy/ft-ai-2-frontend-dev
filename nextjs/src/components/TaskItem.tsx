"use client";

import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg bg-zinc-800 px-4 py-3">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="h-5 w-5 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500"
        aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
      />
      <span
        className={`flex-1 text-zinc-100 ${task.completed ? "text-zinc-500 line-through" : ""}`}
      >
        {task.title}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="rounded px-3 py-1 text-sm text-red-400 transition hover:bg-red-900/50 hover:text-red-300"
        aria-label={`Delete "${task.title}"`}
      >
        Delete
      </button>
    </li>
  );
}