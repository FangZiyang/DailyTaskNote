import { useState } from "react";
import { Task, TaskType, TaskPriority, DailyRecord } from "../../shared/types";
import { formatTime } from "../utils/dateUtils";

interface ManagementViewProps {
  tasks: Task[];
  history: DailyRecord[];
  categories: string[];
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onBatchDeleteCompleted: () => void;
  onBatchArchiveCompleted: () => void;
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
}

export function ManagementView({
  tasks,
  categories,
  onClose,
  onUpdateTask,
  onDelete,
  onArchive,
  onUnarchive,
  onBatchDeleteCompleted,
  onBatchArchiveCompleted,
  onAddCategory,
  onRemoveCategory,
}: ManagementViewProps) {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [newCategory, setNewCategory] = useState("");

  const activeTasks = tasks.filter((t) => !t.archived);
  const archivedTasks = tasks.filter((t) => t.archived);
  const displayTasks = tab === "active" ? activeTasks : archivedTasks;

  const priorityColors: Record<TaskPriority, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#22c55e",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold">Task Management</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
          <button
            onClick={() => setTab("active")}
            className={`px-3 py-2 text-sm border-b-2 ${
              tab === "active" ? "border-current font-medium" : "border-transparent opacity-60"
            }`}
            style={tab === "active" ? { color: "var(--accent-color, #6366f1)" } : {}}
          >
            Active ({activeTasks.length})
          </button>
          <button
            onClick={() => setTab("archived")}
            className={`px-3 py-2 text-sm border-b-2 ${
              tab === "archived" ? "border-current font-medium" : "border-transparent opacity-60"
            }`}
            style={tab === "archived" ? { color: "var(--accent-color, #6366f1)" } : {}}
          >
            Archived ({archivedTasks.length})
          </button>
        </div>

        {/* Batch actions */}
        {tab === "active" && (
          <div className="flex gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onBatchArchiveCompleted}
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Archive Completed
            </button>
            <button
              onClick={onBatchDeleteCompleted}
              className="px-2 py-1 text-xs rounded bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              Delete Completed
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs opacity-60">Categories:</span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700"
              >
                {cat}
                <button
                  onClick={() => onRemoveCategory(cat)}
                  className="opacity-50 hover:opacity-100"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newCategory.trim()) {
                  onAddCategory(newCategory.trim());
                  setNewCategory("");
                }
              }}
            >
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="+ category"
                className="text-xs bg-transparent outline-none w-20"
              />
            </form>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {displayTasks.length === 0 ? (
            <div className="py-8 text-center opacity-50 text-sm">
              {tab === "active" ? "No active tasks" : "No archived tasks"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {displayTasks.map((task) => (
                <div key={task.id} className="px-4 py-2.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: priorityColors[task.priority] }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${task.completed ? "line-through opacity-60" : ""}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <select
                          value={task.type}
                          onChange={(e) => onUpdateTask(task.id, { type: e.target.value as TaskType })}
                          className="text-[10px] bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 outline-none"
                        >
                          <option value="daily">daily</option>
                          <option value="weekly">weekly</option>
                          <option value="monthly">monthly</option>
                          <option value="one-time">one-time</option>
                        </select>
                        <select
                          value={task.priority}
                          onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as TaskPriority })}
                          className="text-[10px] bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 outline-none"
                        >
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                        </select>
                        {task.reminderTime && (
                          <span className="text-[10px] opacity-50">{formatTime(task.reminderTime)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {tab === "active" ? (
                        <>
                          <button
                            onClick={() => onArchive(task.id)}
                            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 opacity-50 hover:opacity-100"
                            title="Archive"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="21 8 21 21 3 21 3 8" />
                              <rect x="1" y="3" width="22" height="5" />
                              <line x1="10" y1="12" x2="14" y2="12" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete(task.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 opacity-50 hover:opacity-100"
                            title="Delete"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onUnarchive(task.id)}
                          className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
