"use client";

import { useState } from "react";

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [inputValue, setInputValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInputValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 placeholder-zinc-500 outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-emerald-500"
        aria-label="New task title"
      />
      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white transition hover:bg-emerald-500"
      >
        Add
      </button>
    </form>
  );
}