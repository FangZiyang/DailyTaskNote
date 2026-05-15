interface HeaderProps {
  compactMode: boolean;
  completedCount: number;
  totalCount: number;
  onToggleCompact: () => void;
  onOpenSettings: () => void;
  onOpenManagement: () => void;
  onMinimize: () => void;
  onClose: () => void;
}

export function Header({
  compactMode,
  completedCount,
  totalCount,
  onToggleCompact,
  onOpenSettings,
  onOpenManagement,
  onMinimize,
  onClose,
}: HeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 drag-region"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: "var(--accent-color, #6366f1)" }}
        >
          D
        </div>
        <span className="text-sm font-semibold">DailyTaskBar</span>
        <span className="text-xs opacity-60">
          {completedCount}/{totalCount}
        </span>
      </div>
      <div className="flex items-center gap-0.5 no-drag" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <button
          onClick={onOpenManagement}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-xs"
          title="Manage Tasks"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button
          onClick={onToggleCompact}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-xs"
          title={compactMode ? "Expanded Mode" : "Compact Mode"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {compactMode ? (
              <>
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </>
            ) : (
              <>
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </>
            )}
          </svg>
        </button>
        <button
          onClick={onOpenSettings}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-xs"
          title="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button
          onClick={onMinimize}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-xs"
          title="Minimize"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-red-500/80 hover:text-white text-xs"
          title="Close to Tray"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
