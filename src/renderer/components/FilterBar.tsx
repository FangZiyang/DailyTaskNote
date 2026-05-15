import { FilterType } from "../../shared/types";

interface FilterBarProps {
  activeFilter: FilterType;
  searchQuery: string;
  showCompleted: boolean;
  onFilterChange: (filter: FilterType) => void;
  onSearchChange: (query: string) => void;
  onToggleCompleted: () => void;
  onOpenHistory: () => void;
}

export function FilterBar({
  activeFilter,
  searchQuery,
  showCompleted,
  onFilterChange,
  onSearchChange,
  onToggleCompleted,
  onOpenHistory,
}: FilterBarProps) {
  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "incomplete", label: "Todo" },
    { id: "completed", label: "Done" },
    { id: "high-priority", label: "High" },
  ];

  return (
    <div className="px-2 py-1.5 border-b border-gray-200/30 dark:border-gray-700/30">
      <div className="flex items-center gap-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`px-1.5 py-0.5 text-[10px] rounded transition-all ${
              activeFilter === f.id
                ? "text-white"
                : "opacity-50 hover:opacity-80"
            }`}
            style={
              activeFilter === f.id
                ? { backgroundColor: "var(--accent-color, #6366f1)" }
                : {}
            }
          >
            {f.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onToggleCompleted}
          className={`p-0.5 rounded ${showCompleted ? "opacity-60" : "opacity-30"}`}
          title={showCompleted ? "Hide completed" : "Show completed"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {showCompleted ? (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
        </button>
        <button
          onClick={onOpenHistory}
          className="p-0.5 rounded opacity-50 hover:opacity-80"
          title="Statistics"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
      </div>
      <div className="mt-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-black/5 dark:bg-white/5 rounded px-2 py-1 text-xs outline-none placeholder:opacity-40"
          id="search-input"
        />
      </div>
    </div>
  );
}
