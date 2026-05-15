import { useState, useRef, useEffect } from "react";
import { Task, TaskPriority } from "../../shared/types";
import { formatTime } from "../utils/dateUtils";

interface TaskItemProps {
  task: Task;
  compactMode: boolean;
  highlight: boolean;
  onToggle: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  index: number;
}

const priorityColors: Record<TaskPriority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const typeLabels: Record<string, string> = {
  daily: "D",
  weekly: "W",
  monthly: "M",
  "one-time": "1",
};

export function TaskItem({
  task,
  compactMode,
  highlight,
  onToggle,
  onUpdateTitle,
  onUpdateTask,
  onDelete,
  onArchive,
  onDragStart,
  onDragOver,
  onDrop,
  index,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onUpdateTitle(task.id, editTitle.trim());
    } else {
      setEditTitle(task.title);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditTitle(task.title);
      setEditing(false);
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 cursor-grab active:cursor-grabbing
        ${highlight ? "ring-2 ring-amber-400 dark:ring-amber-500" : ""}
        ${task.completed ? "opacity-50" : "opacity-100"}
        hover:bg-black/5 dark:hover:bg-white/5
        ${compactMode ? "py-1" : "py-1.5"}
      `}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 no-drag"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
            ${task.completed ? "border-transparent" : "border-gray-400 dark:border-gray-500"}
          `}
          style={task.completed ? { backgroundColor: "var(--accent-color, #6366f1)" } : {}}
        >
          {task.completed && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </button>

      {/* Priority indicator */}
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: priorityColors[task.priority] }}
        title={`Priority: ${task.priority}`}
      />

      {/* Title */}
      <div className="flex-1 min-w-0 no-drag" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        {editing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-b border-gray-400 dark:border-gray-500 outline-none text-sm py-0.5"
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm truncate ${task.completed ? "line-through" : ""}`}
              onDoubleClick={() => {
                setEditTitle(task.title);
                setEditing(true);
              }}
            >
              {task.title}
            </span>
            {!compactMode && task.type !== "daily" && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 opacity-60">
                {typeLabels[task.type]}
              </span>
            )}
            {!compactMode && task.reminderEnabled && task.reminderTime && (
              <span className="text-[10px] opacity-50 flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatTime(task.reminderTime)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 top-6 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[140px]"
          >
            <button
              onClick={() => {
                setEditTitle(task.title);
                setEditing(true);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5"
            >
              Edit Title
            </button>
            <button
              onClick={() => {
                onArchive(task.id);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5"
            >
              Archive
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <div className="px-3 py-1 text-[10px] text-gray-400">Type</div>
            {(["daily", "weekly", "monthly", "one-time"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  onUpdateTask(task.id, { type: t });
                  setShowMenu(false);
                }}
                className={`w-full text-left px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5 ${
                  task.type === t ? "font-bold" : ""
                }`}
              >
                {t}
              </button>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <div className="px-3 py-1 text-[10px] text-gray-400">Priority</div>
            {(["low", "medium", "high"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  onUpdateTask(task.id, { priority: p });
                  setShowMenu(false);
                }}
                className={`w-full text-left px-3 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 ${
                  task.priority === p ? "font-bold" : ""
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: priorityColors[p] }}
                />
                {p}
              </button>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            {showDeleteConfirm ? (
              <div className="px-3 py-1.5">
                <p className="text-xs text-red-500 mb-1">Delete this task?</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setShowMenu(false);
                    }}
                    className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-0.5 text-xs rounded hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
