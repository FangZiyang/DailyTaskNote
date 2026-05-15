export type TaskType = "daily" | "weekly" | "monthly" | "one-time";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  type: TaskType;
  priority: TaskPriority;
  category?: string;
  reminderTime?: string;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  lastResetDate?: string;
  lastNotificationDate?: string;
  order: number;
  archived: boolean;
}

export interface AppSettings {
  // Window
  opacity: number;
  alwaysOnTop: boolean;
  compactMode: boolean;
  rememberPosition: boolean;
  startHiddenToTray: boolean;
  windowX?: number;
  windowY?: number;
  windowWidth: number;
  windowHeight: number;

  // Task defaults
  defaultTaskType: TaskType;
  defaultPriority: TaskPriority;
  showCompletedTasks: boolean;
  autoArchiveOneTime: boolean;

  // Reminders
  notificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  reminderCheckInterval: number;

  // Appearance
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  accentColor: string;
  transparencyReadability: boolean;
}

export interface DailyRecord {
  date: string;
  completedCount: number;
  totalCount: number;
}

export interface AppData {
  version: number;
  tasks: Task[];
  settings: AppSettings;
  history: DailyRecord[];
  categories: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  opacity: 0.95,
  alwaysOnTop: true,
  compactMode: false,
  rememberPosition: true,
  startHiddenToTray: false,
  windowWidth: 380,
  windowHeight: 520,

  defaultTaskType: "daily",
  defaultPriority: "medium",
  showCompletedTasks: true,
  autoArchiveOneTime: true,

  notificationsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  reminderCheckInterval: 60,

  theme: "system",
  fontSize: "medium",
  accentColor: "#6366f1",
  transparencyReadability: true,
};

export const DEFAULT_TASKS: Partial<Task>[] = [
  { title: "背单词", type: "daily", priority: "high" },
  { title: "刷一道递归题", type: "daily", priority: "high" },
  { title: "PTE Repeat Sentence", type: "daily", priority: "high" },
  { title: "PTE Write Dictation", type: "daily", priority: "medium" },
  { title: "投递/查看岗位", type: "daily", priority: "medium" },
  { title: "论文写作 30 分钟", type: "daily", priority: "high" },
];

export const DATA_VERSION = 1;

export type FilterType = "all" | "incomplete" | "completed" | "high-priority";
export type ViewMode = "main" | "management" | "history" | "settings";

export interface IPCChannels {
  "get-app-data": () => AppData;
  "save-app-data": (data: AppData) => void;
  "get-data-path": () => string;
  "window-minimize": () => void;
  "window-close": () => void;
  "window-set-always-on-top": (flag: boolean) => void;
  "window-set-opacity": (opacity: number) => void;
  "window-set-size": (width: number, height: number) => void;
  "window-get-bounds": () => { x: number; y: number; width: number; height: number };
  "show-notification": (title: string, body: string, taskId?: string) => void;
  "set-autostart": (enabled: boolean) => void;
  "get-autostart": () => boolean;
  "quit-app": () => void;
  "tray-update-tooltip": (text: string) => void;
  "set-startup-hide": (hide: boolean) => void;
}
