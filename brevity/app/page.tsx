import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Brevity
        </h1>
        <p className="max-w-xl text-zinc-400">
          The micro-est microblog. Session 0 scaffold — timeline and posting
          arrive in Session 2.
        </p>
        <p className="text-sm text-zinc-500">
          API: {process.env.NEXT_PUBLIC_API_URL ?? "(unset)"} · Analytics:{" "}
          {process.env.NEXT_PUBLIC_ANALYTICS_URL ?? "(unset)"}
        </p>
      </main>
    </>
  );
}
