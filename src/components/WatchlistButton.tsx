type WatchlistButtonProps = {
  inWatchlist: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function WatchlistButton({
  inWatchlist,
  onClick,
  disabled = false,
}: WatchlistButtonProps) {
  const label = inWatchlist ? "Remove from watchlist" : "Add to watchlist";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
    >
      {inWatchlist ? "−" : "+"}
    </button>
  );
}
