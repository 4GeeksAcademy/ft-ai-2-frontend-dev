import { useState } from "react";

type MobileSection = "filters" | "results" | "watchlist";

type MobileNavProps = {
  activeSection: MobileSection;
  onSectionChange: (section: MobileSection) => void;
};

const sections: { id: MobileSection; label: string }[] = [
  { id: "filters", label: "Search & Filters" },
  { id: "results", label: "Movies" },
  { id: "watchlist", label: "Watchlist" },
];

export function MobileNav({ activeSection, onSectionChange }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const activeLabel =
    sections.find((section) => section.id === activeSection)?.label ?? "Menu";

  return (
    <div className="border-b border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-100"
      >
        <span>{activeLabel}</span>
        <span aria-hidden="true" className="text-slate-500 dark:text-slate-400">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <nav className="border-t border-slate-100 px-2 py-2 dark:border-slate-800">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                onSectionChange(section.id);
                setOpen(false);
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                activeSection === section.id
                  ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export type { MobileSection };
