import { Task, TaskType, TaskPriority } from "../../shared/types";
import { generateId } from "../utils/idUtils";

export function createTask(
  title: string,
  type: TaskType = "daily",
  priority: TaskPriority = "medium",
  options?: Partial<Task>
): Task {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: title.trim(),
    completed: false,
    type,
    priority,
    reminderEnabled: false,
    createdAt: now,
    updatedAt: now,
    order: Date.now(),
    archived: false,
    ...options,
  };
}

export function toggleTask(task: Task): Task {
  const now = new Date().toISOString();
  return {
    ...task,
    completed: !task.completed,
    completedAt: !task.completed ? now : undefined,
    updatedAt: now,
  };
}

export function updateTaskTitle(task: Task, title: string): Task {
  return {
    ...task,
    title: title.trim(),
    updatedAt: new Date().toISOString(),
  };
}

export function archiveTask(task: Task): Task {
  return {
    ...task,
    archived: true,
    updatedAt: new Date().toISOString(),
  };
}

export function unarchiveTask(task: Task): Task {
  return {
    ...task,
    archived: false,
    updatedAt: new Date().toISOString(),
  };
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id);
}

export function reorderTasks(tasks: Task[], fromIndex: number, toIndex: number): Task[] {
  const result = [...tasks];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result.map((t, i) => ({ ...t, order: i }));
}

export function filterTasks(tasks: Task[], filter: string, searchQuery: string): Task[] {
  let filtered = tasks;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }

  switch (filter) {
    case "incomplete":
      return filtered.filter((t) => !t.completed && !t.archived);
    case "completed":
      return filtered.filter((t) => t.completed && !t.archived);
    case "high-priority":
      return filtered.filter((t) => t.priority === "high" && !t.archived);
    case "all":
    default:
      return filtered.filter((t) => !t.archived);
  }
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
    return a.order - b.order;
  });
}
