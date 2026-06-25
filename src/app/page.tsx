export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Book App</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Track the books you own, who you&apos;ve loaned them to, and when.
      </p>
      <p className="text-sm text-zinc-500">
        Project bootstrapped. The dashboard, library, and friends pages are
        coming next.
      </p>
    </div>
  );
}
