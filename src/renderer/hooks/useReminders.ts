import { useEffect, useRef } from "react";
import { Task, AppSettings } from "../../shared/types";
import { checkReminders } from "../services/reminderService";

export function useReminders(
  tasks: Task[],
  settings: AppSettings,
  onUpdateTasks: (tasks: Task[]) => void
) {
  const tasksRef = useRef(tasks);
  const settingsRef = useRef(settings);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    // Check on interval
    const interval = setInterval(() => {
      const updated = checkReminders(tasksRef.current, settingsRef.current);
      const changed = updated.some((t, i) => t !== tasksRef.current[i]);
      if (changed) {
        onUpdateTasks(updated);
      }
    }, (settings.reminderCheckInterval || 60) * 1000);

    // Check when main process signals
    window.electronAPI.onCheckReminders(() => {
      const updated = checkReminders(tasksRef.current, settingsRef.current);
      const changed = updated.some((t, i) => t !== tasksRef.current[i]);
      if (changed) {
        onUpdateTasks(updated);
      }
    });

    return () => clearInterval(interval);
  }, [settings.reminderCheckInterval, onUpdateTasks]);
}
