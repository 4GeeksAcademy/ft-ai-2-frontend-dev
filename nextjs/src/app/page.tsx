"use client";

import { useState, useEffect, useCallback } from "react";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskList } from "@/components/TaskList";
import { TaskCounter } from "@/components/TaskCounter";
import type { Task } from "@/lib/types";
import * as api from "@/lib/api";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  const handleAdd = useCallback(async (title: string) => {
    const newTask = await api.addTask(title);
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const handleToggle = useCallback(async (id: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
    // Sync with API
    const updated = await api.toggleTask(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-zinc-100">
        ✅ Task Tracker
      </h1>

      <div className="mb-6">
        <AddTaskForm onAdd={handleAdd} />
      </div>

      {loading ? (
        <p className="py-8 text-center text-zinc-500">Loading tasks...</p>
      ) : (
        <>
          <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
          <div className="mt-4">
            <TaskCounter total={tasks.length} completed={completedCount} />
          </div>
        </>
      )}
    </div>
  );
}
