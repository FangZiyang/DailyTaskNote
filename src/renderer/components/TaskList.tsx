import { useState, useRef, useCallback } from "react";
import { Task } from "../../shared/types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  compactMode: boolean;
  highlightTaskId: string | null;
  onToggle: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export function TaskList({
  tasks,
  compactMode,
  highlightTaskId,
  onToggle,
  onUpdateTitle,
  onUpdateTask,
  onDelete,
  onArchive,
  onReorder,
}: TaskListProps) {
  const dragIndexRef = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, _index: number) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (toIndex: number) => {
      if (dragIndexRef.current !== null && dragIndexRef.current !== toIndex) {
        onReorder(dragIndexRef.current, toIndex);
      }
      dragIndexRef.current = null;
    },
    [onReorder]
  );

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="text-center opacity-50">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-2 opacity-40"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="13" y2="16" />
          </svg>
          <p className="text-sm">No tasks yet</p>
          <p className="text-xs mt-1">Type below to add one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5 scrollbar-thin">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          compactMode={compactMode}
          highlight={task.id === highlightTaskId}
          onToggle={onToggle}
          onUpdateTitle={onUpdateTitle}
          onUpdateTask={onUpdateTask}
          onDelete={onDelete}
          onArchive={onArchive}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          index={index}
        />
      ))}
    </div>
  );
}
