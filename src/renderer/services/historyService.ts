import { DailyRecord } from "../../shared/types";
import { getLastNDays } from "../utils/dateUtils";

export function getCompletionStats(history: DailyRecord[], todayCompleted: number, todayTotal: number) {
  const today = new Date().toISOString().split("T")[0];
  const todayPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const last7 = getLastNDays(7);
  const last30 = getLastNDays(30);

  const avgCompletion = (days: string[]) => {
    const records = days
      .map((d) => {
        if (d === today) return { completed: todayCompleted, total: todayTotal };
        return history.find((h) => h.date === d);
      })
      .filter(Boolean) as { completed: number; total: number }[];

    if (records.length === 0) return 0;
    const totalCompleted = records.reduce((sum, r) => sum + r.completed, 0);
    const totalTasks = records.reduce((sum, r) => sum + r.total, 0);
    return totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  };

  return {
    todayPercent,
    last7DaysPercent: avgCompletion(last7),
    last30DaysPercent: avgCompletion(last30),
  };
}

export function getCurrentStreak(history: DailyRecord[], todayCompleted: number, todayTotal: number): number {
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;

  // Check if today is complete
  if (todayTotal > 0 && todayCompleted >= todayTotal) {
    streak = 1;
  }

  // Go backwards from yesterday
  for (let i = 1; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const record = history.find((h) => h.date === dateStr);
    if (record && record.totalCount > 0 && record.completedCount >= record.totalCount) {
      streak++;
    } else if (record) {
      break;
    } else {
      // No record for this day - might be before tracking started
      break;
    }
  }

  return streak;
}

export function getLongestStreak(history: DailyRecord[]): number {
  if (history.length === 0) return 0;

  const sorted = [...history]
    .filter((h) => h.totalCount > 0 && h.completedCount >= h.totalCount)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

export function getDailyChartData(history: DailyRecord[], days: number = 14): { date: string; percent: number }[] {
  const lastNDays = getLastNDays(days);
  return lastNDays.map((date) => {
    const record = history.find((h) => h.date === date);
    const percent =
      record && record.totalCount > 0
        ? Math.round((record.completedCount / record.totalCount) * 100)
        : 0;
    return { date, percent };
  });
}
