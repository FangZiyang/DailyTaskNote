import { AppData, DATA_VERSION, Task, AppSettings, DEFAULT_SETTINGS } from "../../shared/types";

export function validateImportData(raw: unknown): AppData | null {
  try {
    if (!raw || typeof raw !== "object") return null;
    const data = raw as Record<string, unknown>;

    if (!Array.isArray(data.tasks)) return null;

    const tasks = data.tasks.map((t: unknown) => validateTask(t)).filter(Boolean) as Task[];
    const settings = validateSettings(data.settings);
    const history = Array.isArray(data.history) ? data.history : [];
    const categories = Array.isArray(data.categories) ? data.categories : [];

    return {
      version: DATA_VERSION,
      tasks,
      settings,
      history,
      categories,
    };
  } catch {
    return null;
  }
}

function validateTask(raw: unknown): Task | null {
  try {
    if (!raw || typeof raw !== "object") return null;
    const t = raw as Record<string, unknown>;
    if (typeof t.title !== "string" || !t.title.trim()) return null;

    return {
      id: typeof t.id === "string" ? t.id : crypto.randomUUID(),
      title: t.title.trim(),
      description: typeof t.description === "string" ? t.description : undefined,
      completed: Boolean(t.completed),
      type: ["daily", "weekly", "monthly", "one-time"].includes(t.type as string)
        ? (t.type as Task["type"])
        : "daily",
      priority: ["low", "medium", "high"].includes(t.priority as string)
        ? (t.priority as Task["priority"])
        : "medium",
      category: typeof t.category === "string" ? t.category : undefined,
      reminderTime: typeof t.reminderTime === "string" ? t.reminderTime : undefined,
      reminderEnabled: Boolean(t.reminderEnabled),
      createdAt: typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
      updatedAt: typeof t.updatedAt === "string" ? t.updatedAt : new Date().toISOString(),
      completedAt: typeof t.completedAt === "string" ? t.completedAt : undefined,
      lastResetDate: typeof t.lastResetDate === "string" ? t.lastResetDate : undefined,
      lastNotificationDate: typeof t.lastNotificationDate === "string" ? t.lastNotificationDate : undefined,
      order: typeof t.order === "number" ? t.order : 0,
      archived: Boolean(t.archived),
    };
  } catch {
    return null;
  }
}

function validateSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  const s = raw as Record<string, unknown>;
  return { ...DEFAULT_SETTINGS, ...s } as AppSettings;
}

export function duplicateIdCheck(tasks: Task[]): Task[] {
  const seen = new Set<string>();
  return tasks.map((t) => {
    if (seen.has(t.id)) {
      return { ...t, id: crypto.randomUUID() };
    }
    seen.add(t.id);
    return t;
  });
}
