import { Task, DailyRecord } from "../../shared/types";
import { getTodayStr, getWeekStart, getMonthStart, parseLocalDate } from "./dateUtils";

export function shouldResetTask(task: Task, today: string): boolean {
  if (task.archived) return false;
  if (task.type === "one-time") return false;

  const lastReset = task.lastResetDate || task.createdAt.split("T")[0];

  switch (task.type) {
    case "daily":
      return lastReset !== today;
    case "weekly":
      return getWeekStart(parseLocalDate(lastReset)) !== getWeekStart(parseLocalDate(today));
    case "monthly":
      return getMonthStart(parseLocalDate(lastReset)) !== getMonthStart(parseLocalDate(today));
    default:
      return false;
  }
}

export function resetTask(task: Task, today: string): Task {
  if (!shouldResetTask(task, today)) return task;

  return {
    ...task,
    completed: false,
    completedAt: undefined,
    lastResetDate: today,
    updatedAt: new Date().toISOString(),
  };
}

export function resetTasks(tasks: Task[]): { tasks: Task[]; history: DailyRecord[] | null } {
  const today = getTodayStr();
  let historyEntry: DailyRecord | null = null;

  // Record yesterday's completion before resetting
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const needsReset = tasks.some((t) => shouldResetTask(t, today));
  if (!needsReset) return { tasks, history: null };

  // Record today's stats before reset (tasks that were completed today)
  const todayCompleted = tasks.filter(
    (t) => !t.archived && t.completed && t.completedAt && t.completedAt.startsWith(today)
  ).length;
  const todayTotal = tasks.filter((t) => !t.archived && t.type !== "one-time").length;

  if (todayCompleted > 0 || todayTotal > 0) {
    historyEntry = {
      date: today,
      completedCount: todayCompleted,
      totalCount: todayTotal,
    };
  }

  const resetTasks = tasks.map((t) => resetTask(t, today));
  return { tasks: resetTasks, history: historyEntry ? [historyEntry] : null };
}

export function recordDailyCompletion(tasks: Task[], history: DailyRecord[]): DailyRecord[] {
  const today = getTodayStr();
  const activeTasks = tasks.filter((t) => !t.archived && t.type !== "one-time");
  const completedToday = activeTasks.filter((t) => t.completed).length;

  const existing = history.findIndex((h) => h.date === today);
  const entry: DailyRecord = {
    date: today,
    completedCount: completedToday,
    totalCount: activeTasks.length,
  };

  if (existing >= 0) {
    const updated = [...history];
    updated[existing] = entry;
    return updated;
  }
  return [...history, entry];
}
