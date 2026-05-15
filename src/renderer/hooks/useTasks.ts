import { useState, useEffect, useCallback } from "react";
import { Task, AppData, DailyRecord } from "../../shared/types";
import { loadAppData, saveAppData, getCachedData } from "../services/storageService";
import {
  createTask,
  toggleTask,
  updateTaskTitle,
  archiveTask,
  unarchiveTask,
  deleteTask,
  reorderTasks,
  filterTasks,
  sortTasks,
} from "../services/taskService";
import { resetTasks, recordDailyCompletion } from "../utils/resetUtils";
import { TaskType, TaskPriority } from "../../shared/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(
    async (newTasks: Task[], newHistory?: DailyRecord[], newCategories?: string[]) => {
      const cached = getCachedData();
      if (!cached) return;
      const data: AppData = {
        ...cached,
        tasks: newTasks,
        history: newHistory ?? history,
        categories: newCategories ?? categories,
      };
      await saveAppData(data);
    },
    [history, categories]
  );

  useEffect(() => {
    loadAppData().then((data) => {
      const { tasks: resetTasksResult, history: resetHistory } = resetTasks(data.tasks);
      const finalHistory = resetHistory
        ? [...data.history, ...resetHistory]
        : data.history;

      setTasks(resetTasksResult);
      setHistory(finalHistory);
      setCategories(data.categories || []);
      setLoading(false);

      // Persist if reset happened
      if (resetHistory) {
        persist(resetTasksResult, finalHistory, data.categories);
      }

      // Update tray tooltip
      updateTrayTooltip(resetTasksResult);
    });
  }, []);

  const addTask = useCallback(
    async (
      title: string,
      type?: TaskType,
      priority?: TaskPriority,
      options?: Partial<Task>
    ) => {
      const cached = getCachedData();
      const newTask = createTask(
        title,
        type || cached?.settings.defaultTaskType || "daily",
        priority || cached?.settings.defaultPriority || "medium",
        options
      );
      setTasks((prev) => {
        const next = [...prev, newTask];
        persist(next);
        updateTrayTooltip(next);
        return next;
      });
    },
    [persist]
  );

  const toggle = useCallback(
    async (id: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? toggleTask(t) : t));
        const newHistory = recordDailyCompletion(next, history);
        setHistory(newHistory);
        persist(next, newHistory);
        updateTrayTooltip(next);

        // Auto-archive completed one-time tasks
        const cached = getCachedData();
        if (cached?.settings.autoArchiveOneTime) {
          const task = next.find((t) => t.id === id);
          if (task?.completed && task?.type === "one-time") {
            const archived = next.map((t) => (t.id === id ? archiveTask(t) : t));
            persist(archived, newHistory);
            return archived;
          }
        }
        return next;
      });
    },
    [history, persist]
  );

  const updateTitle = useCallback(
    async (id: string, title: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? updateTaskTitle(t, title) : t));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const archive = useCallback(
    async (id: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? archiveTask(t) : t));
        persist(next);
        updateTrayTooltip(next);
        return next;
      });
    },
    [persist]
  );

  const unarchive = useCallback(
    async (id: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === id ? unarchiveTask(t) : t));
        persist(next);
        updateTrayTooltip(next);
        return next;
      });
    },
    [persist]
  );

  const remove = useCallback(
    async (id: string) => {
      setTasks((prev) => {
        const next = deleteTask(prev, id);
        persist(next);
        updateTrayTooltip(next);
        return next;
      });
    },
    [persist]
  );

  const reorder = useCallback(
    async (fromIndex: number, toIndex: number) => {
      setTasks((prev) => {
        const next = reorderTasks(prev, fromIndex, toIndex);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetToday = useCallback(async () => {
    setTasks((prev) => {
      const { tasks: reset, history: newEntries } = resetTasks(
        prev.map((t) => ({ ...t, lastResetDate: undefined }))
      );
      const newHistory = newEntries ? [...history, ...newEntries] : history;
      setHistory(newHistory);
      persist(reset, newHistory);
      updateTrayTooltip(reset);
      return reset;
    });
  }, [history, persist]);

  const batchDeleteCompleted = useCallback(async () => {
    setTasks((prev) => {
      const next = prev.filter((t) => !t.completed);
      persist(next);
      updateTrayTooltip(next);
      return next;
    });
  }, [persist]);

  const batchArchiveCompleted = useCallback(async () => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.completed ? archiveTask(t) : t));
      persist(next);
      updateTrayTooltip(next);
      return next;
    });
  }, [persist]);

  const importTasks = useCallback(
    async (importedTasks: Task[], importedHistory: DailyRecord[], importedCategories: string[]) => {
      const mergedTasks = [...tasks, ...importedTasks];
      const mergedHistory = [...history, ...importedHistory];
      const mergedCategories = [...new Set([...categories, ...importedCategories])];
      setTasks(mergedTasks);
      setHistory(mergedHistory);
      setCategories(mergedCategories);
      await persist(mergedTasks, mergedHistory, mergedCategories);
      updateTrayTooltip(mergedTasks);
    },
    [tasks, history, categories, persist]
  );

  const replaceAll = useCallback(
    async (newTasks: Task[], newHistory: DailyRecord[], newCategories: string[]) => {
      setTasks(newTasks);
      setHistory(newHistory);
      setCategories(newCategories);
      await persist(newTasks, newHistory, newCategories);
      updateTrayTooltip(newTasks);
    },
    [persist]
  );

  const addCategory = useCallback(
    async (category: string) => {
      if (!categories.includes(category)) {
        const next = [...categories, category];
        setCategories(next);
        await persist(tasks, history, next);
      }
    },
    [categories, tasks, history, persist]
  );

  const removeCategory = useCallback(
    async (category: string) => {
      const next = categories.filter((c) => c !== category);
      setCategories(next);
      await persist(tasks, history, next);
    },
    [categories, tasks, history, persist]
  );

  const getFilteredTasks = useCallback(
    (filter: string, searchQuery: string) => {
      return sortTasks(filterTasks(tasks, filter, searchQuery));
    },
    [tasks]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setTasks((prev) => {
        const next = prev.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        );
        persist(next);
        updateTrayTooltip(next);
        return next;
      });
    },
    [persist]
  );

  return {
    tasks,
    history,
    categories,
    loading,
    addTask,
    toggle,
    updateTitle,
    updateTask,
    archive,
    unarchive,
    remove,
    reorder,
    resetToday,
    batchDeleteCompleted,
    batchArchiveCompleted,
    importTasks,
    replaceAll,
    addCategory,
    removeCategory,
    getFilteredTasks,
  };
}

function updateTrayTooltip(tasks: Task[]) {
  const today = new Date().toISOString().split("T")[0];
  const active = tasks.filter((t) => !t.archived && (t.type === "one-time" ? !t.completed : true));
  const completed = active.filter((t) => t.completed).length;
  window.electronAPI.updateTrayTooltip(`DailyTaskBar - ${completed}/${active.length} completed`);
}
