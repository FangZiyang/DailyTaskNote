import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  Notification,
  screen,
  shell,
} from "electron";
import path from "path";
import fs from "fs";
import { AppData, AppSettings, DEFAULT_SETTINGS, DEFAULT_TASKS, DATA_VERSION, Task } from "../shared/types";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const DATA_FILE = "dailytaskbar.json";
const BACKUP_FILE = "dailytaskbar.backup.json";

function getDataPath(): string {
  return path.join(app.getPath("userData"), DATA_FILE);
}

function getBackupPath(): string {
  return path.join(app.getPath("userData"), BACKUP_FILE);
}

function readData(): AppData {
  const dataPath = getDataPath();
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, "utf-8");
      const data = JSON.parse(raw) as AppData;
      return migrateData(data);
    }
  } catch (err) {
    console.error("Failed to read data file:", err);
    // Try backup
    try {
      const backupPath = getBackupPath();
      if (fs.existsSync(backupPath)) {
        const raw = fs.readFileSync(backupPath, "utf-8");
        const data = JSON.parse(raw) as AppData;
        return migrateData(data);
      }
    } catch {
      console.error("Backup file also corrupted");
    }
  }
  return getDefaultData();
}

function migrateData(data: AppData): AppData {
  if (!data.version || data.version < DATA_VERSION) {
    data.version = DATA_VERSION;
    data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    data.tasks = (data.tasks || []).map((t) => ({
      ...t,
      reminderEnabled: t.reminderEnabled ?? false,
      archived: t.archived ?? false,
      order: t.order ?? 0,
    }));
    data.history = data.history || [];
    data.categories = data.categories || [];
  }
  return data;
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

function saveData(data: AppData): void {
  const dataPath = getDataPath();
  const backupPath = getBackupPath();
  try {
    // Create backup of current file
    if (fs.existsSync(dataPath)) {
      fs.copyFileSync(dataPath, backupPath);
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save data:", err);
    throw err;
  }
}

function createTrayIcon(): Electron.NativeImage {
  const iconPath = path.join(__dirname, "../public/icon.png");
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  }
  // Fallback: create from data URL
  const fallback = nativeImage.createEmpty();
  return fallback;
}

function createWindow(): void {
  const data = readData();
  const settings = data.settings;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;

  let x = settings.windowX;
  let y = settings.windowY;
  if (!settings.rememberPosition || x === undefined || y === undefined) {
    x = screenW - settings.windowWidth - 20;
    y = screenH - settings.windowHeight - 60;
  }

  mainWindow = new BrowserWindow({
    width: settings.windowWidth,
    height: settings.windowHeight,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    resizable: true,
    minWidth: 300,
    minHeight: 200,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: !settings.startHiddenToTray,
  });

  mainWindow.setOpacity(settings.opacity);

  if (process.env.NODE_ENV === "development" || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("move", () => {
    if (settings.rememberPosition && mainWindow) {
      const bounds = mainWindow.getBounds();
      const d = readData();
      d.settings.windowX = bounds.x;
      d.settings.windowY = bounds.y;
      saveData(d);
    }
  });

  mainWindow.on("resize", () => {
    if (settings.rememberPosition && mainWindow) {
      const bounds = mainWindow.getBounds();
      const d = readData();
      d.settings.windowWidth = bounds.width;
      d.settings.windowHeight = bounds.height;
      saveData(d);
    }
  });
}

function createTray(): void {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip("DailyTaskBar - Loading...");
  updateTrayMenu();

  tray.on("double-click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function updateTrayMenu(): void {
  if (!tray) return;
  const data = readData();
  const today = new Date().toISOString().split("T")[0];
  const activeTasks = data.tasks.filter(
    (t) => !t.archived && shouldShowTaskForDate(t, today)
  );
  const completed = activeTasks.filter((t) => t.completed).length;
  const total = activeTasks.length;

  const menu = Menu.buildFromTemplate([
    {
      label: mainWindow?.isVisible() ? "Hide" : "Show",
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
    },
    { type: "separator" },
    {
      label: "Compact Mode",
      type: "radio",
      checked: data.settings.compactMode,
      click: () => {
        const d = readData();
        d.settings.compactMode = true;
        saveData(d);
        mainWindow?.webContents.send("settings-changed", d.settings);
      },
    },
    {
      label: "Expanded Mode",
      type: "radio",
      checked: !data.settings.compactMode,
      click: () => {
        const d = readData();
        d.settings.compactMode = false;
        saveData(d);
        mainWindow?.webContents.send("settings-changed", d.settings);
      },
    },
    { type: "separator" },
    {
      label: "Always on Top",
      type: "checkbox",
      checked: data.settings.alwaysOnTop,
      click: (menuItem) => {
        const d = readData();
        d.settings.alwaysOnTop = menuItem.checked;
        saveData(d);
        mainWindow?.setAlwaysOnTop(menuItem.checked);
        mainWindow?.webContents.send("settings-changed", d.settings);
      },
    },
    { type: "separator" },
    {
      label: "Reset Today's Tasks",
      click: () => {
        mainWindow?.webContents.send("reset-today");
      },
    },
    {
      label: "Add Quick Task",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send("focus-add-input");
      },
    },
    {
      label: "Settings",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send("open-settings");
      },
    },
    { type: "separator" },
    {
      label: `Progress: ${completed}/${total} completed`,
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
  tray.setToolTip(`DailyTaskBar - ${completed}/${total} completed`);
}

function shouldShowTaskForDate(task: Task, dateStr: string): boolean {
  if (task.archived) return false;
  if (task.type === "one-time") return !task.completed;
  return true;
}

// IPC Handlers
function setupIPC(): void {
  ipcMain.handle("get-app-data", () => readData());

  ipcMain.handle("save-app-data", (_event, data: AppData) => {
    saveData(data);
    updateTrayMenu();
  });

  ipcMain.handle("get-data-path", () => getDataPath());

  ipcMain.on("window-minimize", () => mainWindow?.minimize());

  ipcMain.on("window-close", () => {
    mainWindow?.hide();
  });

  ipcMain.on("window-set-always-on-top", (_event, flag: boolean) => {
    mainWindow?.setAlwaysOnTop(flag);
  });

  ipcMain.on("window-set-opacity", (_event, opacity: number) => {
    mainWindow?.setOpacity(opacity);
  });

  ipcMain.handle("window-get-bounds", () => {
    return mainWindow?.getBounds() || { x: 0, y: 0, width: 380, height: 520 };
  });

  ipcMain.on("show-notification", (_event, title: string, body: string, taskId?: string) => {
    try {
      if (Notification.isSupported()) {
        const notif = new Notification({
          title,
          body,
          silent: false,
        });
        notif.on("click", () => {
          mainWindow?.show();
          mainWindow?.focus();
          if (taskId) {
            mainWindow?.webContents.send("highlight-task", taskId);
          }
        });
        notif.show();
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  });

  ipcMain.on("set-autostart", (_event, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: app.getPath("exe"),
    });
  });

  ipcMain.handle("get-autostart", () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.on("quit-app", () => {
    isQuitting = true;
    app.quit();
  });

  ipcMain.on("tray-update-tooltip", (_event, text: string) => {
    tray?.setToolTip(text);
  });

  ipcMain.on("set-startup-hide", (_event, hide: boolean) => {
    const data = readData();
    data.settings.startHiddenToTray = hide;
    saveData(data);
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    setupIPC();
    createWindow();
    createTray();

    // Start reminder check interval
    setInterval(() => {
      mainWindow?.webContents.send("check-reminders");
    }, 60000);
  });

  app.on("window-all-closed", () => {
    // Keep running in tray
  });

  app.on("activate", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  app.on("before-quit", () => {
    isQuitting = true;
  });
}
