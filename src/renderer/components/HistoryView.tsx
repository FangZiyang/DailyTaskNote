import { Task, DailyRecord } from "../../shared/types";
import { getCompletionStats, getCurrentStreak, getLongestStreak, getDailyChartData } from "../services/historyService";
import { getLastNDays, formatRelativeDate } from "../utils/dateUtils";

interface HistoryViewProps {
  tasks: Task[];
  history: DailyRecord[];
  onClose: () => void;
}

export function HistoryView({ tasks, history, onClose }: HistoryViewProps) {
  const activeTasks = tasks.filter((t) => !t.archived && t.type !== "one-time");
  const todayCompleted = activeTasks.filter((t) => t.completed).length;
  const todayTotal = activeTasks.length;

  const stats = getCompletionStats(history, todayCompleted, todayTotal);
  const currentStreak = getCurrentStreak(history, todayCompleted, todayTotal);
  const longestStreak = getLongestStreak(history);
  const chartData = getDailyChartData(history, 14);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold">Statistics & History</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Today */}
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: "var(--accent-color, #6366f1)" }}>
              {stats.todayPercent}%
            </div>
            <p className="text-sm opacity-60">Today's Completion</p>
            <p className="text-xs opacity-40">{todayCompleted} / {todayTotal} tasks</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Current Streak" value={`${currentStreak} days`} />
            <StatCard label="Longest Streak" value={`${longestStreak} days`} />
            <StatCard label="Last 7 Days" value={`${stats.last7DaysPercent}%`} />
            <StatCard label="Last 30 Days" value={`${stats.last30DaysPercent}%`} />
          </div>

          {/* Chart */}
          <div>
            <h3 className="text-sm font-medium mb-3">Last 14 Days</h3>
            <div className="flex items-end gap-1 h-24">
              {chartData.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "80px" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t transition-all duration-300"
                      style={{
                        height: `${Math.max(d.percent, 2)}%`,
                        backgroundColor:
                          d.percent >= 80
                            ? "var(--accent-color, #6366f1)"
                            : d.percent >= 50
                            ? "#f59e0b"
                            : d.percent > 0
                            ? "#ef4444"
                            : "#e5e7eb",
                        opacity: d.percent > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                  <span className="text-[8px] opacity-40">
                    {d.date.split("-")[2]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent history */}
          <div>
            <h3 className="text-sm font-medium mb-3">Recent History</h3>
            <div className="space-y-1">
              {getLastNDays(7)
                .reverse()
                .map((date) => {
                  const record = history.find((h) => h.date === date);
                  const percent =
                    record && record.totalCount > 0
                      ? Math.round((record.completedCount / record.totalCount) * 100)
                      : 0;
                  return (
                    <div key={date} className="flex items-center gap-3 py-1.5">
                      <span className="text-xs w-16 opacity-60">{formatRelativeDate(date)}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: "var(--accent-color, #6366f1)",
                          }}
                        />
                      </div>
                      <span className="text-xs w-8 text-right opacity-60">
                        {record ? `${record.completedCount}/${record.totalCount}` : "-"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
      <div className="text-lg font-bold" style={{ color: "var(--accent-color, #6366f1)" }}>
        {value}
      </div>
      <p className="text-xs opacity-60">{label}</p>
    </div>
  );
}
