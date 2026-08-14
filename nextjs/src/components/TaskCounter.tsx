interface TaskCounterProps {
  total: number;
  completed: number;
}

export function TaskCounter({ total, completed }: TaskCounterProps) {
  if (total === 0) {
    return <p className="text-sm text-zinc-500">No tasks yet.</p>;
  }

  const allComplete = total > 0 && completed === total;
  const display = allComplete
    ? "All tasks completed! 🎉"
    : `Showing ${completed} of ${total} tasks completed`;

  return (
    <p className={`text-sm ${allComplete ? "text-emerald-400" : "text-zinc-500"}`}>
      {display}
    </p>
  );
}