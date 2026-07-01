import { SearchBar } from "./SearchBar";
import { GenreFilter } from "./GenreFilter";

export function FiltersPanel() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Search &amp; Filters</h2>
      <SearchBar />
      <GenreFilter />
    </div>
  );
}
