import { Task, AppSettings } from "../../shared/types";
import { getTodayStr, isWithinQuietHours } from "../utils/dateUtils";

export function checkReminders(tasks: Task[], settings: AppSettings): Task[] {
  if (!settings.notificationsEnabled) return tasks;

  if (
    settings.quietHoursEnabled &&
    isWithinQuietHours(settings.quietHoursStart, settings.quietHoursEnd)
  ) {
    return tasks;
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const today = getTodayStr();

  const updatedTasks = tasks.map((task) => {
    if (
      !task.reminderEnabled ||
      !task.reminderTime ||
      task.completed ||
      task.archived
    ) {
      return task;
    }

    // Don't remind if already notified today
    if (task.lastNotificationDate === today) return task;

    // Check if it's time
    if (currentTime >= task.reminderTime) {
      try {
        window.electronAPI.showNotification(
          "DailyTaskBar Reminder",
          `Time to: ${task.title}`,
          task.id
        );
      } catch (err) {
        console.error("Failed to send notification:", err);
      }

      return {
        ...task,
        lastNotificationDate: today,
        updatedAt: new Date().toISOString(),
      };
    }

    return task;
  });

  return updatedTasks;
}
