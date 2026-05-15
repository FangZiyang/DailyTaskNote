import { AppData, DEFAULT_SETTINGS, DATA_VERSION, DEFAULT_TASKS, Task } from "../../shared/types";

let cachedData: AppData | null = null;

export async function loadAppData(): Promise<AppData> {
  try {
    const data = await window.electronAPI.getAppData();
    cachedData = data;
    return data;
  } catch (err) {
    console.error("Failed to load app data:", err);
    return getDefaultData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    cachedData = data;
    await window.electronAPI.saveAppData(data);
  } catch (err) {
    console.error("Failed to save app data:", err);
    throw err;
  }
}

export function getCachedData(): AppData | null {
  return cachedData;
}

function getDefaultData(): AppData {
  const now = new Date().toISOString();
  const tasks: Task[] = DEFAULT_TASKS.map((t, i) => ({
    id: `default-${i}-${Date.now()}`,
    title: t.title || "",
    completed: false,
    type: t.type || "daily",
    priority: t.priority || "medium",
    reminderEnabled: false,
    createdAt: now,
    updatedAt: now,
    order: i,
    archived: false,
  }));

  return {
    version: DATA_VERSION,
    tasks,
    settings: { ...DEFAULT_SETTINGS },
    history: [],
    categories: [],
  };
}

export async function getDataPath(): Promise<string> {
  try {
    return await window.electronAPI.getDataPath();
  } catch {
    return "Unknown";
  }
}
