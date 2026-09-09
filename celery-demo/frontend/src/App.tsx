import { useState } from "react";
import "./App.css";

const API_BASE = "/api";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type Status = "idle" | "pending" | "complete" | "error";

interface TaskState {
  status: Status;
  taskId: string | null;
  result: unknown;
  error: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
async function postTask(endpoint: string): Promise<string> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(await res.text());
  const body = await res.json();
  return body.task_id as string;
}

async function pollTask(
  taskId: string,
  signal: AbortSignal,
): Promise<unknown> {
  for (;;) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, { signal });
    if (!res.ok) throw new Error(await res.text());
    const body = await res.json();
    if (body.status === "SUCCESS") return body.result;
    if (body.status === "FAILURE") throw new Error(body.detail ?? "Task failed");
    // still pending – wait 1 second before polling again
    await new Promise((r) => setTimeout(r, 1_000));
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function App() {
  const [crunch, setCrunch] = useState<TaskState>({
    status: "idle",
    taskId: null,
    result: null,
    error: null,
  });
  const [chain, setChain] = useState<TaskState>({
    status: "idle",
    taskId: null,
    result: null,
    error: null,
  });

  async function handleRun(
    label: string,
    endpoint: string,
    setter: typeof setCrunch,
  ) {
    setter({ status: "pending", taskId: null, result: null, error: null });
    const abort = new AbortController();

    try {
      const taskId = await postTask(endpoint);
      setter((prev) => ({ ...prev, taskId }));
      const result = await pollTask(taskId, abort.signal);
      setter({ status: "complete", taskId, result, error: null });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setter({
        status: "error",
        taskId: null,
        result: null,
        error: String(err),
      });
    }
  }

  return (
    <main className="app">
      <h1>🧪 Celery Demo</h1>
      <p className="subtitle">
        Click a button to dispatch a background task. The frontend polls until
        it completes.
      </p>

      <section className="card">
        <h2>Single task</h2>
        <p>Runs <code>crunch_data</code> – sleeps 5‑10 seconds, then returns.</p>
        <button
          disabled={crunch.status === "pending"}
          onClick={() => handleRun("Crunch", "/tasks/crunch", setCrunch)}
        >
          {crunch.status === "pending" ? "⏳ Running…" : "🔥 Crunch"}
        </button>
        <Output state={crunch} />
      </section>

      <section className="card">
        <h2>Task chain</h2>
        <p>
          Runs <code>crunch_data → process_result</code>. The second task
          enriches the output of the first.
        </p>
        <button
          disabled={chain.status === "pending"}
          onClick={() => handleRun("Chain", "/tasks/chain", setChain)}
        >
          {chain.status === "pending" ? "⏳ Running…" : "⛓️ Chain"}
        </button>
        <Output state={chain} />
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Output helper                                                     */
/* ------------------------------------------------------------------ */
function Output({ state }: { state: TaskState }) {
  if (state.status === "idle") return null;

  return (
    <div className="output">
      {state.taskId && (
        <p className="task-id">
          Task ID: <code>{state.taskId}</code>
        </p>
      )}

      {state.status === "pending" && <p className="pending">⏳ Waiting for result…</p>}

      {state.status === "complete" && (
        <div className="result">
          <p>✅ Result:</p>
          <pre>{JSON.stringify(state.result, null, 2)}</pre>
        </div>
      )}

      {state.status === "error" && (
        <p className="error">❌ Error: {state.error}</p>
      )}
    </div>
  );
}