interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export function ProgressBar({ completed, total, className = "" }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs opacity-70">{completed} / {total} completed</span>
        <span className="text-xs font-medium" style={{ color: "var(--accent-color, #6366f1)" }}>
          {percent}%
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-300/30 dark:bg-gray-600/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            backgroundColor: "var(--accent-color, #6366f1)",
          }}
        />
      </div>
    </div>
  );
}
